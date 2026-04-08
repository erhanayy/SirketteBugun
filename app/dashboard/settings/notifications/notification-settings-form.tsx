"use client";

import { useEffect, useState } from "react";
import { saveUserNotificationSettings } from "@/lib/actions/notification";
import { useRouter } from "next/navigation";
import { Bell, Calendar, MessageCircle, Rss, Loader2, Save } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

type SettingsProps = {
    tenantId: string;
    userId: string;
    initialSettings: {
        notifyPost: boolean;
        notifyEvent: boolean;
        notifyAnnouncement: boolean;
        notifyMessage: boolean;
    };
};

export function NotificationSettingsForm({ tenantId, userId, initialSettings }: SettingsProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [isPushLoading, setIsPushLoading] = useState(false);
    const [pushStatus, setPushStatus] = useState<string>("İzin Bekleniyor");
    const [message, setMessage] = useState({ text: "", type: "" });
    const router = useRouter();

    useEffect(() => {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') setPushStatus("Aktif");
            else if (Notification.permission === 'denied') setPushStatus("Engellendi");
        } else {
            setPushStatus("Desteklenmiyor");
        }
    }, []);

    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setMessage({ text: "Tarayıcınız anlık bildirimleri desteklemiyor.", type: "error" });
            return;
        }
        setIsPushLoading(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setPushStatus("Engellendi");
                setMessage({ text: "Bildirim izni reddedildi.", type: "error" });
                setIsPushLoading(false);
                return;
            }

            const reg = await navigator.serviceWorker.register('/sw.js');
            const res = await fetch('/api/push');
            const { publicKey } = await res.json();

            const convertedVapidKey = urlBase64ToUint8Array(publicKey);

            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            await fetch('/api/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });

            setPushStatus("Aktif");
            setMessage({ text: "Tarayıcı bildirimleri başarıyla aktif edildi!", type: "success" });
        } catch (e: any) {
            console.error(e);
            setMessage({ text: "Bildirim servisine bağlanılamadı.", type: "error" });
        } finally {
            setIsPushLoading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setMessage({ text: "", type: "" });
        try {
            await saveUserNotificationSettings(tenantId, userId, settings);
            setMessage({ text: "Bildirim ayarlarınız başarıyla güncellendi.", type: "success" });
            router.refresh(); // Refresh to ensure server state is updated if needed
        } catch (error) {
            console.error("Save error:", error);
            setMessage({ text: "Ayarlar kaydedilirken bir hata oluştu.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const Toggle = ({
        label, description, checked, onChange, icon: Icon
    }: {
        label: string, description: string, checked: boolean, onChange: (val: boolean) => void, icon: any
    }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-100 dark:border-zinc-800 last:border-0 gap-4">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{label}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm leading-relaxed">{description}</p>
                </div>
            </div>
            {/* Custom Toggle Switch */}
            <div className="flex-shrink-0 self-start sm:self-center ml-14 sm:ml-0">
                <button
                    type="button"
                    onClick={() => onChange(!checked)}
                    className={`${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-zinc-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={checked}
                >
                    <span
                        aria-hidden="true"
                        className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-2">

            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium mb-6 flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {message.text}
                </div>
            )}

            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                <Toggle
                    label="Sosyal Paylaşımlar"
                    description="Şirket üyelerinin Ana Sayfa'da yaptığı yeni paylaşımlar hakkında bildirim alın."
                    icon={Rss}
                    checked={settings.notifyPost}
                    onChange={(val) => setSettings({ ...settings, notifyPost: val })}
                />

                <Toggle
                    label="Etkinlik Davetleri"
                    description="Şirket yönetimi tarafından oluşturulan yeni etkinliklerden haberdar olun."
                    icon={Calendar}
                    checked={settings.notifyEvent}
                    onChange={(val) => setSettings({ ...settings, notifyEvent: val })}
                />

                <Toggle
                    label="Resmi Duyurular"
                    description="Yönetim kurulu veya şirket ofisinden gelen resmi bildiri ve duyuruları kaçırmayın."
                    icon={Bell}
                    checked={settings.notifyAnnouncement}
                    onChange={(val) => setSettings({ ...settings, notifyAnnouncement: val })}
                />

                <Toggle
                    label="Direkt Mesajlar"
                    description="Size özel veya dahil olduğunuz sohbet gruplarına gelen yeni mesajlar için bildirim alın."
                    icon={MessageCircle}
                    checked={settings.notifyMessage}
                    onChange={(val) => setSettings({ ...settings, notifyMessage: val })}
                />
            </div>

            <div className="pt-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex items-center gap-3 w-full xl:w-auto p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Tarayıcı Bildirimleri</p>
                        <p className="text-xs text-gray-500 mt-0.5">Durum: <span className="font-semibold">{pushStatus}</span></p>
                    </div>
                    {pushStatus !== "Aktif" && pushStatus !== "Desteklenmiyor" && (
                        <button
                            type="button"
                            onClick={subscribeToPush}
                            disabled={isPushLoading}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-zinc-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            {isPushLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                            Aktifleştir
                        </button>
                    )}
                </div>

                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    Tercihleri Kaydet
                </button>
            </div>
        </div>
    );
}
