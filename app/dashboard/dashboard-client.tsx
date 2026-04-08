'use client';

import { useState, useEffect, useTransition } from 'react';
import {
    getDashboardPeriodStats,
} from '@/lib/actions/dashboard-stats';
import {
    Users,
    UserCheck,
    LogIn,
    MessageSquare,
    Heart,
    Share2,
    Calendar,
    Bell,
    ChevronRight,
    Search,
    BarChart3
} from 'lucide-react';

export default function DashboardClient({
    tenantId,
    initialStaticStats
}: {
    tenantId: string;
    initialStaticStats: any;
}) {
    const [isPending, startTransition] = useTransition();
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    const [periodStats, setPeriodStats] = useState<any>(null);

    // Fetch period stats on mount and when year/month changes
    useEffect(() => {
        startTransition(async () => {
            const stats = await getDashboardPeriodStats(tenantId, year, month);
            setPeriodStats(stats);
        });
    }, [tenantId, year, month]);

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = [
        { val: 1, name: 'Ocak' }, { val: 2, name: 'Şubat' }, { val: 3, name: 'Mart' },
        { val: 4, name: 'Nisan' }, { val: 5, name: 'Mayıs' }, { val: 6, name: 'Haziran' },
        { val: 7, name: 'Temmuz' }, { val: 8, name: 'Ağustos' }, { val: 9, name: 'Eylül' },
        { val: 10, name: 'Ekim' }, { val: 11, name: 'Kasım' }, { val: 12, name: 'Aralık' }
    ];

    return (
        <div className="space-y-6">

            {/* 1. Üst Statik Sayılar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                    label="Toplam Üye"
                    value={initialStaticStats.memberCount}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    label="Şirket Çalışan Sayısı"
                    value={initialStaticStats.staffCount}
                    icon={UserCheck}
                    color="indigo"
                />
            </div>

            {/* 2. Kurul/Komiteler */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        Kurul ve Komiteler
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-4 py-3">Kurul Adı</th>
                                <th className="px-4 py-3">Yönetici Sayısı</th>
                                <th className="px-4 py-3">Çalışan/Üye Sayısı</th>
                                <th className="px-4 py-3 text-right">Detay</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                            {initialStaticStats.committees.map((c: any) => (
                                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
                                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold">
                                            {c.managerCount}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-bold">
                                            {c.staffCount}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <ChevronRight className="w-4 h-4 inline-block text-gray-300" />
                                    </td>
                                </tr>
                            ))}
                            {initialStaticStats.committees.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">Henüz aktif bir kurul bulunmuyor.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. Dönemsel İstatistikler */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-pink-500" />
                        Dönemsel Aktivite
                    </h3>
                    <div className="flex gap-2">
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {months.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ActivityCard label="Sisteme Giriş" value={periodStats?.loginCount} icon={LogIn} loading={isPending} color="emerald" />
                    <ActivityCard label="Unique Giriş" value={periodStats?.uniqueLoginCount} icon={UserCheck} loading={isPending} color="teal" />
                    <ActivityCard label="Paylaşım Sayısı" value={periodStats?.spostCount} icon={Share2} loading={isPending} color="blue" />
                    <ActivityCard label="Yorum Sayısı" value={periodStats?.commentCount} icon={MessageSquare} loading={isPending} color="cyan" />
                    <ActivityCard label="Beğeni Sayısı" value={periodStats?.reactionCount} icon={Heart} loading={isPending} color="rose" />
                    <ActivityCard label="Mesaj Sayısı" value={periodStats?.messageCount} icon={MessageSquare} loading={isPending} color="indigo" />
                    <ActivityCard label="Etkinlik Sayısı" value={periodStats?.eventCount} icon={Calendar} loading={isPending} color="orange" />
                    <ActivityCard label="Duyuru Sayısı" value={periodStats?.announcementCount} icon={Bell} loading={isPending} color="amber" />
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: any) {
    const colorClasses: any = {
        blue: 'from-blue-500 to-blue-600',
        indigo: 'from-indigo-500 to-indigo-600',
    };
    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10 flex items-center justify-between`}>
            <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-black mt-1">{value}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
                <Icon className="w-8 h-8" />
            </div>
        </div>
    );
}

function ActivityCard({ label, value, icon: Icon, loading, color }: any) {
    const colorClasses: any = {
        emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
        teal: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
        blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
        cyan: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
        rose: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
        indigo: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
        orange: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
        amber: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    };

    return (
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tight">{label}</p>
                {loading ? (
                    <div className="h-6 w-12 bg-gray-100 dark:bg-zinc-700 animate-pulse rounded mx-auto" />
                ) : (
                    <p className="text-xl font-bold">{value ?? 0}</p>
                )}
            </div>
        </div>
    );
}
