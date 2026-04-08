import { getCurrentTenant } from "@/lib/data/tenant";
import { getDashboardStaticStats } from "@/lib/actions/dashboard-stats";
import DashboardClient from "./dashboard-client";
import { redirect } from "next/navigation";

export default async function Page() {
    const tenantData = await getCurrentTenant();

    if (!tenantData) {
        redirect("/login");
    }

    // Role check: Only admin, staff, or manager can see the overview dashboard
    // Members see the social feed (home) by default or we redirect them to /dashboard/home
    if (tenantData.userRole === 'member') {
        redirect("/dashboard/home");
    }

    const staticStats = await getDashboardStaticStats(tenantData.tenantId);

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Genel Bakış</h1>
                <p className="text-sm text-gray-500 mt-1">
                    {tenantData.tenantName} - Yönetimsel İstatistikler ve Özet.
                </p>
            </div>

            <DashboardClient
                tenantId={tenantData.tenantId}
                initialStaticStats={staticStats}
            />
        </div>
    );
}
