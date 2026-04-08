import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { getApprovalFlows, getMyApprovalRequests, getPendingApprovalsForMe } from "@/lib/actions/approvals";
import FlowsClient from "./flows-client";

export default async function FlowsPage() {
    const tenant = await getCurrentTenant();
    if (!tenant) redirect("/login");

    const flows = await getApprovalFlows(tenant.tenantId);
    const myRequests = await getMyApprovalRequests(tenant.tenantId, tenant.userId);
    const pendingApprovals = await getPendingApprovalsForMe(tenant.tenantId, tenant.userId);

    return <FlowsClient
        tenantId={tenant.tenantId}
        userId={tenant.userId}
        flows={flows}
        myRequests={myRequests}
        pendingApprovals={pendingApprovals}
    />;
}
