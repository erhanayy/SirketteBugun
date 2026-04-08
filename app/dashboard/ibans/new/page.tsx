import { getCurrentTenant } from "@/lib/data/tenant";
import CreateIbanForm from "./create-iban-form";
import { redirect } from "next/navigation";

export default async function NewIbanPage() {
    const tenant = await getCurrentTenant();

    if (!tenant) {
        redirect("/login");
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Yeni IBAN Hesabı Ekle</h2>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                <CreateIbanForm tenantId={tenant.tenantId} />
            </div>
        </div>
    );
}
