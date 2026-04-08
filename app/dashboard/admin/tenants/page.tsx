import { getTenants, impersonateTenantAndAddUser } from "@/lib/actions/superadmin";
import Link from "next/link";
import { Building, Plus, Search, CheckCircle, XCircle, UserPlus } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminTenantsPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const params = await searchParams;
    const query = params?.q || "";

    // Fetch tenants via superadmin action (will redirect if not admin)
    const tenantsList = await getTenants(query);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building className="w-6 h-6 text-blue-600" />
                        Şirket Yönetimi
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Sistemdeki tüm dernekleri yönetin ve yeni şirket ekleyin.
                    </p>
                </div>
                <Link
                    href="/dashboard/admin/tenants/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Şirket Ekle
                </Link>
            </div>

            {/* Search Filter - Simple form submission to keep it server-side */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <form className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="Şirket adı ile ara..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </form>
            </div>

            {/* Tenants Grid/List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenantsList.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                        Şirket bulunamadı.
                    </div>
                ) : (
                    tenantsList.map((tenant) => (
                        <div
                            key={tenant.id}
                            className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                        >
                            {/* Ana Tıklanabilir Gövde */}
                            <Link href={`/dashboard/admin/tenants/${tenant.id}`} className="block flex-1 cursor-pointer">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                                        {tenant.logoUrl ? (
                                            <img src={tenant.logoUrl} alt={tenant.shortName} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            tenant.shortName.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {tenant.isActive ? (
                                            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                                <CheckCircle className="w-3 h-3" /> Aktif
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                                                <XCircle className="w-3 h-3" /> Pasif
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                                    {tenant.longName}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                    {tenant.shortName}
                                </p>
                            </Link>

                            {/* Tamamen Dışarıda Kalan Buton - Link etkileşimine girmez */}
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-500 flex justify-between items-center">
                                <form action={impersonateTenantAndAddUser}>
                                    <input type="hidden" name="tenantId" value={tenant.id} />
                                    <button
                                        type="submit"
                                        title="Şirkete Giriş Yap & Çalışanlar Listesini Gör"
                                        className="p-1.5 -ml-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white rounded-lg transition-colors flex items-center justify-center shadow-sm"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                </form>
                                <span>ID: {tenant.id.substring(0, 8)}...</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
