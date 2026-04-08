'use server';

import { db } from "@/lib/db";
import { sposts, spostMedia, spostComments, spostReactions, parameters, tenantUsers } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification";
import { checkIsPremium, getSystemLimits } from "./premium";

// --- Parameters ---
export async function getSpostsRenderCount() {
    try {
        const param = await db.query.parameters.findFirst({
            where: eq(parameters.code, 'sposts_render_count')
        });
        return param?.dataInt || 10;
    } catch {
        return 10;
    }
}

// --- Notifications ---
export async function getUnreadSpostsCount() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return 0;

    try {
        const membership = await db.query.tenantUsers.findFirst({
            where: and(
                eq(tenantUsers.userId, tenantData.userId),
                eq(tenantUsers.tenantId, tenantData.tenantId)
            )
        });

        if (!membership) return 0;

        const countResult = await db.execute(sql`
            SELECT count(*) as unread_count 
            FROM sposts 
            WHERE tenant_id = ${tenantData.tenantId} 
              AND user_id != ${tenantData.userId}
              AND is_active = true 
              AND created_at > ${membership.lastSeenSpostsAt.toISOString()}
        `);

        return Number(countResult.rows[0].unread_count) || 0;
    } catch (error) {
        console.error("Failed to fetch unread sposts count:", error);
        return 0;
    }
}

export async function markSpostsAsRead() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false };

    try {
        await db.update(tenantUsers)
            .set({ lastSeenSpostsAt: new Date() })
            .where(and(
                eq(tenantUsers.userId, tenantData.userId),
                eq(tenantUsers.tenantId, tenantData.tenantId)
            ));

        return { success: true };
    } catch (error) {
        console.error("Failed to mark sposts as read:", error);
        return { success: false };
    }
}

// --- Fetch Posts (Sayfalama - Pagination) ---
export async function getSposts(offset: number = 0, limit?: number) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    const fetchLimit = limit || await getSpostsRenderCount();

    try {
        const data = await db.query.sposts.findMany({
            where: and(
                eq(sposts.tenantId, tenantData.tenantId),
                eq(sposts.isActive, true)
            ),
            with: {
                user: true,
                media: true,
                comments: {
                    where: eq(spostComments.isActive, true),
                    with: { user: true },
                    orderBy: (comments, { asc }) => [asc(comments.createdAt)]
                },
                reactions: {
                    with: { user: true }
                }
            },
            orderBy: [desc(sposts.createdAt)],
            limit: fetchLimit,
            offset: offset,
        });
        return data;
    } catch (error) {
        console.error("Failed to fetch sposts:", error);
        return [];
    }
}

// --- Create Post ---
export async function createSpost(content: string, mediaItems: { url: string, type: 'image' | 'video' | 'document' }[] = []) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: "Oturum bulunamadı." };

    try {
        const isPremium = await checkIsPremium();
        const limits = await getSystemLimits();
        if (!isPremium) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const countResult = await db.execute(sql`
                SELECT count(*) as post_count 
                FROM sposts 
                WHERE tenant_id = ${tenantData.tenantId} 
                  AND user_id = ${tenantData.userId}
                  AND created_at >= ${startOfDay.toISOString()}
            `);
            const currentCount = Number(countResult.rows[0].post_count) || 0;

            if (currentCount >= limits.postDailyLimit) {
                return { success: false, error: "Günlük paylaşım limitinizi doldurdunuz. Sınırsız paylaşım için Premium'a geçin." };
            }
        }

        // Enforce media count limits (photos)
        const photoCount = mediaItems.filter(m => m.type === 'image').length;
        const maxPhotos = isPremium ? limits.premiumPhotoCountPerPost : limits.photoCountPerPost;

        if (photoCount > maxPhotos) {
            return {
                success: false,
                error: `Bir gönderide en fazla ${maxPhotos} adet fotoğraf paylaşabilirsiniz.${!isPremium ? " Daha fazla fotoğraf için Premium'a geçin." : ""}`
            };
        }

        const [newPost] = await db.insert(sposts).values({
            tenantId: tenantData.tenantId,
            userId: tenantData.userId,
            content: content
        }).returning();

        if (mediaItems.length > 0) {
            const mediaInserts = mediaItems.map(m => ({
                spostId: newPost.id,
                url: m.url,
                type: m.type as 'image' | 'video' | 'document'
            }));
            await db.insert(spostMedia).values(mediaInserts);
        }

        const members = await db.query.tenantUsers.findMany({
            where: and(eq(tenantUsers.tenantId, tenantData.tenantId), eq(tenantUsers.isActive, true)),
            columns: { userId: true }
        });
        const targetIds = members.map(m => m.userId).filter(id => id !== tenantData.userId);

        await createNotification(
            tenantData.tenantId,
            targetIds,
            'post',
            `Yeni Paylaşım`,
            content.substring(0, 100) + '...',
            `/dashboard/home`
        );

        revalidatePath("/dashboard/home");
        return { success: true };
    } catch (error) {
        console.error("Failed to create spost:", error);
        return { success: false, error: "Gönderi paylaşılamadı." };
    }
}

