import { getOrganization, getAllUsersForAssignment, getOrganizationMembers } from "@/lib/actions/organization";
import { getCurrentTenant } from "@/lib/data/tenant";
import { ArrowLeft, Users, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import Search from "@/app/dashboard/members/search";
import MemberAssignmentRow from "./member-assignment-row";

export default async function ManageMembersPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ query?: string }>;
}) {
    const { id } = await params;
    const { query } = await searchParams;

    const tenantData = await getCurrentTenant();
    if (!tenantData) return <div>Lütfen bir şirket seçiniz.</div>;
    const { tenantId } = tenantData;

    // 1. Get Organization Details
    const organization = await getOrganization(id);

    // 2. Get All Potential Users (for the list)
    const allUsers = await getAllUsersForAssignment(tenantId, query);

    // 3. Get Current Members (to mark active ones)
    const currentMembers = await getOrganizationMembers(id);

    // Map current members to a lookup object for O(1) access
    const memberMap = new Map();
    currentMembers.forEach(m => {
        memberMap.set(m.userId, {
            title: m.title,
            role: m.role,
            isActive: true
        });
    });

    if (!organization) return <div>Organizasyon bulunamadı.</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/organization"
                    className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {organization.name} - Çalışan Yönetimi
                    </h2>
                    <p className="text-sm text-gray-500">
                        Bu organizasyona dahil olacak çalışanları seçin ve görevlerini belirleyin.
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="max-w-md">
                <Search placeholder="Çalışan adı veya telefon ile ara..." />
            </div>

            {/* Members List */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 text-xs uppercase text-gray-500 font-medium">
                            <th className="py-3 px-6">Çalışan Bilgisi</th>
                            <th className="py-3 px-6 w-24 text-center">Departman Yöneticisi</th>
                            <th className="py-3 px-6 w-24 text-center">Çalışan</th>
                            <th className="py-3 px-6 w-64">Görevi / Unvanı</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                        {allUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-gray-500">
                                    Kriterlere uygun çalışan bulunamadı.
                                </td>
                            </tr>
                        ) : (
                            allUsers.map(userItem => {
                                const currentAssignment = memberMap.get(userItem.user.id);
                                const isAssigned = !!currentAssignment;
                                const currentTitle = currentAssignment?.title || "";
                                const currentRole = currentAssignment?.role || "member";

                                const isEditable = tenantData.userRole === 'admin';

                                return (
                                    <MemberAssignmentRow
                                        key={userItem.user.id}
                                        organizationId={organization.id}
                                        user={userItem.user}
                                        tenantUserRole={userItem.role}
                                        isAssigned={isAssigned}
                                        currentTitle={currentTitle}
                                        currentRole={currentRole}
                                        readOnly={!isEditable}
                                    />
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-xs text-gray-400 text-center mt-4">
                Listelenen {allUsers.length} kişi. (Sadece aktif kullanıcılar listelenir)
            </div>
        </div>
    );
}
