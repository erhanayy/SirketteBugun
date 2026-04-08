import { getOrganization } from "@/lib/actions/organization";
import { getProjectsWithTaskCounts } from "@/lib/actions/projects";
import { getCurrentTenant } from "@/lib/data/tenant";
import Link from "next/link";
import { Plus, ClipboardList, Calendar, Users, Target } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Get current tenant and role
    const tenantData = await getCurrentTenant();
    if (!tenantData) return <div>Lütfen bir şirket seçiniz.</div>;
    const { userRole, userId } = tenantData;

    // Fetch Organization (Committee) details to show its name and members
    const organization = await getOrganization(id);
    if (!organization) return <div>Organizasyon bulunamadı.</div>;

    // Check if the current user is a "president" in this committee, or an admin/staff
    const isTenantManager = userRole === 'admin' || userRole === 'staff';
    const isPresident = organization.members.some(
        m => m.userId === userId && m.role === 'president'
    );
    const canCreateProject = isTenantManager || isPresident;

    // Fetch Projects
    const projectsList = await getProjectsWithTaskCounts(id);

    // Status styling helpers
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'planned': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900/50';
            case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500 border-blue-200 dark:border-blue-900/50';
            case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500 border-blue-200 dark:border-blue-900/50';
            case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500 border-emerald-200 dark:border-emerald-900/50';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500 border-red-200 dark:border-red-900/50';
            default: return 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300 border-gray-200 dark:border-zinc-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'planned': return 'Planlandı';
            case 'in_progress':
            case 'active': return 'Devam Ediyor';
            case 'completed': return 'Tamamlandı';
            case 'cancelled': return 'İptal Edildi';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-gray-500" />
                        Projeler: {organization.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Bu organizasyona (komiteye) atanan tüm projeler ve görevler.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/organization"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm font-medium"
                    >
                        &larr; Organizasyonlara Dön
                    </Link>
                    {canCreateProject && (
                        <Link
                            href={`/dashboard/organization/${id}/projects/new`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center"
                        >
                            <Plus className="w-5 h-5" />
                            Yeni Proje Ekle
                        </Link>
                    )}
                </div>
            </div>

            {/* Projects List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsList.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 border-dashed">
                        <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Henüz planlanmış bir proje bulunmuyor.</p>
                    </div>
                ) : (
                    projectsList.map((item) => {
                        const { project, manager, totalTasks, completedTasks } = item;
                        const hasTasks = totalTasks > 0;
                        const progress = hasTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

                        return (
                            <Link key={project.id} href={`/dashboard/organization/${id}/projects/${project.id}`} className="block h-full cursor-pointer">
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col h-full overflow-hidden">

                                    {/* Component Top Color Bar based on Status */}
                                    <div className={`h-1.5 w-full ${getStatusStyle(project.status).split(' ')[0]}`} />

                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-3 gap-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                                                {project.title}
                                            </h3>
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md whitespace-nowrap border ${getStatusStyle(project.status)}`}>
                                                {getStatusText(project.status)}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                            {project.description || "Açıklama girilmemiş."}
                                        </p>

                                        {/* Task Progress Bar */}
                                        {hasTasks && (
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Görev İlerlemesi</span>
                                                    <span className="text-gray-900 dark:text-white font-bold">{completedTasks} / {totalTasks} ({progress}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-zinc-700 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                        {!hasTasks && (
                                            <div className="mb-4 text-xs text-gray-400 dark:text-zinc-500 italic">
                                                Henüz görev eklenmemiş.
                                            </div>
                                        )}

                                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-700 flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Users className="w-4 h-4" />
                                                <span className="truncate">Sorumlu: {manager ? manager.fullName : "Atanmadı"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {project.startDate ? format(new Date(project.startDate), 'd MMM yyyy', { locale: tr }) : '?'}
                                                    {' - '}
                                                    {project.endDate ? format(new Date(project.endDate), 'd MMM yyyy', { locale: tr }) : 'Belirsiz'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
