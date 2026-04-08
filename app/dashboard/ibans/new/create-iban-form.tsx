'use client';

import { createIban } from "@/lib/actions/iban";
import { useActionState } from "react";
import { Save, Building2, CreditCard, User, Tag, AlertCircle } from "lucide-react";
import Link from "next/link";

const initialState = {
    error: {},
    success: false
} as any;

export default function CreateIbanForm({ tenantId }: { tenantId: string }) {
    const [state, action, isPending] = useActionState(createIban, initialState);

    if (state.success) {
        return (
            <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center">
                <p className="text-lg font-medium mb-4">IBAN başarıyla eklendi! 🎉</p>
                <Link href="/dashboard/ibans" className="text-blue-600 hover:underline">
                    Listeye Dön
                </Link>
            </div>
        );
    }

    return (
        <form action={action} className="space-y-6">
            <input type="hidden" name="tenantId" value={tenantId} />

            {/* Global Error */}
            {state.error && typeof state.error === 'string' && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {state.error}
                </div>
            )}

            {/* Name (Short Description) */}
            <div className="space-y-2">
                <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Tag className="w-4 h-4 text-gray-400" />
                    Hesap Tanımı (Kısa Ad) <span className="text-red-500">*</span>
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Örn: Merkez Hesap, Burs Hesabı"
                    defaultValue={state.values?.name?.toString()}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {state.error?.name && (
                    <p className="text-xs text-red-500 mt-1">{state.error.name[0]}</p>
                )}
            </div>

            {/* Bank Name */}
            <div className="space-y-2">
                <label htmlFor="bankName" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    Banka Adı <span className="text-red-500">*</span>
                </label>
                <input
                    id="bankName"
                    name="bankName"
                    type="text"
                    required
                    placeholder="Örn: Ziraat Bankası"
                    defaultValue={state.values?.bankName?.toString()}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {state.error?.bankName && (
                    <p className="text-xs text-red-500 mt-1">{state.error.bankName[0]}</p>
                )}
            </div>

            {/* IBAN Number */}
            <div className="space-y-2">
                <label htmlFor="ibanNumber" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    IBAN Numarası <span className="text-red-500">*</span>
                </label>
                <input
                    id="ibanNumber"
                    name="ibanNumber"
                    type="text"
                    required
                    placeholder="TR..."
                    defaultValue={state.values?.ibanNumber?.toString()}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
                />
                {state.error?.ibanNumber && (
                    <p className="text-xs text-red-500 mt-1">{state.error.ibanNumber[0]}</p>
                )}
            </div>

            {/* Account Holder */}
            <div className="space-y-2">
                <label htmlFor="accountHolder" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4 text-gray-400" />
                    Hesap Sahibi Adı <span className="text-red-500">*</span>
                </label>
                <input
                    id="accountHolder"
                    name="accountHolder"
                    type="text"
                    required
                    placeholder="Örn: Kadıköy Yardımlaşma Şirketi"
                    defaultValue={state.values?.accountHolder?.toString()}
                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {state.error?.accountHolder && (
                    <p className="text-xs text-red-500 mt-1">{state.error.accountHolder[0]}</p>
                )}
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-700 mt-6">
                <Link
                    href="/dashboard/ibans"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg font-medium transition-colors"
                >
                    İptal
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>
        </form>
    );
}
