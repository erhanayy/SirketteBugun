"use client";

import { useState } from "react";
import { Play, Activity, BellRing, Settings2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { runRemindersCron } from "@/lib/actions/scheduler";

export default function SchedulerClient() {
    const [runningAll, setRunningAll] = useState(false);
    const [runningReminders, setRunningReminders] = useState(false);
    const [lastRuns, setLastRuns] = useState<{ [key: string]: { time: Date, result: string, success: boolean } }>({});

    // Handler for reminders cron
    const handleRunReminders = async () => {
        setRunningReminders(true);
        try {
            const res = await runRemindersCron();
            setLastRuns(prev => ({
                ...prev,
                reminders: { time: new Date(), result: res.message, success: res.success }
            }));

            if (res.success) {
                if (res.count && res.count > 0) toast.success(res.message);
                else toast.info(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("İşlem sırasında beklenmeyen bir hata oluştu.");
        } finally {
            setRunningReminders(false);
        }
    };

    // Handler for Run All
    const handleRunAll = async () => {
        setRunningAll(true);
        // Will execute all available jobs sequentially or parallely. For now we only have reminders.
        await handleRunReminders();
        // future jobs will be awaited here... e.g. await handleRunEmails();
        setRunningAll(false);
        toast.success("Tüm bekleyen sistem görevleri çalıştırıldı.");
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-7 h-7 text-indigo-500" />
                        Sistem Görevleri (Scheduler)
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-2xl">
                        Google Cloud Scheduler veya Vercel Cron gibi dış servisleri kullanmadan, sistem içerisinde bekleyen otomatik görevleri manuel olarak tetikleyin. Bu işlemler zamanlanmış bildirimlerin, tekrarlayan kayıtların oluşturulmasını sağlar.
                    </p>
                </div>
                <Button
                    onClick={handleRunAll}
                    disabled={runningAll || runningReminders}
                    className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="lg"
                >
                    <Play className={`w-5 h-5 mr-2 ${runningAll ? "animate-pulse" : ""}`} />
                    {runningAll ? "Çalıştırılıyor..." : "Tümünü Çalıştır"}
                </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Job 1: Reminders */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />

                    <div className="flex justify-between items-start mb-4 pl-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-zinc-800 rounded-lg text-blue-500">
                                <BellRing className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Hatırlatmalar</h3>
                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                    <Settings2 className="w-3 h-3 mr-1" /> push & events
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 pl-2 mb-6 min-h-[40px]">
                        Tarihi gelen görevleri ve hatırlatmaları kontrol eder. Kullanıcılara Push Bildirim gönderir.
                    </p>

                    <div className="pl-2">
                        <Button
                            variant="secondary"
                            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white"
                            onClick={handleRunReminders}
                            disabled={runningReminders || runningAll}
                        >
                            <Play className={`w-4 h-4 mr-2 ${runningReminders ? "animate-spin" : ""}`} />
                            {runningReminders ? "Çalışıyor..." : "Şimdi Çalıştır"}
                        </Button>

                        {lastRuns.reminders && (
                            <div className={`mt-3 text-xs flex items-start gap-1.5 p-2 rounded-md ${lastRuns.reminders.success ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <div>
                                    <span className="font-medium">{lastRuns.reminders.time.toLocaleTimeString()}</span> - {lastRuns.reminders.result}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Placeholder for future jobs */}
                <div className="bg-gray-50 dark:bg-zinc-800/30 border border-gray-200 border-dashed dark:border-zinc-700 rounded-xl p-5 relative overflow-hidden opacity-60">
                    <div className="flex justify-between items-start mb-4 pl-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-200 dark:bg-zinc-700 rounded-lg text-gray-500">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300">E-Posta Sırası</h3>
                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                    <Settings2 className="w-3 h-3 mr-1" /> e-mail queue
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 pl-2 mb-6">
                        İleride yapılacak E-posta sırası (kuyruk) işleyicisi... (Şu an aktif değil)
                    </p>
                    <div className="pl-2">
                        <Button variant="outline" className="w-full" disabled>Yakında Eklenecek</Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
