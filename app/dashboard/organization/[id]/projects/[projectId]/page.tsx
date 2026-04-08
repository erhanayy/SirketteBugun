import { getOrganization } from "@/lib/actions/organization";
import { getProject } from "@/lib/actions/projects";
import { getProjectTasks } from "@/lib/actions/tasks";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, Target } from "lucide-react";
import ProjectTasksGrid from "@/components/project-tasks-grid";
import EditProjectForm from "./edit-project-form";

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string, projectId: string }> }) {
    const { id, projectId } = await params;

    const tenantData = await getCurrentTenant();
    if (!tenantData) return <div>Lütfen bir şirket seçiniz.</div>;
    const { tenantId, userRole, userId } = tenantData;

    // 1. Fetch organization (for members lookup)
    const organization = await getOrganization(id);
    if (!organization) return <div>Organizasyon bulunamadı.</div>;

    // 2. Fetch Project
    const project = await getProject(projectId);
    if (!project) return <div>Proje bulunamadı.</div>;

    // Verify project belongs to organization
    if (project.committeeId !== id) {
        redirect(`/dashboard/organization/${id}/projects`);
    }

    // 3. Permissions Check
    const isTenantManager = userRole === 'admin' || userRole === 'staff';
    const isPresident = organization.members.some(
        m => m.userId === userId && m.role === 'president'
    );
    const isProjectManager = project.managerId === userId;

    // Managers can edit the project details and all tasks
    const canEditProject = isTenantManager || isPresident || isProjectManager;

    // Check if member
    const isMember = organization.members.some(m => m.userId === userId);

    // Member check: If not member and not tenant manager, block access
    if (!isTenantManager && !isMember) {
        redirect(`/dashboard/organization`);
    }

    // 4. Fetch Tasks
    const tasks = await getProjectTasks(projectId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/dashboard/organization/${id}/projects`}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            {project.title}
                        </h2>
                        <div className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Target className="w-3.5 h-3.5" /> Proje Detayı
                            <span className="mx-1">•</span>
                            <span>{organization.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Section: Project Information (Editable for Managers, Read-only for Others) */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/50 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Proje Bilgileri</h3>
                </div>

                <div className="p-5">
                    <EditProjectForm
                        project={project}
                        tenantId={tenantId}
                        committeeId={id}
                        members={organization.members || []}
                        isReadOnly={!canEditProject}
                    />
                </div>
            </div>

            {/* Bottom Section: Task Grid */}
            <ProjectTasksGrid
                projectId={projectId}
                tenantId={tenantId}
                committeeId={id}
                initialTasks={tasks}
                committeeMembers={organization.members || []}
                canEditProject={canEditProject}
                currentUserId={userId}
            />

        </div>
    );
}
