"use server"

import { db } from "@/lib/db";
import { reminders } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createReminder(data: {
    tenantId: string;
    creatorId: string;
    assigneeId: string;
    title: string;
    description?: string;
    dueDate: Date;
    isRecurring: boolean;
    recurringPattern?: string;
}) {
    try {
        await db.insert(reminders).values({
            tenantId: data.tenantId,
            creatorId: data.creatorId,
            assigneeId: data.assigneeId,
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
            isRecurring: data.isRecurring,
            recurringPattern: data.recurringPattern,
            status: "pending",
        });

        revalidatePath("/dashboard/reminders");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating reminder:", error);
        return { success: false, error: error.message };
    }
}

export async function getMyReminders(tenantId: string, userId: string) {
    try {
        // Find tasks either created by me OR assigned to me
        const list = await db.query.reminders.findMany({
            where: (reminders, { eq, or, and }) => and(
                eq(reminders.tenantId, tenantId),
                or(
                    eq(reminders.assigneeId, userId),
                    eq(reminders.creatorId, userId)
                )
            ),
            orderBy: [desc(reminders.createdAt)],
            with: {
                creator: true,
                assignee: true,
            }
        });
        return { success: true, data: list };
    } catch (error: any) {
        console.error("Error fetching my reminders:", error);
        return { success: false, data: [] };
    }
}

export async function toggleReminderStatus(id: string, currentStatus: string) {
    try {
        const newStatus = currentStatus === "completed" ? "pending" : "completed";

        const existing = await db.query.reminders.findFirst({
            where: eq(reminders.id, id)
        });

        if (!existing) throw new Error("Reminder not found");

        await db.update(reminders).set({
            status: newStatus as any,
            completedAt: newStatus === "completed" ? new Date() : null,
        }).where(eq(reminders.id, id));

        // Generate next recurring reminder if marked complete and it's recurring
        if (newStatus === "completed" && existing.isRecurring && existing.recurringPattern) {
            let nextDate = new Date(existing.dueDate);
            if (existing.recurringPattern === "daily") {
                nextDate.setDate(nextDate.getDate() + 1);
            } else if (existing.recurringPattern === "weekly") {
                nextDate.setDate(nextDate.getDate() + 7);
            } else if (existing.recurringPattern === "monthly") {
                nextDate.setMonth(nextDate.getMonth() + 1);
            } else if (existing.recurringPattern === "yearly") {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
            }

            await db.insert(reminders).values({
                tenantId: existing.tenantId,
                creatorId: existing.creatorId,
                assigneeId: existing.assigneeId,
                title: existing.title,
                description: existing.description,
                dueDate: nextDate,
                isRecurring: true,
                recurringPattern: existing.recurringPattern,
                status: "pending",
                isNotified: false,
            });
        }

        revalidatePath("/dashboard/reminders");
        return { success: true };
    } catch (error: any) {
        console.error("Error toggling reminder status:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteReminder(id: string) {
    try {
        await db.delete(reminders).where(eq(reminders.id, id));
        revalidatePath("/dashboard/reminders");
        return { success: true };
    } catch (error) {
        console.error("Error deleting reminder:", error);
        return { success: false };
    }
}
