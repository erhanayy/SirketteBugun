'use client'

import React, { useActionState } from 'react';
import { updateProject } from '@/lib/actions/projects';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const initialState = {
    error: undefined,
    success: false,
};

export default function EditProjectForm({
    project,
    tenantId,
    committeeId,
    members,
    isReadOnly
}: {
    project: any;
    tenantId: string;
    committeeId: string;
    members: any[];
    isReadOnly: boolean;
}) {
    const [state, action, isPending] = useActionState(updateProject, initialState);

    if (isReadOnly) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Durum</label>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.status === 'planned' ? 'Planlandı' :
                            project.status === 'in_progress' || project.status === 'active' ? 'Devam Ediyor' :
                                project.status === 'completed' ? 'Tamamlandı' :
                                    project.status === 'cancelled' ? 'İptal Edildi' : project.status}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Proje Sorumlusu</label>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.manager ? project.manager.fullName : "Atanmadı"}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Başlangıç Tarihi</label>
                    <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        {project.startDate ? format(new Date(project.startDate), 'd MMM yyyy', { locale: tr }) : "-"}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Hedef Bitiş Tarihi</label>
                    <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        {project.endDate ? format(new Date(project.endDate), 'd MMM yyyy', { locale: tr }) : "Belirsiz"}
                    </div>
                </div>
                <div className="col-span-full">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Açıklama</label>
                    <div className="text-sm text-gray-900 dark:text-gray-300">
                        {project.description || "Açıklama girilmemiş."}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form action={action} className="space-y-4">
            <input type="hidden" name="id" value={project.id} />
            <input type="hidden" name="committeeId" value={committeeId} />
            <input type="hidden" name="title" value={project.title} /> {/* Keep title since it's required in action */}

            {state?.error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 mb-4 block">
                    {state.error}
                </div>
            )}
            {state?.success && (
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm border border-emerald-100 mb-4 block">
                    Değişiklikler kaydedildi.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1">Durum</label>
                    <select
                        name="status"
                        id="status"
                        defaultValue={project.status}
                        className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white"
                    >
                        <option value="planned">Planlandı</option>
                        <option value="active">Devam Ediyor</option>
                        <option value="completed">Tamamlandı</option>
                        <option value="cancelled">İptal Edildi</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="managerId" className="block text-xs font-medium text-gray-500 mb-1">Proje Sorumlusu</label>
                    <select
                        name="managerId"
                        id="managerId"
                        defaultValue={project.managerId || ""}
                        className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white"
                    >
                        <option value="">(Atanmadı)</option>
                        {members.map(m => (
                            <option key={m.userId} value={m.userId}>{m.user?.fullName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 mb-1">Başlangıç Tarihi</label>
                    <input
                        type="date"
                        name="startDate"
                        id="startDate"
                        defaultValue={project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : ""}
                        className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white"
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 mb-1">Hedef Bitiş Tarihi</label>
                    <input
                        type="date"
                        name="endDate"
                        id="endDate"
                        defaultValue={project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ""}
                        className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            <div className="pt-2">
                <label htmlFor="description" className="block text-xs font-medium text-gray-500 mb-1">Açıklama</label>
                <textarea
                    name="description"
                    id="description"
                    rows={2}
                    defaultValue={project.description || ""}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white resize-none"
                    placeholder="Proje açıklaması..."
                />
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
            </div>
        </form>
    );
}
