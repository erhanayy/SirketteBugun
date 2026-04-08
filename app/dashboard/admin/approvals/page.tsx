import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { getApprovalFlows } from "@/lib/actions/approvals";
import ApprovalsAdminClient from "./approvals-client";

export default async function AdminApprovalsPage() {
    const tenant = await getCurrentTenant();
    if (!tenant) redirect("/login");

    const isAdminOrStaff = tenant.userRole === 'admin' || tenant.userRole === 'staff';
    if (!isAdminOrStaff) {
        redirect("/dashboard");
    }

    const flows = await getApprovalFlows(tenant.tenantId);

    return <ApprovalsAdminClient tenantId={tenant.tenantId} initialFlows={flows} />;
}
