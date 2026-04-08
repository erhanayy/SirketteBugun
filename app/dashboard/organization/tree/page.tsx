import { getAllCommitteesForTree, getAllUsersForAssignment } from "@/lib/actions/organization";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import OrgTreeClient from "./org-tree-client";

export const dynamic = 'force-dynamic';

export default async function OrgTreePage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) redirect("/dashboard");

    const { tenantId, userRole, tenantName } = tenantData;
    const isAdmin = userRole === 'admin';

    const [committees, allUsers] = await Promise.all([
        getAllCommitteesForTree(),
        getAllUsersForAssignment(tenantId),
    ]);

    return (
        <OrgTreeClient
            committees={committees}
            allUsers={allUsers.map(u => ({ id: u.user.id, fullName: u.user.fullName }))}
            tenantId={tenantId}
            tenantName={tenantName ?? 'Şirket'}
            isAdmin={isAdmin}
        />
    );
}