// --- Soft Delete Post ---
export async function deleteSpost(spostId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: "Oturum bulunamadı." };

    try {
        const post = await db.query.sposts.findFirst({
            where: and(
                eq(sposts.id, spostId),
                eq(sposts.tenantId, tenantData.tenantId)
            )
        });

        if (!post) {
            return { success: false, error: "Gönderi bulunamadı." };
        }

        const canDelete = post.userId === tenantData.userId || tenantData.userRole === 'admin' || tenantData.userRole === 'staff';

        if (!canDelete) {
            return { success: false, error: "Bu gönderiyi silme yetkiniz yok." };
        }

        await db.update(sposts)
            .set({ isActive: false })
            .where(eq(sposts.id, spostId));

        revalidatePath("/dashboard/home");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete spost:", error);
        return { success: false, error: "Gönderi silinemedi." };
    }
}

// --- Create Comment ---
export async function createSpostComment(spostId: string, content: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: "Oturum bulunamadı." };

    try {
        await db.insert(spostComments).values({
            spostId,
            userId: tenantData.userId,
            content
        });

        revalidatePath("/dashboard/home");
        return { success: true };
    } catch (error) {
        console.error("Failed to create comment:", error);
        return { success: false, error: "Yorum yapılamadı." };
    }
}

// --- Soft Delete Comment ---
export async function deleteSpostComment(commentId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: "Oturum bulunamadı." };

    try {
        const comment = await db.query.spostComments.findFirst({
            where: eq(spostComments.id, commentId)
        });

        if (!comment) return { success: false, error: "Yorum bulunamadı." };

        const canDelete = comment.userId === tenantData.userId || tenantData.userRole === 'admin' || tenantData.userRole === 'staff';

        if (!canDelete) {
            return { success: false, error: "Bu yorumu silme yetkiniz yok." };
        }

        await db.update(spostComments)
            .set({ isActive: false })
            .where(eq(spostComments.id, commentId));

        revalidatePath("/dashboard/home");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete comment:", error);
        return { success: false, error: "Yorum silinemedi." };
    }
}

// --- Toggle Reaction ---
export async function toggleSpostReaction(spostId: string, emoji: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: "Oturum bulunamadı." };

    try {
        const existing = await db.query.spostReactions.findFirst({
            where: and(
                eq(spostReactions.spostId, spostId),
                eq(spostReactions.userId, tenantData.userId)
            )
        });

        if (existing) {
            if (existing.emoji === emoji) {
                // If same emoji clicked, remove it
                await db.delete(spostReactions).where(
                    and(
                        eq(spostReactions.spostId, spostId),
                        eq(spostReactions.userId, tenantData.userId)
                    )
                );
            } else {
                // Change emoji
                await db.update(spostReactions)
                    .set({ emoji })
                    .where(
                        and(
                            eq(spostReactions.spostId, spostId),
                            eq(spostReactions.userId, tenantData.userId)
                        )
                    );
            }
        } else {
            // New reaction
            await db.insert(spostReactions).values({
                spostId,
                userId: tenantData.userId,
                emoji
            });
        }

        revalidatePath("/dashboard/home");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle reaction:", error);
        return { success: false, error: "Tepki işlenemedi." };
    }
}
