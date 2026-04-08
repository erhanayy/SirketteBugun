import { getProject } from "@/lib/actions/projects";
import { getProjectTasks } from "@/lib/actions/tasks";
import { getAllUsersForAssignment } from "@/lib/actions/organization";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, Target } from "lucide-react";
import ProjectTasksGrid from "@/components/project-tasks-grid";
import EditProjectForm from "./edit-project-form";

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;

    const tenantData = await getCurrentTenant();
    if (!tenantData) return <div>Lütfen bir şirket seçiniz.</div>;
    const { tenantId, userRole, userId } = tenantData;

    // Fetch Project
    const project = await getProject(projectId);
    if (!project) return <div>Proje bulunamadı.</div>;

    // Permission Check
    const isTenantManager = userRole === 'admin' || userRole === 'staff';
    const isProjectManager = project.managerId === userId;
    const canEditProject = isTenantManager || isProjectManager;

    // Get all users as potential task assignees / manager candidates
    const allUsers = await getAllUsersForAssignment(tenantId);

    // Fetch Tasks
    const tasks = await getProjectTasks(projectId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/projects"
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {project.title}
                        </h2>
                        <div className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Target className="w-3.5 h-3.5" /> Proje Detayı
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Info (Editable for managers) */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/50 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Proje Bilgileri</h3>
                </div>
                <div className="p-5">
                    <EditProjectForm
                        project={project}
                        tenantId={tenantId}
                        allUsers={allUsers}
                        isReadOnly={!canEditProject}
                    />
                </div>
            </div>

            {/* Task Grid */}
            <ProjectTasksGrid
                projectId={projectId}
                tenantId={tenantId}
                committeeId={project.committeeId || ""}
                initialTasks={tasks}
                committeeMembers={allUsers.map(u => ({ userId: u.user.id, user: u.user, role: 'member', title: u.user.fullName }))}
                canEditProject={canEditProject}
                currentUserId={userId}
            />
        </div>
    );
}
