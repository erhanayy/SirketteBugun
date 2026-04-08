import { getTenantById } from "@/lib/actions/superadmin";
import { Building, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditTenantForm } from "./edit-tenant-form";

export const dynamic = 'force-dynamic';

export default async function AdminTenantDetailPage({
    params
}: {
    params: Promise<{ tenantId: string }>
}) {
    const resolvedParams = await params;
    const isNew = resolvedParams.tenantId === 'new';

    let tenantData = null;

    if (!isNew) {
        tenantData = await getTenantById(resolvedParams.tenantId);
        if (!tenantData) {
            notFound();
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/admin/tenants"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building className="w-6 h-6 text-blue-600" />
                        {isNew ? 'Yeni Şirket Ekle' : 'Şirket Detayları'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {isNew ? 'Sisteme yeni bir şirket (tenant) oluşturun.' : `${tenantData?.longName} bilgilerini güncelleyin.`}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                <EditTenantForm initialData={tenantData} />
            </div>
        </div>
    );
}
