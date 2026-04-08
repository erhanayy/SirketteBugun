import { getCurrentTenant } from "@/lib/data/tenant";
import UpsertCardForm from "./upsert-card-form";
import { redirect } from "next/navigation";
import { getBusinessCardByUserId } from "@/lib/actions/business_card";

export default async function NewBusinessCardPage() {
    const tenant = await getCurrentTenant();

    if (!tenant) {
        redirect("/login");
    }

    // Check if user already has a card
    const existingCard = await getBusinessCardByUserId(tenant.tenantId, tenant.userId);

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                Kartvizitim
            </h2>
            <p className="text-sm text-gray-500 mb-8">
                Şirketteki diğer çalışanlara görünecek profesyonel profilinizi ve iletişim bilgilerinizi buradan yönetebilirsiniz.
            </p>

            <div className="bg-white dark:bg-zinc-800 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                <UpsertCardForm tenantData={tenant} existingCard={existingCard} />
            </div>
        </div>
    );
}
