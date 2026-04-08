import { getCurrentTenant } from "@/lib/data/tenant";
import { getMyReminders } from "@/lib/actions/reminders";
import { db } from "@/lib/db";
import { tenantUsers, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import RemindersClient from "./reminders-client";

export const metadata = {
    title: 'Hatırlatmalar - Şirkette Bugün',
};

export default async function RemindersPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    // Fetch reminders
    const remindersRes = await getMyReminders(tenantData.tenantId, tenantData.userId);
    const myReminders = remindersRes.data || [];

    // Check if user is admin/manager to show member selection
    const isManager = tenantData.userRole === "admin" || tenantData.userRole === "manager" || tenantData.userRole === "owner";

    // Fetch members if manager
    let members: any[] = [];
    if (isManager || tenantData.userRole === "staff") { // We'll just fetch all staff so manager can pick
        members = await db.select({
            id: users.id,
            fullName: users.fullName,
        }).from(tenantUsers)
            .innerJoin(users, eq(users.id, tenantUsers.userId))
            .where(eq(tenantUsers.tenantId, tenantData.tenantId));
    }

    // Ensure current user is always top of the list or in the list
    if (!members.find(m => m.id === tenantData.userId)) {
        members.unshift({
            id: tenantData.userId,
            fullName: tenantData.userName + " (Kendim)",
        });
    }

    return (
        <RemindersClient
            reminders={myReminders as any[]}
            members={members}
            tenantId={tenantData.tenantId}
            currentUserId={tenantData.userId}
            isManager={isManager}
        />
    );
}
