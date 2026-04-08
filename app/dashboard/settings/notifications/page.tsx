import { getCurrentTenant } from "@/lib/data/tenant";
import { getUserNotificationSettings } from "@/lib/actions/notification";
import { NotificationSettingsForm } from "./notification-settings-form";

export const metadata = {
    title: "Bildirim Ayarları | DernekteBugün",
    description: "Bildirim tercihlerinizi yönetin",
};

export default async function NotificationSettingsPage() {
    const tenantData = await getCurrentTenant();

    // Fallback if no tenantData
    if (!tenantData) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl">Oturum bilginiz bulunamadı.</div>
            </div>
        );
    }

    const initialSettings = await getUserNotificationSettings(tenantData.tenantId, tenantData.userId);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    Bildirimleri Yönet
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {tenantData.tenantName} derneği için hangi etkinliklerden anında haberdar olmak istediğinizi seçin.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 overflow-hidden">
                <NotificationSettingsForm
                    tenantId={tenantData.tenantId}
                    userId={tenantData.userId}
                    initialSettings={initialSettings}
                />
            </div>
        </div>
    );
}
