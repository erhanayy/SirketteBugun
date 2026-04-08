"use server";

import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createNote(data: {
    tenantId: string;
    userId: string;
    title?: string;
    content: string;
    color: string;
}) {
    try {
        await db.insert(notes).values({
            tenantId: data.tenantId,
            userId: data.userId,
            title: data.title,
            content: data.content,
            color: data.color || 'yellow',
        });

        revalidatePath("/dashboard/notes");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating note:", error);
        return { success: false, error: error.message };
    }
}

export async function updateNote(id: string, data: {
    title?: string;
    content: string;
    color: string;
}) {
    try {
        await db.update(notes).set({
            title: data.title,
            content: data.content,
            color: data.color,
            updatedAt: new Date()
        }).where(eq(notes.id, id));

        revalidatePath("/dashboard/notes");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating note:", error);
        return { success: false, error: error.message };
    }
}

export async function getMyNotes(tenantId: string, userId: string) {
    try {
        const list = await db.query.notes.findMany({
            where: and(
                eq(notes.tenantId, tenantId),
                eq(notes.userId, userId)
            ),
            orderBy: [desc(notes.createdAt)],
        });
        return { success: true, data: list };
    } catch (error: any) {
        console.error("Error fetching notes:", error);
        return { success: false, data: [] };
    }
}

export async function deleteNote(id: string) {
    try {
        await db.delete(notes).where(eq(notes.id, id));
        revalidatePath("/dashboard/notes");
        return { success: true };
    } catch (error) {
        console.error("Error deleting note:", error);
        return { success: false };
    }
}
