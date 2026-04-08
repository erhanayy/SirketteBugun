import { getManualPayments } from "@/lib/actions/superadmin-payments";
import { CreditCard, Plus, Search, Calendar, User, Building } from "lucide-react";
import Link from "next/link";
import { ActionMenu } from "./action-menu";

export const dynamic = 'force-dynamic';

export default async function AdminPaymentEntryPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const params = await searchParams;
    const query = params?.q || "";

    // Fetch top 50 recent payments
    const payments = await getManualPayments(query, 1, 50);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        Manuel Ödemeler ve Paketler
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Sisteme manuel olarak işlenmiş tüm paket ve abonelik ödemelerini görüntüleyin.
                    </p>
                </div>
                <Link
                    href="/dashboard/admin/payment-entry/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Ödeme Gir
                </Link>
            </div>

            {/* Search Filter */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <form className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="Şirket veya kullanıcı adı ile ara..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </form>
            </div>

            {/* Payments List */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-visible">
                <div className="overflow-visible min-h-[300px]">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-gray-100 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Hedef (Kime Kesildi)</th>
                                <th className="px-6 py-4 font-medium">Tutar</th>
                                <th className="px-6 py-4 font-medium">Başlangıç</th>
                                <th className="px-6 py-4 font-medium">Bitiş</th>
                                <th className="px-6 py-4 font-medium text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Hiçbir ödeme kaydı bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {payment.tenantName ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                        <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">{payment.tenantName}</div>
                                                        <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full inline-block mt-1">Kurumsal Plan</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                                        <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">{payment.userName}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{payment.userEmail}</div>
                                                        <div className="text-xs text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full inline-block mt-1">Bireysel Plan</div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {(payment.pricePaid / 100).toLocaleString('tr-TR')} ₺
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {new Date(payment.startDate).toLocaleDateString('tr-TR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {new Date(payment.endDate).toLocaleDateString('tr-TR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ActionMenu paymentId={payment.id} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {payments.length === 50 && (
                <div className="flex justify-center pt-4">
                    <p className="text-sm text-gray-500">Son 50 kayıt görüntülenmektedir.</p>
                </div>
            )}
        </div>
    );
}
