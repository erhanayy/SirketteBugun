'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, Crown, LayoutDashboard, Settings, Star, Zap, X } from "lucide-react";
import { getActiveOffers, getPremiumIbanDetails } from "@/lib/actions/premium";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userRole?: string;
}

export function PremiumUpsellModal({ open, onOpenChange, userRole }: Props) {
    const [offers, setOffers] = useState<{ tenantOffers: any[], userOffers: any[] }>({ tenantOffers: [], userOffers: [] });
    const [ibanDetails, setIbanDetails] = useState({ accountName: '', bankName: '', iban: '' });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open) {
            setLoading(true);
            Promise.all([getActiveOffers(), getPremiumIbanDetails()]).then(([offersData, ibanData]) => {
                setOffers(offersData);
                setIbanDetails(ibanData);
                setLoading(false);
            });
        }
    }, [open]);

    const handleCopy = () => {
        if (ibanDetails.iban) {
            navigator.clipboard.writeText(ibanDetails.iban);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 p-0 border-0 flex flex-col max-h-[90vh] overflow-hidden [&>button:last-child]:hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-amber-200 to-yellow-500 dark:from-yellow-600 dark:to-amber-900 p-4 pb-6 pt-8 text-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-20 hidden sm:block">
                        <Crown className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <DialogTitle className="text-2xl sm:text-3xl font-extrabold text-yellow-950 dark:text-yellow-50">
                            DernekteBugün Premium
                        </DialogTitle>
                        <DialogDescription className="text-yellow-900 dark:text-yellow-100 text-sm sm:text-base font-medium max-w-md mx-auto">
                            Limitsiz mesajlaşma, reklamsız deneyim ve büyük dosya yükleme ayrıcalıklarını hemen keşfedin.
                        </DialogDescription>

                        {/* Features List moved inside header */}
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold mt-3">
                            <div className="flex items-center gap-1.5 text-yellow-900 dark:text-yellow-100 bg-white/30 dark:bg-black/20 px-3 py-1.5 rounded-full shadow-sm">
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                Limitsiz Mesajlaşma
                            </div>
                            <div className="flex items-center gap-1.5 text-yellow-900 dark:text-yellow-100 bg-white/30 dark:bg-black/20 px-3 py-1.5 rounded-full shadow-sm">
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                Reklamsız Deneyim
                            </div>
                            <div className="flex items-center gap-1.5 text-yellow-900 dark:text-yellow-100 bg-white/30 dark:bg-black/20 px-3 py-1.5 rounded-full shadow-sm">
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                Büyük Dosya Gönderimi
                            </div>
                        </div>
                    </div>
                </div>



                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                        </div>
                    ) : (
                        <div className="space-y-4 pr-1">
                            {/* Manager / Corporate Offers */}
                            {offers.tenantOffers.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent"></div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md">
                                            Kurumsal (Şirket) Paketleri
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent"></div>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        {offers.tenantOffers.map(offer => (
                                            <div key={offer.id} className="w-full sm:w-[320px] border border-zinc-200 dark:border-zinc-800 rounded-xl p-0 flex bg-white dark:bg-zinc-900 hover:border-amber-400 dark:hover:border-amber-600 transition-colors shadow-sm hover:shadow-md overflow-hidden group">
                                                {/* Sol Taraf İkon Alanı */}
                                                <div className="w-24 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 flex flex-col items-center justify-center border-r border-amber-100 dark:border-amber-900/40 p-4 transition-colors group-hover:from-amber-100 group-hover:to-amber-200 dark:group-hover:from-amber-800/40 dark:group-hover:to-amber-700/30">
                                                    <Building className="w-10 h-10 text-amber-500 dark:text-amber-400" />
                                                </div>

                                                {/* Sağ Taraf Fiyat Alanı */}
                                                <div className="flex-1 p-5 flex flex-col justify-center">
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">{offer.year} Kurumsal Paket</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                                            {new Intl.NumberFormat('tr-TR').format(offer.price)}
                                                        </span>
                                                        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">TL</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* User Offers */}
                            {offers.userOffers.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent"></div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md">
                                            {offers.tenantOffers.length > 0 ? 'Bireysel (Üye) Paketleri' : 'Premium Paketler'}
                                        </span>
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent"></div>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        {offers.userOffers.map(offer => (
                                            <div key={offer.id} className="w-full sm:w-[320px] border border-zinc-200 dark:border-zinc-800 rounded-xl p-0 flex bg-white dark:bg-zinc-900 hover:border-amber-400 dark:hover:border-amber-600 transition-colors shadow-sm hover:shadow-md overflow-hidden group">
                                                {/* Sol Taraf İkon Alanı */}
                                                <div className="w-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 flex flex-col items-center justify-center border-r border-blue-100 dark:border-blue-900/40 p-4 transition-colors group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-800/40 dark:group-hover:to-blue-700/30">
                                                    <Users className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                                                </div>

                                                {/* Sağ Taraf Fiyat Alanı */}
                                                <div className="flex-1 p-5 flex flex-col justify-center">
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">{offer.year} Bireysel Paket</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                                            {new Intl.NumberFormat('tr-TR').format(offer.price)}
                                                        </span>
                                                        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">TL</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {offers.userOffers.length === 0 && offers.tenantOffers.length === 0 && (
                                <div className="text-center py-8 text-zinc-500">
                                    Şu an için aktif bir paket bulunmamaktadır.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                    <p className="text-sm font-medium text-center text-zinc-600 dark:text-zinc-400 mb-3">
                        Ödemenizi alttaki şirket hesabımıza <span className="text-amber-600 dark:text-amber-500 font-bold">havale/EFT</span> ile ileterek yapabilirsiniz.
                    </p>

                    {ibanDetails.iban && (
                        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm max-w-lg mx-auto relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Hesap:</span>
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    {ibanDetails.bankName} - {ibanDetails.accountName}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-1.5 border border-zinc-100 dark:border-zinc-800">
                                <code className="text-sm font-mono text-zinc-800 dark:text-zinc-200 tracking-wider">
                                    {ibanDetails.iban}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="h-7 px-2 gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs"
                                >
                                    {copied ? (
                                        <><Check className="w-3 h-3 text-green-500" /> Kopyalandı</>
                                    ) : (
                                        <><Copy className="w-3 h-3 text-zinc-500" /> Kopyala</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex justify-end">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto min-w-[100px] text-xs h-8">
                            Kapat
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// These imports are used above but were missing from the previous import block to avoid error
import { Building, Users } from "lucide-react";
