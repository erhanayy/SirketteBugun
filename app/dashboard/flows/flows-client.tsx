"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Plus, Check, X, FileText, Upload, CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createApprovalRequest, processApproval } from "@/lib/actions/approvals";

export default function FlowsClient({ tenantId, userId, flows, myRequests, pendingApprovals }: any) {
    const [activeTab, setActiveTab] = useState<'mine' | 'pending'>('mine');

    // New Request State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedFlowId, setSelectedFlowId] = useState("");
    const [fieldData, setFieldData] = useState<any>({});
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // Approval View State
    const [viewRequest, setViewRequest] = useState<any>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const activeFlow = flows.find((f: any) => f.id === selectedFlowId);

    const handleFieldChange = (key: string, value: any) => {
        setFieldData({ ...fieldData, [key]: value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFlowId) return toast.error("Lütfen bir akış seçin");

        // Check required fields
        if (activeFlow) {
            for (let field of activeFlow.fields) {
                if (field.required && !fieldData[field.name]) {
                    return toast.error(`${field.name} alanı zorunludur.`);
                }
            }
        }

        setLoading(true);
        let attachmentUrl = "";

        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (res.ok) {
                    const data = await res.json();
                    attachmentUrl = data.url;
                } else {
                    toast.error("Dosya yüklenemedi. Form dosyasız gönderilecek.");
                }
            } catch (e) {
                toast.error("Dosya yüklenemedi.");
            }
        }

        const res = await createApprovalRequest({
            tenantId,
            flowId: selectedFlowId,
            requesterId: userId,
            fieldData,
            attachmentUrl
        });

        if (res.success) {
            toast.success("Talebiniz onaya gönderildi!");
            setIsAddOpen(false);
            setFieldData({});
            setFile(null);
            setSelectedFlowId("");
        } else {
            toast.error(res.error);
            if (res.error?.includes("Hiyerarşi")) {
                // Keep modal open to show error
            }
        }
        setLoading(false);
    };

    const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
        if (!confirm(`Talebi ${action === 'approve' ? 'onaylamak' : 'reddetmek'} istediğinize emin misiniz?`)) return;
        setLoading(true);
        const res = await processApproval(requestId, userId, action);
        if (res.success) {
            toast.success(action === 'approve' ? "Talep Onaylandı!" : "Talep Reddedildi.");
            setIsViewOpen(false);
            setViewRequest(null);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Akış Yönetimi</h2>
                    <p className="text-sm text-gray-500 mt-1">İzin, Masraf veya farklı taleplerinizi iletin ve onaylayın.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center shrink-0">
                            <Plus className="w-5 h-5" />
                            Yeni Talep Başlat
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Yeni Akış Başlat</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-5 mt-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Talep Tipi (Akış)</label>
                                <Select value={selectedFlowId} onValueChange={(val) => { setSelectedFlowId(val); setFieldData({}); }}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Bir akış seçin..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {flows.map((f: any) => (
                                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {activeFlow && (
                                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
                                    {activeFlow.fields.map((field: any) => (
                                        <div key={field.id} className="space-y-1.5">
                                            <label className="text-sm font-medium">
                                                {field.name} {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                            {field.type === 'textarea' ? (
                                                <Textarea
                                                    value={fieldData[field.name] || ""}
                                                    onChange={e => handleFieldChange(field.name, e.target.value)}
                                                    required={field.required}
                                                />
                                            ) : field.type === 'listbox' ? (
                                                <Select
                                                    value={fieldData[field.name] || ""}
                                                    onValueChange={(val) => handleFieldChange(field.name, val)}
                                                    required={field.required}
                                                >
                                                    <SelectTrigger className="w-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                                                        <SelectValue placeholder="Seçim yapın..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {field.options?.split(';').map((opt: string) => opt.trim()).filter(Boolean).map((opt: string, i: number) => (
                                                            <SelectItem key={i} value={opt}>{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : field.type === 'number' ? (
                                                <Input
                                                    type="number"
                                                    value={fieldData[field.name] || ""}
                                                    onChange={e => handleFieldChange(field.name, e.target.value)}
                                                    required={field.required}
                                                />
                                            ) : field.type === 'date' ? (
                                                <Input
                                                    type="date"
                                                    value={fieldData[field.name] || ""}
                                                    onChange={e => handleFieldChange(field.name, e.target.value)}
                                                    required={field.required}
                                                />
                                            ) : (
                                                <Input
                                                    type="text"
                                                    value={fieldData[field.name] || ""}
                                                    onChange={e => handleFieldChange(field.name, e.target.value)}
                                                    required={field.required}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    <div className="space-y-1.5 pt-2">
                                        <label className="text-sm font-medium">Ek Dosya / Belge (Opsiyonel)</label>
                                        <div className="flex items-center gap-2">
                                            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button type="submit" disabled={!selectedFlowId || loading} className="w-full bg-blue-600 hover:bg-blue-700">
                                {loading && <span className="mr-2 animate-spin">⌛</span>}
                                Talebi Gönder
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex border-b border-gray-200 dark:border-zinc-800">
                <button
                    onClick={() => setActiveTab('mine')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'mine' ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Taleplerim ({myRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'pending' ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Onay Bekleyenler
                    {pendingApprovals.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 h-4 min-w-[16px] rounded-full flex items-center justify-center">
                            {pendingApprovals.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTab === 'mine' ? (
                    myRequests.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 border-dashed">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Henüz oluşturduğunuz bir talep bulunmuyor.</p>
                        </div>
                    ) : (
                        myRequests.map((req: any) => (
                            <div key={req.id} className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col h-full hover:border-blue-400 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{req.flow?.name || 'Bilinmeyen Akış'}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${req.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                                        req.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                            'bg-orange-100 text-orange-700 dark:bg-orange-900/30'
                                        }`}>
                                        {req.status === 'approved' ? 'ONAYLANDI' : req.status === 'rejected' ? 'RED' : 'BEKLİYOR'}
                                    </span>
                                </div>
                                <div className="flex-1 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    {Object.entries(req.fieldData).slice(0, 2).map(([k, v]: any) => (
                                        <div key={k}><strong className="text-gray-900 dark:text-gray-300">{k}:</strong> {v}</div>
                                    ))}
                                    {Object.keys(req.fieldData).length > 2 && <div className="text-xs italic">...</div>}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-between items-center text-xs text-gray-400">
                                    <span>{format(new Date(req.createdAt), 'd MMM yyyy, HH:mm', { locale: tr })}</span>
                                    {req.status === 'pending' && <span className="text-orange-500">Sırada: {req.currentApprover?.fullName || 'Yönetici'}</span>}
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    pendingApprovals.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 border-dashed">
                            <Check className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Onayınızı bekleyen herhangi bir işlem bulunmuyor.</p>
                        </div>
                    ) : (
                        pendingApprovals.map((req: any) => (
                            <div key={req.id} className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col h-full hover:border-blue-400 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{req.flow?.name || 'Akış'}</h3>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">Onayınızda</span>
                                </div>

                                <div className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Kimden: {req.requester?.fullName}
                                </div>

                                <div className="flex-1 space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-zinc-900/50 p-2 rounded-lg truncate">
                                    {Object.entries(req.fieldData).slice(0, 2).map(([k, v]: any) => (
                                        <div key={k} className="truncate"><strong className="text-gray-900 dark:text-gray-300">{k}:</strong> {v}</div>
                                    ))}
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full" onClick={() => setViewRequest(req)}>Görüntüle ve İşlem Yap</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>{req.requester?.fullName} - {req.flow?.name}</DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4 space-y-4">
                                            <div className="bg-gray-50 dark:bg-zinc-900/70 p-4 rounded-lg space-y-3 text-sm">
                                                {Object.entries(req.fieldData).map(([k, v]: any) => (
                                                    <div key={k} className="border-b border-gray-200 dark:border-zinc-800 pb-2 last:border-0 last:pb-0">
                                                        <div className="text-xs text-gray-500 mb-1">{k}</div>
                                                        <div className="font-medium">{v}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {req.attachmentUrl && (
                                                <div className="flex items-center gap-3 p-3 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg">
                                                    <FileText className="text-blue-600 w-5 h-5" />
                                                    <a href={req.attachmentUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline flex-1">
                                                        Ek Dosyayı Görüntüle
                                                    </a>
                                                </div>
                                            )}

                                            <div className="flex gap-3 pt-4">
                                                <Button
                                                    onClick={() => handleAction(req.id, 'reject')}
                                                    disabled={loading}
                                                    variant="destructive"
                                                    className="flex-1"
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Reddet
                                                </Button>
                                                <Button
                                                    onClick={() => handleAction(req.id, 'approve')}
                                                    disabled={loading}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Onayla
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
}
