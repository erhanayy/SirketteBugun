import { Info, ShieldCheck } from "lucide-react";
import Image from "next/image";
import versionData from "@/app/version.json";

export default function AboutPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6 pt-6">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white mb-8">
                <Info className="w-6 h-6 text-blue-600" />
                Hakkında
            </h1>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-md">
                <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-lg flex items-center justify-center bg-white p-2">
                    <Image src="/logo.png" alt="Şirkette Bugün" width={160} height={160} className="w-full h-full object-contain" />
                </div>

                <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-2">
                    Şirkette Bugün
                </h2>

                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                    Şirketinizin tüm süreçlerini tek noktadan yönetmeniz için tasarlanmış yeni nesil yönetim platformu.
                </p>

                <div className="bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl p-5 w-full flex items-center justify-between shadow-sm">
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Geçerli Sürüm</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white text-xl">
                            {versionData.version}
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border border-green-200 dark:border-green-800/30">
                        <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>

                <div className="mt-8 text-xs text-gray-400 dark:text-gray-500 font-medium">
                    &copy; {new Date().getFullYear()} Tüm Hakları Saklıdır.
                </div>
            </div>
        </div>
    );
}
