import { getMembers } from "@/lib/actions/member";
import { getDemoData } from "@/lib/data/demo";
import { getCurrentTenant } from "@/lib/data/tenant";
import { formatPhoneForDisplay } from "@/lib/phone";
import { Search as SearchIcon, Plus, User, Phone, Mail, Shield, Pencil } from "lucide-react";
import Link from "next/link";
import Search from "./search";
import DeleteMemberButton from "./delete-member-button";

export const dynamic = 'force-dynamic';

export default async function MembersPage({
    searchParams,
}: {
    searchParams: Promise<{
        query?: string;
    }>;
}) {
    const { query } = await searchParams;
    const members = await getMembers(query);

    const tenantData = await getCurrentTenant();
    const userRole = tenantData?.userRole || "member";
    const canManageMembers = userRole === "admin" || userRole === "manager";

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-end gap-3">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Çalışanlar</h2>
                    <span className="text-sm font-medium text-gray-500 pb-1">({members.length} Kayıt)</span>
                </div>
                {canManageMembers && (
                    <Link
                        href="/dashboard/members/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        Yeni Çalışan Ekle
                    </Link>
                )}
            </div>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                <Search placeholder="İsim veya telefon numarası ile ara..." />
            </div>

            {/* Members List (Grid of Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 border-dashed">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>
                            {query ? "Aradığınız kriterlere uygun çalışan bulunamadı." : "Henüz kayıtlı çalışan bulunmuyor."}
                        </p>
                    </div>
                ) : (
                    members.map((member) => (
                        <div
                            key={member.id}
                            className={`bg-white dark:bg-zinc-800 p-5 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm relative group flex flex-col ${canManageMembers ? 'hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700' : ''}`}
                        >
                            {canManageMembers ? (
                                <Link href={`/dashboard/members/${member.id}/edit`} className="block flex-1">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-lg border border-blue-200 dark:border-blue-800/50 shrink-0">
                                            {member.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {member.fullName}
                                            </h3>

                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{formatPhoneForDisplay(member.phoneNumber)}</span>
                                            </div>

                                            {member.email && (
                                                <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <span className="truncate">{member.email}</span>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${member.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800' :
                                                    member.role === 'manager' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' :
                                                        'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                                    }`}>
                                                    <Shield className="w-3 h-3" />
                                                    {member.role === 'admin' ? 'Yönetici' :
                                                        member.role === 'manager' ? 'Yönetim Kurulu' :
                                                            member.role === 'staff' ? 'Personel' : 'Üye'}
                                                </span>

                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${member.status === 'active' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' :
                                                    'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                                                    }`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    {member.status === 'active' ? 'Aktif' : 'Pasif'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="block flex-1 cursor-default">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-lg border border-blue-200 dark:border-blue-800/50 shrink-0">
                                            {member.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                {member.fullName}
                                            </h3>

                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{formatPhoneForDisplay(member.phoneNumber)}</span>
                                            </div>

                                            {member.email && (
                                                <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <span className="truncate">{member.email}</span>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${member.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800' :
                                                    member.role === 'manager' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' :
                                                        'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                                    }`}>
                                                    <Shield className="w-3 h-3" />
                                                    {member.role === 'admin' ? 'Yönetici' :
                                                        member.role === 'manager' ? 'Yönetim Kurulu' :
                                                            member.role === 'staff' ? 'Personel' : 'Üye'}
                                                </span>

                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${member.status === 'active' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' :
                                                    'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                                                    }`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    {member.status === 'active' ? 'Aktif' : 'Pasif'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {canManageMembers && (
                                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
                                    <Link
                                        href={`/dashboard/members/${member.id}/edit`}
                                        className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        title="Düzenle"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Link>
                                    <DeleteMemberButton memberId={member.id} />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
