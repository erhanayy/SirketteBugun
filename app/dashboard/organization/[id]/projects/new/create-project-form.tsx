'use client'

import { useActionState } from "react";
import { createProject } from "@/lib/actions/projects";
import Link from "next/link";

const initialState = {
    error: undefined,
    success: false,
};

export default function CreateProjectForm({
    tenantId,
    committeeId,
    members
}: {
    tenantId: string,
    committeeId: string,
    members: any[]
}) {
    const [state, action, isPending] = useActionState(createProject, initialState);

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Yeni Proje Oluştur</h3>
                <p className="text-sm text-gray-500 mt-1">Bu komite için yönetilecek yeni bir proje veya inisiyatif başlatın.</p>
            </div>

            <form action={action} className="p-6 space-y-5">
                <input type="hidden" name="tenantId" value={tenantId} />
                <input type="hidden" name="committeeId" value={committeeId} />

                {state?.error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 dark:bg-red-900/20 dark:border-red-900/50">
                        {state.error}
                    </div>
                )}

                {state?.success && (
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/50">
                        Proje başarıyla oluşturuldu! Yönlendiriliyorsunuz...
                    </div>
                )}

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Proje Başığı *
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none text-gray-900 dark:text-white"
                        placeholder="Örn: Yıllık Sempozyum Hazırlıkları"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Açıklama / Hedefler
                    </label>
                    <textarea
                        name="description"
                        id="description"
                        rows={3}
                        className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none text-gray-900 dark:text-white resize-none"
                        placeholder="Projenin temel hedefleri..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="managerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Proje Yöneticisi (Sorumlusu)
                        </label>
                        <select
                            name="managerId"
                            id="managerId"
                            className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none text-gray-900 dark:text-white"
                        >
                            <option value="">(Belirlenmedi)</option>
                            {members.map(m => (
                                <option key={m.userId} value={m.userId}>{m.user?.fullName} ({m.title})</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Atanacak kişinin komiteye üye olması önerilir.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Başlangıç Tarihi
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            id="startDate"
                            className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none text-gray-900 dark:text-white"
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
                            className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-700">
                    <Link
                        href={`/dashboard/organization/${committeeId}/projects`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                        İptal
                    </Link>
                    <button
                        type="submit"
                        disabled={isPending || state?.success}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Oluşturuluyor..." : state?.success ? "Oluşturuldu" : "Projeyi Oluştur"}
                    </button>
                </div>
            </form>
        </div>
    );
}
