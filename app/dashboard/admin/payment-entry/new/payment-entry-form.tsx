'use client';

import { createManualPayment, searchTenantUsers } from "@/lib/actions/superadmin";
import { useState, useTransition, useEffect } from "react";
import { Loader2, CheckCircle, AlertCircle, Building, User, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";

export function PaymentEntryForm({ offers, tenants }: { offers: any[], tenants: any[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const [targetType, setTargetType] = useState<'tenant' | 'user'>('tenant');
    const [selectedTenantId, setSelectedTenantId] = useState<string>('');
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);

    // Debounced search for users
    useEffect(() => {
        if (targetType === 'tenant' || userSearchTerm.length < 2) {
            setSearchedUsers([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearchingUsers(true);
            try {
                const results = await searchTenantUsers(userSearchTerm);
                setSearchedUsers(results);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearchingUsers(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [userSearchTerm, targetType]);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        const formData = new FormData(e.currentTarget);

        // Append missing dropdown values visually controlled by state
        formData.append("targetType", targetType);
        formData.append("targetId", targetType === 'tenant' ? selectedTenantId : selectedUserId);

        startTransition(async () => {
            try {
                await createManualPayment(formData);
                setSuccess(true);
                // Redirect back to payment entry list
                router.push('/dashboard/admin/payment-entry');
                router.refresh();
            } catch (err: any) {
                setError(err.message || "Ödeme işlenirken bir hata oluştu.");
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    Paket ataması / Ödeme girişi başarıyla eklendi!
                </div>
            )}

            {/* Hedef Seçimi (Tabs) */}
            <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                    type="button"
                    onClick={() => { setTargetType('tenant'); setSelectedUserId(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${targetType === 'tenant' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Building className="w-4 h-4" />
                    Şirket İçin (Tüm Üyeler)
                </button>
                <button
                    type="button"
                    onClick={() => { setTargetType('user'); setSelectedTenantId(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${targetType === 'user' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <User className="w-4 h-4" />
                    Belirli Bir Kullanıcı İçin
                </button>
            </div>

            <div className="space-y-5">
                {/* Dynamically render target selector */}
                {targetType === 'tenant' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Şirket (Tenant) Seçin <span className="text-red-500">*</span>
                        </label>
                        <select
                            required={targetType === 'tenant'}
                            value={selectedTenantId}
                            onChange={(e) => setSelectedTenantId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="" disabled>-- Seçiniz --</option>
                            {tenants.map(t => (
                                <option key={t.id} value={t.id}>{t.longName} ({t.shortName})</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Kullanıcıyı Arayın (Mevcut Komite Üyeleri) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="İsim veya e-posta girin..."
                                value={userSearchTerm}
                                onChange={(e) => {
                                    setUserSearchTerm(e.target.value);
                                    if (e.target.value.length < 2) setSelectedUserId(''); // reset
                                }}
                                className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {isSearchingUsers && (
                                <Loader2 className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 animate-spin" />
                            )}
                        </div>

                        {/* Arama Sonuçları */}
                        {searchedUsers.length > 0 && !selectedUserId && (
                            <div className="mt-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 shadow-md max-h-48 overflow-y-auto">
                                {searchedUsers.map(u => (
                                    <div
                                        key={u.tenantUserId}
                                        onClick={() => {
                                            setSelectedUserId(u.tenantUserId);
                                            setUserSearchTerm(`${u.userName} (${u.tenantName})`);
                                            setSearchedUsers([]);
                                        }}
                                        className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer border-b border-gray-100 dark:border-zinc-700 last:border-0"
                                    >
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{u.userName} <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded ml-2">{u.tenantName}</span></div>
                                        <div className="text-sm text-gray-500">{u.userEmail}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchedUsers.length === 0 && userSearchTerm.length >= 2 && !isSearchingUsers && !selectedUserId && (
                            <p className="text-xs text-gray-500 mt-2">Kullanıcı bulunamadı.</p>
                        )}
                    </div>
                )}

                {/* Offer Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Paket (Offer) <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="offerId"
                        required
                        defaultValue=""
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="" disabled>-- Aktif Paketlerden Seçiniz --</option>
                        {offers.filter(o => targetType === 'tenant' ? o.isTenantOffer : o.isTenantUserOffer).map(o => (
                            <option key={o.id} value={o.id}>ID: {o.id.substring(0, 8)} - (Fiyat Tipi: {o.price / 100} TL / {o.year} Yıl)</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Sadece geçerli hedef türüne göre (Bireysel/Kurumsal) paketler listelenir.</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" /> Başlangıç Tarihi <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            required
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" /> Bitiş Tarihi <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            required
                            // Default to +1 year
                            defaultValue={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 outline-none"
                        />
                    </div>
                </div>

            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-zinc-800 flex justify-end">
                <button
                    type="submit"
                    disabled={isPending || (targetType === 'tenant' ? !selectedTenantId : !selectedUserId)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    Ödemeyi İşle ve Aktif Et
                </button>
            </div>
        </form>
    );
}
