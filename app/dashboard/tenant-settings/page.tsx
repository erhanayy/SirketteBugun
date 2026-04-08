import { getCurrentTenant } from "@/lib/data/tenant";
import { getTenantPersonalization } from "@/lib/actions/tenant-settings";
import TenantSettingsPage from "./settings-client";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function Page() {
    const tenantData = await getCurrentTenant();

    if (!tenantData) {
        redirect("/login");
    }

    // Role check
    if (tenantData.userRole !== 'admin' && tenantData.userRole !== 'staff') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <h1 className="text-xl font-bold text-red-600">Yetkisiz Erişim</h1>
                <p className="text-gray-500 mt-2">Bu sayfaya sadece şirket yöneticileri ve çalışanları erişebilir.</p>
            </div>
        );
    }

    const personalization = await getTenantPersonalization(tenantData.tenantId);

    // Fetch full tenant object for isActive etc.
    const tenantObj = await db.query.tenants.findFirst({
        where: eq(tenants.id, tenantData.tenantId)
    });

    return (
        <TenantSettingsPage
            tenant={tenantObj}
            personalization={personalization}
        />
    );
}
