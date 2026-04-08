import { getCurrentTenant } from "@/lib/data/tenant";
import { getIbans } from "@/lib/actions/iban";
import { CreateEventForm } from "./create-event-form";
import { redirect } from "next/navigation";

export default async function CreateEventPage() {
    const tenant = await getCurrentTenant();
    if (!tenant) redirect("/login");

    const ibans = await getIbans(tenant.tenantId);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Yeni Etkinlik Oluştur</h1>
            <div className="bg-card p-6 rounded-lg border shadow-sm">
                <CreateEventForm ibans={ibans} />
            </div>
        </div>
    );
}
