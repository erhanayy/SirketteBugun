'use client';

import { X, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { approveParticipant } from '@/lib/actions/event';
import { toast } from 'sonner';

interface ParticipantListModalProps {
    isOpen: boolean;
    onClose: () => void;
    participants: any[];
    role?: string; // admin, manager, member
}

export function ParticipantListModal({ isOpen, onClose, participants, role }: ParticipantListModalProps) {
    const [approvingId, setApprovingId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleApprove = async (participantId: string) => {
        setApprovingId(participantId);
        try {
            const res = await approveParticipant(participantId);
            if (res.success) {
                toast.success(res.message);
                // Ideally refresh data or optimistic update. 
                // Since actions revalidatePath, the page might not auto-refresh this modal content unless parent re-renders.
                // We might need to trigger a router refresh in parent or handled via props.
                // For MVP, router.refresh() in parent is key, or simple alert.
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("İşlem başarısız.");
        } finally {
            setApprovingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[80vh]">

                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Katılımcı Listesi ({participants.length})
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 space-y-3">
                    {participants.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Henüz katılımcı yok.</p>
                    ) : (
                        participants.map((p) => {
                            const isConfirmed = p.status === 'confirmed';
                            const isPending = p.status === 'pending_payment';

                            // Check permission
                            const canApprove = (role === 'admin' || role === 'manager') && isPending;

                            return (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium
                                            ${isConfirmed ? 'bg-green-500' : 'bg-blue-500'}`}>
                                            {p.user?.fullName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{p.user?.fullName}</p>
                                            <p className={`text-xs mt-0.5 font-medium
                                                ${isConfirmed ? 'text-green-600' : 'text-blue-600'}`}>
                                                {isConfirmed ? 'Katılıyor' : 'Ödeme Bekliyor'}
                                            </p>
                                        </div>
                                    </div>

                                    {canApprove && (
                                        <button
                                            onClick={() => handleApprove(p.id)}
                                            disabled={!!approvingId}
                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md shadow-sm transition-colors flex items-center gap-1.5"
                                        >
                                            {approvingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                            Onayla
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
