import { getOrganization } from "@/lib/actions/organization";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import CreateProjectForm from "./create-project-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function NewProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const tenantData = await getCurrentTenant();
    if (!tenantData) return <div>Lütfen bir şirket seçiniz.</div>;
    const { tenantId, userRole, userId } = tenantData;

    const organization = await getOrganization(id);
    if (!organization) return <div>Organizasyon bulunamadı.</div>;

    // Check if the current user is a "president" in this committee, or an admin/staff
    const isTenantManager = userRole === 'admin' || userRole === 'staff';
    const isPresident = organization.members.some(
        m => m.userId === userId && m.role === 'president'
    );
    const canCreateProject = isTenantManager || isPresident;

    if (!canCreateProject) {
        redirect(`/dashboard/organization/${id}/projects`); // Unauthorized users pushed back to listing
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href={`/dashboard/organization/${id}/projects`}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Yeni Proje</h2>
                    <p className="text-sm text-gray-500">Komite: {organization.name}</p>
                </div>
            </div>

            <CreateProjectForm
                tenantId={tenantId}
                committeeId={id}
                members={organization.members || []}
            />
        </div>
    );
}
