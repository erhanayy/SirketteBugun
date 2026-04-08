import { getIbans } from "@/lib/actions/iban";
import { getCurrentTenant } from "@/lib/data/tenant";
import { Plus, CreditCard, Building2, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Search from "../members/search";
import DeleteIbanButton from "./delete-iban-button";

export default async function IbansPage({
    searchParams,
}: {
    searchParams: Promise<{
        query?: string;
    }>;
}) {
    const { query } = await searchParams;
    const tenant = await getCurrentTenant();

    if (!tenant) {
        redirect("/login");
    }

    // Access Control: Only Admin and Staff can see this page
    if (tenant.userRole === 'member') {
        redirect('/dashboard');
    }

    const ibans = await getIbans(tenant.tenantId, query);

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Banka Hesapları (IBAN)</h2>
                    <p className="text-sm text-gray-500 mt-1">Derneğinize ait banka hesaplarını buradan yönetebilirsiniz.</p>
                </div>
                <Link
                    href="/dashboard/ibans/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Hesap Ekle
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                <Search placeholder="Hesap adı, banka veya hesap sahibi ara..." />
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ibans.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 border-dashed">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{query ? "Aradığınız kriterlere uygun hesap bulunamadı." : "Henüz kayıtlı banka hesabı bulunmuyor."}</p>
                    </div>
                ) : (
                    ibans.map((iban) => (
                        <div key={iban.id} className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm relative group flex flex-col h-full">

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{iban.name}</h3>
                                        <p className="text-sm text-gray-500">{iban.bankName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-lg border border-gray-100 dark:border-zinc-700 font-mono text-sm text-gray-700 dark:text-gray-300 break-all relative group/iban flex-1">
                                {iban.ibanNumber}
                            </div>

                            <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="truncate">{iban.accountHolder}</span>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
                                <DeleteIbanButton ibanId={iban.id} tenantId={tenant.tenantId} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
