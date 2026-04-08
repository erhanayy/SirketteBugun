'use client'

import React, { useState, useTransition } from 'react';
import { createProjectTask, updateProjectTask, deleteProjectTask } from '@/lib/actions/tasks';
import { Plus, Check, Trash2, Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Task {
    id: string;
    task: string;
    taskStatus: string;
    expectedEndDate: Date | null;
    endDate: Date | null;
    taskOwnerId: string | null;
    taskOwner?: { fullName: string | null } | null;
}

interface Member {
    userId: string;
    user: { fullName: string | null } | null;
    title: string | null;
}

export default function ProjectTasksGrid({
    projectId,
    tenantId,
    committeeId,
    initialTasks,
    committeeMembers,
    canEditProject,
    currentUserId
}: {
    projectId: string;
    tenantId: string;
    committeeId: string;
    initialTasks: Task[];
    committeeMembers: Member[];
    canEditProject: boolean;
    currentUserId: string;
}) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [isPending, startTransition] = useTransition();
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskOwner, setNewTaskOwner] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');

    const handleCreateTask = () => {
        if (!newTaskText.trim()) return;

        startTransition(async () => {
            const res = await createProjectTask(
                tenantId,
                committeeId,
                projectId,
                newTaskText,
                newTaskOwner || undefined,
                newTaskDate || undefined
            );

            if (res.success && res.task) {
                const createdTask: Task = {
                    ...res.task,
                    taskOwner: committeeMembers.find(m => m.userId === res.task.taskOwnerId)?.user || null,
                };
                setTasks([createdTask, ...tasks]);
                setNewTaskText('');
                setNewTaskOwner('');
                setNewTaskDate('');
            } else {
                alert(res.error || "Görev eklenirken bir hata oluştu.");
            }
        });
    };

    const handleUpdateTaskField = (taskId: string, field: string, value: any) => {
        const originalTasks = [...tasks];

        // Optimistic update
        setTasks(current => current.map(t => {
            if (t.id === taskId) {
                const updated = { ...t, [field]: value };
                if (field === 'taskStatus' && value === 'completed') {
                    updated.endDate = new Date();
                } else if (field === 'taskStatus' && value !== 'completed') {
                    updated.endDate = null;
                }

                if (field === 'taskOwnerId') {
                    updated.taskOwner = committeeMembers.find(m => m.userId === value)?.user || null;
                }
                return updated;
            }
            return t;
        }));

        startTransition(async () => {
            const res = await updateProjectTask(tenantId, committeeId, taskId, projectId, { [field]: value });
            if (!res.success) {
                alert(res.error || "Güncelleme başarısız.");
                setTasks(originalTasks); // Revert
            }
        });
    };

    const handleDeleteTask = (taskId: string) => {
        if (!confirm("Bu görevi silmek istediğinize emin misiniz?")) return;

        const originalTasks = [...tasks];
        setTasks(current => current.filter(t => t.id !== taskId));

        startTransition(async () => {
            const res = await deleteProjectTask(committeeId, projectId, taskId);
            if (!res.success) {
                alert(res.error || "Silme işlemi başarısız.");
                setTasks(originalTasks); // Revert
            }
        });
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'planned': return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap border border-yellow-200 dark:border-yellow-900/50">Planlandı</span>;
            case 'in_progress': return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap border border-blue-200 dark:border-blue-900/50">Devam Ediyor</span>;
            case 'completed': return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap border border-emerald-200 dark:border-emerald-900/50">Tamamlandı</span>;
            case 'cancelled': return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap border border-red-200 dark:border-red-900/50">İptal Edildi</span>;
            default: return <span>{status}</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col mt-6">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-gray-500" /> Görev Listesi
                </h3>
                {isPending && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
            </div>

            {/* ─── Mobile Card View ─── */}
            <div className="md:hidden space-y-3 p-3">
                {/* Mobile Add Task Card */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30 space-y-3">
                    <div className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Yeni Görev
                    </div>
                    <input
                        type="text"
                        placeholder="Görev açıklaması..."
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTask(); } }}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newTaskOwner}
                            onChange={(e) => setNewTaskOwner(e.target.value)}
                        >
                            <option value="">Sorumlu (Yok)</option>
                            {committeeMembers.map(m => (
                                <option key={m.userId} value={m.userId}>{m.user?.fullName}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newTaskDate}
                            onChange={(e) => setNewTaskDate(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleCreateTask}
                        disabled={isPending || !newTaskText.trim()}
                        className="w-full text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        Ekle
                    </button>
                </div>

                {/* Task Cards */}
                {tasks.length === 0 ? (
                    <div className="text-center text-sm text-gray-500 italic py-6">Henüz görev eklenmemiş.</div>
                ) : (
                    tasks.map((task, index) => {
                        const isMyTask = task.taskOwnerId === currentUserId;
                        const canEditThisTask = canEditProject || isMyTask;

                        return (
                            <div key={task.id} className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 space-y-2 border-l-4 ${task.taskStatus === 'completed' ? 'border-l-emerald-500 border-gray-200 dark:border-zinc-700' :
                                    task.taskStatus === 'in_progress' ? 'border-l-blue-500 border-gray-200 dark:border-zinc-700' :
                                        task.taskStatus === 'cancelled' ? 'border-l-red-500 border-gray-200 dark:border-zinc-700' :
                                            'border-l-yellow-400 border-gray-200 dark:border-zinc-700'
                                }`}>
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-xs text-gray-400 font-mono mt-1">#{index + 1}</span>
                                    <div className="flex-1">
                                        {canEditThisTask ? (
                                            <input
                                                type="text"
                                                className="w-full bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                value={task.task}
                                                onChange={(e) => handleUpdateTaskField(task.id, 'task', e.target.value)}
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-900 dark:text-gray-100">{task.task}</span>
                                        )}
                                    </div>
                                    {canEditProject && (
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <label className="text-gray-400">Durum</label>
                                        {canEditThisTask ? (
                                            <select
                                                className="w-full mt-0.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded px-2 py-1 text-xs outline-none"
                                                value={task.taskStatus}
                                                onChange={(e) => handleUpdateTaskField(task.id, 'taskStatus', e.target.value)}
                                            >
                                                <option value="planned">Planlandı</option>
                                                <option value="in_progress">Devam Ediyor</option>
                                                <option value="completed">Tamamlandı</option>
                                                <option value="cancelled">İptal Edildi</option>
                                            </select>
                                        ) : (
                                            <div className="mt-0.5"><StatusBadge status={task.taskStatus} /></div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-gray-400">Hedef Tarih</label>
                                        {canEditThisTask ? (
                                            <input
                                                type="date"
                                                className="w-full mt-0.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded px-2 py-1 text-xs outline-none"
                                                value={task.expectedEndDate ? new Date(task.expectedEndDate).toISOString().split('T')[0] : ""}
                                                onChange={(e) => handleUpdateTaskField(task.id, 'expectedEndDate', e.target.value || null)}
                                            />
                                        ) : (
                                            <div className="mt-0.5 flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                                <CalendarIcon className="w-3 h-3 text-gray-400" />
                                                {task.expectedEndDate ? format(new Date(task.expectedEndDate), 'd MMM yyyy', { locale: tr }) : "Belirtilmedi"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-gray-400">Sorumlu</label>
                                        {canEditProject ? (
                                            <select
                                                className="w-full mt-0.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded px-2 py-1 text-xs outline-none"
                                                value={task.taskOwnerId || ""}
                                                onChange={(e) => handleUpdateTaskField(task.id, 'taskOwnerId', e.target.value || null)}
                                            >
                                                <option value="">(Atanmadı)</option>
                                                {committeeMembers.map(m => (
                                                    <option key={m.userId} value={m.userId}>{m.user?.fullName}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="mt-0.5 text-gray-600 dark:text-gray-300">
                                                {task.taskOwner ? task.taskOwner.fullName : <span className="italic text-gray-400">Atanmadı</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ─── Desktop Table View ─── */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-800/80 border-b border-gray-200 dark:border-zinc-700 text-xs text-gray-500 dark:text-gray-400 font-medium">
                            <th className="px-4 py-3 w-10 text-center">#</th>
                            <th className="px-4 py-3 min-w-[250px]">Görev Tanımı</th>
                            <th className="px-4 py-3 w-40">Durum</th>
                            <th className="px-4 py-3 w-48">Sorumlu Kişi</th>
                            <th className="px-4 py-3 w-40">Hedef Tarih</th>
                            {(canEditProject || tasks.some(t => t.taskOwnerId === currentUserId)) && (
                                <th className="px-4 py-3 w-16 text-right">İşlem</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {/* Inline Insert Row */}
                        <tr className="bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <td className="px-4 py-3 text-center text-blue-500 dark:text-blue-400">
                                <Plus className="w-4 h-4 mx-auto" />
                            </td>
                            <td className="px-4 py-2">
                                <input
                                    type="text"
                                    placeholder="Yeni görev yazıp Enter'a basabilirsiniz..."
                                    className="w-full bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleCreateTask();
                                        }
                                    }}
                                />
                            </td>
                            <td className="px-4 py-2">
                                <span className="text-xs text-gray-400 italic">Planlandı</span>
                            </td>
                            <td className="px-4 py-2">
                                <select
                                    className="w-full bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white disabled:opacity-50"
                                    value={newTaskOwner}
                                    onChange={(e) => setNewTaskOwner(e.target.value)}
                                    disabled={!canEditProject}
                                >
                                    <option value="">(Kendime/Bana Atanmasın)</option>
                                    {committeeMembers.map(m => (
                                        <option key={m.userId} value={m.userId}>{m.user?.fullName}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-4 py-2">
                                <input
                                    type="date"
                                    className="w-full bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                                    value={newTaskDate}
                                    onChange={(e) => setNewTaskDate(e.target.value)}
                                />
                            </td>
                            {(canEditProject || tasks.some(t => t.taskOwnerId === currentUserId)) && (
                                <td className="px-4 py-2 text-right">
                                    <button
                                        onClick={handleCreateTask}
                                        disabled={isPending || !newTaskText.trim()}
                                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                        Ekle
                                    </button>
                                </td>
                            )}
                        </tr>

                        {/* Task List */}
                        {tasks.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 italic">
                                    Bu projeye ait henüz bir görev eklenmemiş.
                                </td>
                            </tr>
                        ) : (
                            tasks.map((task, index) => {
                                const isMyTask = task.taskOwnerId === currentUserId;
                                const canEditThisTask = canEditProject || isMyTask;

                                return (
                                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="px-4 py-3 text-center text-gray-400 text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            {canEditThisTask ? (
                                                <input
                                                    type="text"
                                                    className="w-full bg-transparent border-transparent hover:border-gray-200 dark:hover:border-zinc-700 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 rounded px-2 py-1 text-sm outline-none transition-all text-gray-900 dark:text-white"
                                                    value={task.task}
                                                    onChange={(e) => handleUpdateTaskField(task.id, 'task', e.target.value)}
                                                />
                                            ) : (
                                                <span className="px-2 text-sm text-gray-900 dark:text-gray-100">{task.task}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {canEditThisTask ? (
                                                <select
                                                    className="bg-transparent text-sm border-transparent hover:border-gray-200 dark:hover:border-zinc-700 rounded px-1 py-1 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                                    value={task.taskStatus}
                                                    onChange={(e) => handleUpdateTaskField(task.id, 'taskStatus', e.target.value)}
                                                >
                                                    <option value="planned">Planlandı</option>
                                                    <option value="in_progress">Devam Ediyor</option>
                                                    <option value="completed">Tamamlandı</option>
                                                    <option value="cancelled">İptal Edildi</option>
                                                </select>
                                            ) : (
                                                <StatusBadge status={task.taskStatus} />
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {canEditProject ? (
                                                <select
                                                    className="w-full bg-transparent text-sm border-transparent hover:border-gray-200 dark:hover:border-zinc-700 rounded px-1 py-1 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                                    value={task.taskOwnerId || ""}
                                                    onChange={(e) => handleUpdateTaskField(task.id, 'taskOwnerId', e.target.value || null)}
                                                >
                                                    <option value="">(Atanmadı)</option>
                                                    {committeeMembers.map(m => (
                                                        <option key={m.userId} value={m.userId}>{m.user?.fullName}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="px-1 text-sm text-gray-600 dark:text-gray-300">
                                                    {task.taskOwner ? task.taskOwner.fullName : <span className="text-gray-400 italic">Atanmadı</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {canEditThisTask ? (
                                                <input
                                                    type="date"
                                                    className="bg-transparent text-sm border-transparent hover:border-gray-200 dark:hover:border-zinc-700 rounded px-1 py-1 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                                    value={task.expectedEndDate ? new Date(task.expectedEndDate).toISOString().split('T')[0] : ""}
                                                    onChange={(e) => handleUpdateTaskField(task.id, 'expectedEndDate', e.target.value || null)}
                                                />
                                            ) : (
                                                <div className="px-1 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                                                    {task.expectedEndDate ? format(new Date(task.expectedEndDate), 'd MMM yyyy', { locale: tr }) : <span className="text-gray-400 italic">Belirtilmedi</span>}
                                                </div>
                                            )}
                                        </td>
                                        {(canEditProject || tasks.some(t => t.taskOwnerId === currentUserId)) && (
                                            <td className="px-4 py-3 text-right">
                                                {canEditProject && (
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Görevi Sil"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {!canEditProject && isMyTask && (
                                                    <div className="flex justify-end" title="Kendi görevinizi güncelleyebilirsiniz">
                                                        <AlertCircle className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100" />
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
