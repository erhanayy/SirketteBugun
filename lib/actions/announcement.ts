'use server';

import { db } from "@/lib/db";
import { posts, users, postAttachments, tenantUsers } from "@/lib/db/schema";
import { eq, and, desc, asc, gt, sql, count } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createNotification } from "./notification";

// --- Helpers ---

async function saveFile(file: File, tenantId: string): Promise<{ url: string, type: string, name: string } | null> {
    if (!file || file.size === 0) return null;

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean filename and make unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '');

        // Define path: public/uploads/[tenantId]/
        const uploadDir = path.join(process.cwd(), "public", "uploads", tenantId);

        await mkdir(uploadDir, { recursive: true });

        await writeFile(path.join(uploadDir, filename), buffer);

        return {
            url: `/uploads/${tenantId}/${filename}`,
            type: file.type.startsWith('image/') ? 'image' : 'file',
            name: file.name
        };
    } catch (error) {
        console.error("File Save Error:", error);
        throw new Error("Dosya yüklenirken hata oluştu.");
    }
}

// --- Actions ---

export async function createAnnouncement(prevState: any, formData: FormData) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { message: "Oturum hatası.", success: false };

    const { tenantId, userId, userRole } = tenantData;

    // RBAC: Admin only
    const allowedRoles = ['admin'];
    if (!allowedRoles.includes(userRole)) {
        return { message: "Duyuru oluşturma yetkiniz yok.", success: false };
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const isPinned = formData.get("isPinned") === 'on';

    // Handle multiple files
    const files = formData.getAll("files") as File[];
    console.log("Create Announcement - Files received:", files.length);
    files.forEach((f, i) => console.log(`File ${i}: name=${f.name}, size=${f.size}, type=${f.type}`));

    if (!title || title.length < 3) return { message: "Başlık en az 3 karakter olmalıdır.", success: false };
    if (!content || content.length < 5) return { message: "İçerik en az 5 karakter olmalıdır.", success: false };

    try {
        // 1. Create Post
        const [newPost] = await db.insert(posts).values({
            tenantId,
            userId,
            title,
            content,
            mediaUrl: null, // Deprecated or used for main image if needed, keeping null for now as we use attachments
            isPinned,
            isActive: true
        }).returning();

        // 2. Process Files
        if (files && files.length > 0) {
            for (const file of files) {
                if (file.size > 0 && file.size <= 5 * 1024 * 1024) { // 5MB limit check per file
                    // Validate Image or PDF
                    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                        return { message: "Sadece resim veya PDF dosyaları yüklenebilir.", success: false };
                    }
                    const savedFile = await saveFile(file, tenantId);
                    if (savedFile) {
                        await db.insert(postAttachments).values({
                            postId: newPost.id,
                            fileName: savedFile.name,
                            fileUrl: savedFile.url,
                            fileType: savedFile.type,
                            isActive: true
                        });
                    }
                }
            }
        }

        // 3. Create Notification for all members except the author
        const members = await db.query.tenantUsers.findMany({
            where: and(eq(tenantUsers.tenantId, tenantId), eq(tenantUsers.isActive, true)),
            columns: { userId: true }
        });
        const targetIds = members.map(m => m.userId).filter(id => id !== userId);

        if (targetIds.length > 0) {
            await createNotification(
                tenantId,
                targetIds,
                'announcement',
                `Yeni Duyuru: ${title}`,
                content.substring(0, 100) + '...',
                `/dashboard/announcements`
            );
        }

        revalidatePath("/dashboard/announcements");
        revalidatePath("/dashboard");
        return { message: "Duyuru başarıyla oluşturuldu.", success: true };

    } catch (error: any) {
        console.error("Create Announcement Error:", error);
        return { message: "Veritabanı hatası oluştu.", success: false };
    }
}

export async function getAnnouncements(limit = 20, offset = 0) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    try {
        const activePosts = await db.query.posts.findMany({
            where: and(
                eq(posts.tenantId, tenantData.tenantId),
                eq(posts.isActive, true)
            ),
            orderBy: [desc(posts.isPinned), desc(posts.createdAt)], // Pinned first, then new
            limit: limit,
            offset: offset,
            with: {
                // author info if needed, schema default relation name is usually 'user' if defined
                // adjusting based on schema relations
                attachments: {
                    where: eq(postAttachments.isActive, true)
                }
            }
        });

        return activePosts;
    } catch (error) {
        console.error("Get Announcements Error:", error);
        return [];
    }
}

export async function getAnnouncement(id: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    try {
        return await db.query.posts.findFirst({
            where: and(
                eq(posts.id, id),
                eq(posts.tenantId, tenantData.tenantId),
                eq(posts.isActive, true)
            )
        });
    } catch (error) {
        return null;
    }
}

export async function deleteAnnouncement(id: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, message: "Auth Error" };
    const { userRole } = tenantData;

    const allowedRoles = ['admin'];
    if (!allowedRoles.includes(userRole)) {
        return { message: "Yetkisiz işlem.", success: false };
    }

    try {
        await db.update(posts)
            .set({ isActive: false })
            .where(and(eq(posts.id, id), eq(posts.tenantId, tenantData.tenantId)));

        revalidatePath("/dashboard/announcements");
        return { success: true, message: "Duyuru silindi." };
    } catch (error) {
        return { success: false, message: "Silme hatası." };
    }
}

export async function togglePinAnnouncement(id: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false };
    const { userRole } = tenantData;

    if (!['admin'].includes(userRole)) return { success: false };

    try {
        const post = await db.query.posts.findFirst({
            where: and(eq(posts.id, id), eq(posts.tenantId, tenantData.tenantId))
        });
        if (!post) return { success: false };

        await db.update(posts)
            .set({ isPinned: !post.isPinned })
            .where(and(eq(posts.id, id), eq(posts.tenantId, tenantData.tenantId)));

        revalidatePath("/dashboard/announcements");
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function getUnreadAnnouncementCount() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return 0;

    const { tenantId, userId } = tenantData;

    try {
        // 1. Get user's last seen timestamp
        const tenantUser = await db.query.tenantUsers.findFirst({
            where: and(
                eq(tenantUsers.tenantId, tenantId),
                eq(tenantUsers.userId, userId)
            ),
            columns: { lastSeenAnnouncementsAt: true }
        });

        const lastSeen = tenantUser?.lastSeenAnnouncementsAt || new Date(0); // Default to epoch if null/missing

        // 2. Count active posts created AFTER lastSeen using SQL count() for performance
        const countRes = await db.select({ count: count() })
            .from(posts)
            .where(and(
                eq(posts.tenantId, tenantId),
                eq(posts.isActive, true),
                gt(posts.createdAt, lastSeen)
            ));

        return countRes[0]?.count || 0;

    } catch (error) {
        console.error("Get Unread Count Error:", error);
        return 0;
    }
}

export async function markAnnouncementsAsRead() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false };

    const { tenantId, userId } = tenantData;

    try {
        await db.update(tenantUsers)
            .set({ lastSeenAnnouncementsAt: new Date() })
            .where(and(
                eq(tenantUsers.tenantId, tenantId),
                eq(tenantUsers.userId, userId)
            ));

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Mark Read Error:", error);
        return { success: false };
    }
}
