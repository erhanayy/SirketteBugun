'use server'

import { db } from "@/lib/db";
import { posts, tenantUsers } from "@/lib/db/schema";
import { createPostSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { createNotification } from "./notification";

export async function createAnnouncement(formData: FormData) {
    // TODO: Get real tenantId and userId from session
    // For now, we will expect them to be passed as hidden fields or inferred
    const rawData = {
        title: formData.get("title"),
        content: formData.get("content"),
        tenantId: formData.get("tenantId"),
        userId: formData.get("userId"),
        // mediaUrl handling would go here (upload logic)
    };

    const validatedData = createPostSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { error: validatedData.error.flatten().fieldErrors };
    }

    try {
        const [insertedPost] = await db.insert(posts).values({
            title: validatedData.data.title,
            content: validatedData.data.content,
            tenantId: validatedData.data.tenantId,
            userId: validatedData.data.userId,
            isPinned: false
        }).returning({ id: posts.id });

        const members = await db.query.tenantUsers.findMany({
            where: and(eq(tenantUsers.tenantId, validatedData.data.tenantId), eq(tenantUsers.isActive, true)),
            columns: { userId: true }
        });
        const targetIds = members.map(m => m.userId).filter(id => id !== validatedData.data.userId);

        await createNotification(
            validatedData.data.tenantId,
            targetIds,
            'announcement',
            `Yeni Duyuru: ${validatedData.data.title}`,
            validatedData.data.content.substring(0, 100) + '...',
            `/dashboard/announcements`
        );

        revalidatePath("/dashboard/announcements");
        return { success: true };
    } catch (error) {
        console.error("Failed to create announcement:", error);
        return { error: "Failed to create announcement" };
    }
}
