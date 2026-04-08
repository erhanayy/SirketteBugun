"use client";

import { deleteManualPayment } from "@/lib/actions/superadmin-payments";
import { MoreVertical, Trash2, Loader2, AlertTriangle, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ActionMenu({ paymentId }: { paymentId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDeleteConfirm = () => {
        startTransition(async () => {
            try {
                await deleteManualPayment(paymentId);
                setIsOpen(false);
                setIsConfirming(false);
                router.refresh();
            } catch (error) {
                console.error("Silme hatası:", error);
                alert("Silinirken bir hata oluştu.");
            }
        });
    };

    const openMenu = () => {
        setIsOpen(true);
        setIsConfirming(false);
    };

    const closeMenu = () => {
        setIsOpen(false);
        setIsConfirming(false);
    };

    return (
        <div className="relative inline-block text-left">
            <button
                type="button"
                onClick={openMenu}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreVertical className="w-5 h-5" />}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-30" onClick={closeMenu} />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700 z-40 overflow-hidden">
                        {!isConfirming ? (
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => setIsConfirming(true)}
                                    disabled={isPending}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    İptal Et / Sil
                                </button>
                            </div>
                        ) : (
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-3 text-amber-600">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span className="text-sm font-medium">Silmek istediğinize emin misiniz?</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDeleteConfirm}
                                        disabled={isPending}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 text-white py-1.5 px-3 rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Evet, Sil
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsConfirming(false)}
                                        className="flex items-center justify-center gap-1.5 border border-gray-200 dark:border-zinc-600 py-1.5 px-3 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
                                    >
                                        <X className="w-4 h-4" />
                                        Hayır
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
