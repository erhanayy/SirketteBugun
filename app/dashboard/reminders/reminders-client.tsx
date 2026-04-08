"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Plus, Check, Clock, CalendarDays, RefreshCw, Trash2, BellRing, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createReminder, toggleReminderStatus, deleteReminder } from "@/lib/actions/reminders";

export default function RemindersClient({
    reminders,
    members,
    tenantId,
    currentUserId,
    isManager
}: {
    reminders: any[];
    members: any[];
    tenantId: string;
    currentUserId: string;
    isManager: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assigneeId, setAssigneeId] = useState(currentUserId);
    const [dueDate, setDueDate] = useState<string>("");
    const [dueTime, setDueTime] = useState<string>("09:00");
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringPattern, setRecurringPattern] = useState("daily");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title || !dueDate || !dueTime) return toast.error("Lütfen zorunlu alanları doldurun.");

        setLoading(true);
        const datetime = new Date(`${dueDate}T${dueTime}`);

        const res = await createReminder({
            tenantId,
            creatorId: currentUserId,
            assigneeId,
            title,
            description,
            dueDate: datetime,
            isRecurring,
            recurringPattern: isRecurring ? recurringPattern : undefined,
        });

        if (res.success) {
            toast.success("Hatırlatma eklendi!");
            setIsOpen(false);
            setTitle("");
            setDescription("");
            setDueDate("");
            setIsRecurring(false);
        } else {
            toast.error(res.error || "Bir hata oluştu.");
        }
        setLoading(false);
    }

    async function handleToggle(id: string, currentStatus: string) {
        const res = await toggleReminderStatus(id, currentStatus);
        if (res.success) {
            toast.success("Durum güncellendi.");
        } else {
            toast.error("Hata oluştu.");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Emin misiniz?")) return;
        const res = await deleteReminder(id);
        if (res.success) {
            toast.success("Hatırlatma silindi.");
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <BellRing className="w-8 h-8 text-blue-500" />
                        Hatırlatmalar
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Kendinize veya çalışanlarınıza hatırlatmalar ekleyin.
                    </p>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shrink-0">
                            <Plus className="w-4 h-4 mr-2" /> Yeni Hatırlatma
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Hatırlatma Ekle</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Başlık <span className="text-red-500">*</span></label>
                                <Input placeholder="Örn: Haftalık Rapor Sonu..." value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>

                            {isManager && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Kime <span className="text-red-500">*</span></label>
                                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seçiniz" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {members.map(m => (
                                                <SelectItem key={m.id} value={m.id}>
                                                    {m.id === currentUserId ? "Kendim" : m.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tarih <span className="text-red-500">*</span></label>
                                    <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Saat <span className="text-red-500">*</span></label>
                                    <Input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Açıklama / Detay</label>
                                <Textarea className="resize-none" placeholder="İsteğe bağlı detaylı notlar..." value={description} onChange={e => setDescription(e.target.value)} />
                            </div>

                            <div className="flex items-center space-x-2 pt-2 pb-2">
                                <Checkbox id="recurring" checked={isRecurring} onCheckedChange={(v) => setIsRecurring(!!v)} />
                                <label htmlFor="recurring" className="text-sm font-medium">
                                    Bu hatırlatma tekrarlansın
                                </label>
                            </div>

                            {isRecurring && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-sm font-medium">Tekrar Sıklığı</label>
                                    <Select value={recurringPattern} onValueChange={setRecurringPattern}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Her Gün</SelectItem>
                                            <SelectItem value="weekly">Her Hafta</SelectItem>
                                            <SelectItem value="monthly">Her Ay</SelectItem>
                                            <SelectItem value="yearly">Her Yıl</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? "Ekleniyor..." : "Hatırlatma Oluştur"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden mt-6">
                {reminders.length === 0 ? (
                    <div className="flex flex-col flex-1 items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-blue-300 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Henüz hatırlatma yok</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                            Görevlerinizi ve hatırlatmalarınızı yönetmek için yukarıdaki butondan yeni bir tane oluşturun.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {reminders.map((r) => {
                            // Determine Color coding
                            const isCompleted = r.status === 'completed';
                            let indicatorColor = "bg-gray-400";
                            let iconColor = "text-gray-500";

                            if (isCompleted) {
                                indicatorColor = "bg-green-500";
                                iconColor = "text-green-600";
                            } else if (r.creatorId === currentUserId && r.assigneeId === currentUserId) {
                                // Kendim için oluşturduğum
                                indicatorColor = "bg-yellow-400";
                                iconColor = "text-yellow-600";
                            } else if (r.creatorId !== currentUserId && r.assigneeId === currentUserId) {
                                // Başkası bana atamış
                                indicatorColor = "bg-red-500";
                                iconColor = "text-red-500";
                            } else if (r.creatorId === currentUserId && r.assigneeId !== currentUserId) {
                                // Ben başkasına atamışım (gönderdiklerim)
                                indicatorColor = "bg-purple-500";
                                iconColor = "text-purple-600";
                            }

                            return (
                                <div key={r.id} className="group relative flex items-center p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    {/* Color Indicator Line */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${indicatorColor}`} />

                                    <div className="flex-1 min-w-0 pr-4 flex items-start gap-4">
                                        <button
                                            onClick={() => handleToggle(r.id, r.status)}
                                            className={`shrink-0 mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted
                                                    ? "bg-green-500 border-green-500 text-white"
                                                    : "border-gray-300 hover:border-gray-400 dark:border-zinc-600 dark:hover:border-zinc-500"
                                                }`}
                                        >
                                            {isCompleted && <Check className="w-4 h-4" />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-base font-semibold truncate ${isCompleted ? "text-gray-400 line-through" : "text-gray-900 dark:text-gray-100"
                                                }`}>
                                                {r.title}
                                            </h3>

                                            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                                                <span className="flex items-center gap-1 shrink-0">
                                                    <CalendarDays className="w-3.5 h-3.5" />
                                                    {format(new Date(r.dueDate), "d MMM yyyy, HH:mm", { locale: tr })}
                                                </span>

                                                {r.isRecurring && (
                                                    <span className="flex items-center gap-1 shrink-0 text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-sm text-xs font-medium">
                                                        <RefreshCw className="w-3 h-3" />
                                                        {r.recurringPattern === 'daily' ? 'Günlük' :
                                                            r.recurringPattern === 'weekly' ? 'Haftalık' :
                                                                r.recurringPattern === 'monthly' ? 'Aylık' : 'Yıllık'}
                                                    </span>
                                                )}

                                                {r.creatorId !== currentUserId && r.creator && (
                                                    <span className="flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-sm text-xs font-medium">
                                                        <User className="w-3 h-3" /> {r.creator.fullName} gönderdi
                                                    </span>
                                                )}

                                                {r.assigneeId !== currentUserId && r.assignee && (
                                                    <span className="flex items-center gap-1 text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded-sm text-xs font-medium">
                                                        <User className="w-3 h-3" /> {r.assignee.fullName} kişisine atandı
                                                    </span>
                                                )}
                                            </div>

                                            {r.description && !isCompleted && (
                                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {r.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDelete(r.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full dark:hover:bg-red-900/20 transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div> Kendim İçin</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Bana Atanan</div>
                {isManager && <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div> Benim Atadığım</div>}
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Tamamlanan</div>
            </div>
        </div>
    );
}
