'use client';

import { joinEvent } from "@/lib/actions/event";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle, Clock, Hand, Info, Users } from "lucide-react";
import { ParticipantListModal } from "./participant-list-modal";

export function EventSummaryCard({ event, userId, userRole }: { event: any, userId?: string, userRole?: string }) {
    const [loading, setLoading] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);

    // Find current user status
    const participant = event.participants.find((p: any) => p.userId === userId);
    const isJoined = !!participant;
    const status = participant?.status; // 'confirmed', 'pending_payment'

    const handleJoin = async () => {
        setLoading(true);
        try {
            const res = await joinEvent(event.id);
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-4 md:p-6 bg-white dark:bg-zinc-900 shadow-sm mt-6 animate-in slide-in-from-top-2 fade-in duration-300 overflow-hidden">
            <h2 className="text-xl md:text-2xl font-bold mb-2">{event.title}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-4">
                <span>📅 {new Date(event.startDate).toLocaleDateString("tr-TR")}</span>
                {event.location && <span>📍 {event.location}</span>}
                {event.isPaid ? (
                    <span className="text-blue-600 font-medium">💰 {event.price} TL</span>
                ) : (
                    <span className="text-green-600 font-medium">🆓 Ücretsiz</span>
                )}
            </div>

            <div className="prose dark:prose-invert max-w-none mb-6 text-sm line-clamp-3">
                {event.description}
            </div>

            <div className="flex items-center justify-end gap-2">
                {/* Katıl / Katılıyorsun */}
                <button
                    onClick={handleJoin}
                    disabled={loading || isJoined}
                    title={isJoined ? (status === 'confirmed' ? 'Katılıyorsunuz' : 'Ödeme Bekleniyor') : 'Gelmek İstiyorum'}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                        ${isJoined
                            ? (status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
                        } disabled:opacity-50`}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                        isJoined ? (status === 'confirmed' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />) :
                            <Hand className="w-5 h-5" />}
                </button>

                {/* Detaylar */}
                <button
                    title="Detaylar"
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700 transition-colors"
                >
                    <Info className="w-5 h-5" />
                </button>

                {/* Katılımcı Listesi */}
                <button
                    onClick={() => setShowParticipants(true)}
                    title={`Katılımcı Listesi (${event.participants?.length || 0})`}
                    className="relative w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700 transition-colors"
                >
                    <Users className="w-5 h-5" />
                    {event.participants?.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            {event.participants.length}
                        </span>
                    )}
                </button>
            </div>
            {event.isPaid && status === 'pending_payment' && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
                    <p className="font-semibold">Ödeme Gerekli</p>
                    <p>Lütfen katılım ücretini ilgili IBAN'a gönderiniz. Yöneticiler onayladığında renginiz yeşile dönecektir.</p>
                </div>
            )}

            <ParticipantListModal
                isOpen={showParticipants}
                onClose={() => setShowParticipants(false)}
                participants={event.participants}
                role={userRole}
            />
        </div>
    );
}
