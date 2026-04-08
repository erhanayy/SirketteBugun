import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getAnnouncements(tenantId: string) {
    // Simple query to get posts for a tenant
    // In a real app, join with users to get author name
    return await db
        .select({
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt,
            authorName: users.fullName
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .where(eq(posts.tenantId, tenantId))
        .orderBy(desc(posts.createdAt));
}
