"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Plus, Trash2, LayoutList, Check, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createApprovalFlow, deleteApprovalFlow } from "@/lib/actions/approvals";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function ApprovalsAdminClient({ tenantId, initialFlows }: { tenantId: string, initialFlows: any[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form
    const [name, setName] = useState("");
    const [approvalLevel, setApprovalLevel] = useState("1"); // "1", "2", "3", "0" (0=top)
    const [fields, setFields] = useState<{ id: string, name: string, type: string, required: boolean, options?: string }[]>([]);

    const addField = () => {
        setFields([...fields, { id: Date.now().toString(), name: "", type: "text", required: false, options: "" }]);
    };

    const updateField = (index: number, key: string, value: any) => {
        const newFields = [...fields];
        (newFields[index] as any)[key] = value;
        setFields(newFields);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return toast.error("Akış adı zorunludur.");
        if (fields.length === 0) return toast.error("En az bir alan eklemelisiniz.");
        if (fields.some(f => !f.name.trim())) return toast.error("Eksik alan isimlerini doldurun.");

        setLoading(true);
        const res = await createApprovalFlow({
            tenantId,
            name,
            approvalLevel: parseInt(approvalLevel, 10),
            fields
        });

        if (res.success) {
            toast.success("Akış başarıyla oluşturuldu.");
            setIsAddOpen(false);
            setName("");
            setFields([]);
            setApprovalLevel("1");
        } else {
            toast.error(res.error || "Bir hata oluştu.");
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu akışı silmerseniz, ona bağlı olan açık talepler yetim kalabilir. Emin misiniz?")) return;
        const res = await deleteApprovalFlow(id);
        if (res.success) {
            toast.success("Akış silindi.");
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Akış Tanımlama</h2>
                    <p className="text-sm text-gray-500 mt-1">Şirket genelinde kullanılacak onay süreçlerini yönetin.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center shrink-0">
                            <Plus className="w-5 h-5" />
                            Yeni Akış Ekle
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Yeni Akış Tanımla</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-6 mt-4">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Akış Adı <span className="text-red-500">*</span></label>
                                    <Input placeholder="Örn: Yıllık İzin Talebi, Masraf Formu..." value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Kime Kadar Onaya Gidecek?</label>
                                    <Select value={approvalLevel} onValueChange={setApprovalLevel}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1. Yöneticiye Kadar</SelectItem>
                                            <SelectItem value="2">2. Yöneticiye Kadar</SelectItem>
                                            <SelectItem value="0">En Üst Yöneticiye Kadar (Top Level)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-gray-900 dark:text-white">Form Alanları</label>
                                    <Button type="button" variant="outline" size="sm" onClick={addField} className="gap-1 rounded-full">
                                        <Plus className="w-4 h-4" /> Alan Ekle
                                    </Button>
                                </div>

                                {fields.length === 0 ? (
                                    <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-dashed border-gray-300 dark:border-zinc-600">
                                        Henüz hiç alan eklemediniz.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {fields.map((field, idx) => (
                                            <div key={field.id} className="flex flex-col gap-3 bg-gray-50 dark:bg-zinc-800/80 p-3 rounded-lg border border-gray-200 dark:border-zinc-700">
                                                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full">
                                                    <Input
                                                        placeholder="Soru/Alan Adı"
                                                        value={field.name}
                                                        onChange={e => updateField(idx, 'name', e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    <Select value={field.type} onValueChange={(val) => updateField(idx, 'type', val)}>
                                                        <SelectTrigger className="w-[140px] bg-white dark:bg-zinc-900 shrink-0">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="text">Kısa Metin</SelectItem>
                                                            <SelectItem value="textarea">Uzun Metin (Not)</SelectItem>
                                                            <SelectItem value="number">Sayı / Tutar</SelectItem>
                                                            <SelectItem value="date">Tarih</SelectItem>
                                                            <SelectItem value="listbox">Geniş Seçim (Listbox)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="flex items-center gap-2 px-2 shrink-0">
                                                        <Switch
                                                            checked={field.required}
                                                            onCheckedChange={checked => updateField(idx, 'required', checked)}
                                                        />
                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Zorunlu</span>
                                                    </div>
                                                    <button type="button" onClick={() => removeField(idx)} className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {field.type === 'listbox' && (
                                                    <Input
                                                        placeholder="Seçenekleri noktalı virgül (;) ile ayırabilirsiniz. Örn: Ankara;İstanbul;İzmir"
                                                        value={field.options || ""}
                                                        onChange={e => updateField(idx, 'options', e.target.value)}
                                                        className="w-full bg-white dark:bg-zinc-900"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 mt-4 rounded-lg">
                                {loading && <span className="mr-2 animate-spin">⌛</span>}
                                Akışı Kaydet
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {initialFlows.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 border-dashed">
                        <LayoutList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Henüz tanımlanmış bir onay akışı bulunmuyor.</p>
                    </div>
                ) : (
                    initialFlows.map(flow => (
                        <div key={flow.id} className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm relative group flex flex-col h-full hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                            <div className="mb-4">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{flow.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mr-2">
                                        {flow.approvalLevel === 0 ? "En Üst Yönetici" : `${flow.approvalLevel}. Yönetici`}
                                    </span>
                                </p>
                            </div>

                            <div className="flex-1 bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="font-semibold mb-2">Form Alanları ({flow.fields.length}):</div>
                                <ul className="space-y-1 pl-4 list-disc marker:text-gray-300">
                                    {flow.fields.slice(0, 3).map((f: any) => (
                                        <li key={f.id} className="truncate">{f.name} {f.required && <span className="text-red-500">*</span>}</li>
                                    ))}
                                    {flow.fields.length > 3 && <li className="text-gray-400 text-xs italic">+{flow.fields.length - 3} alan daha...</li>}
                                </ul>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
                                <span className="text-xs text-gray-400">
                                    {format(new Date(flow.createdAt), "d MMM yyyy", { locale: tr })}
                                </span>
                                <button onClick={() => handleDelete(flow.id)} className="text-sm font-medium text-red-500 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
