"use server"

import { db } from "@/lib/db";
import { reminders } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { createNotification } from "@/lib/actions/notification";

export async function runRemindersCron() {
    try {
        const now = new Date();
        const dueReminders = await db.query.reminders.findMany({
            where: and(
                eq(reminders.status, 'pending'),
                eq(reminders.isNotified, false),
                lte(reminders.dueDate, now)
            )
        });

        if (dueReminders.length === 0) {
            return { success: true, message: 'Çalıştırıldı ancak bekleyen zamanı gelmiş hatırlatma bulunamadı.', count: 0 };
        }

        const notifiedIds: string[] = [];

        for (const reminder of dueReminders) {
            await createNotification(
                reminder.tenantId,
                [reminder.assigneeId],
                'project_task',
                `Hatırlatma: ${reminder.title}`,
                reminder.description || 'Göreviniz / Hatırlatmanız zamanı geldi.',
                '/dashboard/reminders'
            );
            notifiedIds.push(reminder.id);
        }

        if (notifiedIds.length > 0) {
            for (const id of notifiedIds) {
                await db.update(reminders).set({ isNotified: true }).where(eq(reminders.id, id));
            }
        }

        return {
            success: true,
            message: `${notifiedIds.length} adet bekleyen hatırlatma başarıyla kullanıcılara bildirildi.`,
            count: notifiedIds.length
        };
    } catch (error: any) {
        console.error('Manual Cron Error:', error);
        return { success: false, message: 'Görevler çalıştırılırken bir sorun yaşandı.', count: 0 };
    }
}
