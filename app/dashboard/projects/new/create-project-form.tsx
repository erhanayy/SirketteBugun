'use client'

import { useActionState } from "react";
import { createProject } from "@/lib/actions/projects";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

const initialState = {
    error: undefined,
    success: false,
};

export default function CreateProjectForm({
    tenantId,
    departments,
    allUsers,
}: {
    tenantId: string;
    departments: { id: string; name: string; parentCommitteeId: string | null }[];
    allUsers: any[];
}) {
    const [state, action, isPending] = useActionState(createProject, initialState);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/projects"
                    className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Yeni Proje Oluştur</h2>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                <form action={action} className="space-y-5">
                    <input type="hidden" name="tenantId" value={tenantId} />

                    {state?.error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100 dark:bg-red-900/20 dark:border-red-900/50">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {state.error}
                        </div>
                    )}

                    {state?.success && (
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/50">
                            Proje başarıyla oluşturuldu! Yönlendiriliyorsunuz...
                        </div>
                    )}

                    {/* Proje Başlığı */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Proje Başlığı <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="Örn: Yıllık Sempozyum Hazırlıkları"
                        />
                    </div>

                    {/* Açıklama */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Açıklama / Hedefler
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            rows={3}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                            placeholder="Projenin temel hedefleri..."
                        />
                    </div>

                    {/* Departman (Opsiyonel) */}
                    <div>
                        <label htmlFor="committeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Departman <span className="text-gray-400 text-xs font-normal">(Opsiyonel)</span>
                        </label>
                        <select
                            name="committeeId"
                            id="committeeId"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
                        >
                            <option value="">— Departman seçilmedi —</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Proje belirli bir departmana bağlı değilse boş bırakabilirsiniz.</p>
                    </div>

                    {/* Proje Sorumlusu */}
                    <div>
                        <label htmlFor="managerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Proje Sorumlusu
                        </label>
                        <select
                            name="managerId"
                            id="managerId"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
                        >
                            <option value="">— Belirlenmedi —</option>
                            {allUsers.map(u => (
                                <option key={u.user.id} value={u.user.id}>{u.user.fullName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tarihler */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Başlangıç Tarihi
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                id="startDate"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Hedef Bitiş Tarihi
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                id="endDate"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-700">
                        <Link
                            href="/dashboard/projects"
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg font-medium transition-colors"
                        >
                            İptal
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending || state?.success}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {isPending ? 'Oluşturuluyor...' : state?.success ? 'Oluşturuldu' : 'Projeyi Oluştur'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
