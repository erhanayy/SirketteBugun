import Link from "next/link";
import { ChevronRight, KeyRound, User, Bell, ShieldCheck, FileText, Info } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Ayarlar</h1>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
                {/* About Page */}
                <Link
                    href="/dashboard/settings/about"
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                            <Info className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Hakkında</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Versiyon ve uygulama bilgileri</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </Link>

                {/* Password Change */}
                <Link
                    href="/dashboard/settings/password"
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                            <KeyRound className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Şifre Değişikliği</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Giriş şifrenizi güncelleyin</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </Link>

                {/* My Contracts */}
                <Link
                    href="/dashboard/settings/contracts"
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Sözleşmelerim</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Onayladığınız sözleşmeleri görüntüleyin</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </Link>

                {/* Placeholder for Profile - Can be added later */}
                <div className="flex items-center justify-between p-4 opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 flex items-center justify-center">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Profil Bilgileri</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Kişisel bilgilerinizi düzenleyin (Yakında)</p>
                        </div>
                    </div>
                    {/* <ChevronRight className="w-5 h-5 text-gray-400" /> */}
                </div>

                {/* Notifications Settings */}
                <Link
                    href="/dashboard/settings/notifications"
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Bildirim Ayarları</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Bildirim tercihlerinizi yönetin</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </Link>

                {/* App Permissions */}
                <Link
                    href="/dashboard/settings/permissions"
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Uygulama İzinleri</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Kamera, Galeri ve Dosya izinlerini yönetin</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </Link>
            </div>
        </div>
    );
}
