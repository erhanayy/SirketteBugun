import { getCurrentTenant } from "@/lib/data/tenant";
import { getOrganizationsForSelect } from "@/lib/actions/organization";
import { getAllUsersForAssignment } from "@/lib/actions/organization";
import CreateProjectForm from "./create-project-form";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) redirect("/dashboard");

    const { tenantId, userRole } = tenantData;

    // Only admin/staff can create projects
    if (!['admin', 'staff'].includes(userRole)) {
        redirect("/dashboard/projects");
    }

    const departments = await getOrganizationsForSelect(tenantId);
    const allUsers = await getAllUsersForAssignment(tenantId);

    return (
        <div className="max-w-2xl mx-auto">
            <CreateProjectForm
                tenantId={tenantId}
                departments={departments}
                allUsers={allUsers}
            />
        </div>
    );
}
