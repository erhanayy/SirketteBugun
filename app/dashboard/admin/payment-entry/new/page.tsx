import { getActiveOffersForAdmin, getTenants } from "@/lib/actions/superadmin";
import { CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PaymentEntryForm } from "./payment-entry-form";

export const dynamic = 'force-dynamic';

export default async function NewAdminPaymentEntryPage() {
    const activeOffers = await getActiveOffersForAdmin();
    const allTenants = await getTenants("");

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/admin/payment-entry"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        Yeni Ödeme ve Paket Ataması
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Elden, havale veya diğer yollarla alınan ödemelere özel paket tanımlamalarını bu ekrandan yapın.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                <PaymentEntryForm
                    offers={activeOffers}
                    tenants={allTenants}
                />
            </div>
        </div>
    );
}
