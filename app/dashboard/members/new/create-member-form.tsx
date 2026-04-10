'use client';

import { createMember } from "@/lib/actions/member";
import { ArrowLeft, Save, User, Phone, Mail, Shield, AlertCircle, Check } from "lucide-react";
import Link from "next/link";
import { PhoneInput } from "@/components/ui/phone-input";
import { useActionState } from 'react'; // React 19 / Next 15+
// If useActionState is not found, fallback to import { useFormState } from 'react-dom';

// We need to define the initial state structure
const initialState = {
    error: {},
    success: false
} as any;

export default function CreateMemberForm() {
    // Using useActionState (or useFormState) to handle server action result
    const [state, action, isPending] = useActionState(createMember, initialState);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/members"
                    className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Yeni Çalışan Kaydı</h2>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                <form action={action} className="space-y-6">

                    {/* Global Error Message */}
                    {(!state.success && (state.error || state.message)) && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <div>
                                {typeof state.error === 'string' ? state.error : state.message}
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {state.success && (
                        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            {state.message || "İşlem başarılı."}
                        </div>
                    )}

                    {/* Full Name */}
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <User className="w-4 h-4 text-gray-400" />
                            Ad Soyad <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            defaultValue={state.values?.fullName?.toString() || ""}
                            placeholder="Örn: Ahmet Yılmaz"
                            className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        {state.error?.fullName && (
                            <p className="text-xs text-red-500 mt-1">{state.error.fullName[0]}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <label htmlFor="phoneNumber" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Phone className="w-4 h-4 text-gray-400" />
                            Telefon Numarası <span className="text-red-500">*</span>
                        </label>
                        <PhoneInput
                            name="phoneNumber"
                            required={true}
                            defaultValue={state.values?.phoneNumber?.toString() || ""}
                            className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        {state.error?.phoneNumber && (
                            <p className="text-xs text-red-500 mt-1">{state.error.phoneNumber[0]}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Mail className="w-4 h-4 text-gray-400" />
                            E-posta Adresi
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={state.values?.email?.toString() || ""}
                            placeholder="ahmet@ornek.com"
                            className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        {state.error?.email && (
                            <p className="text-xs text-red-500 mt-1">{state.error.email[0]}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Çalışan Tipi <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="role"
                            name="role"
                            defaultValue={state.values?.role?.toString() || "staff"}
                            className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                        >
                            <option value="staff">Şirket Çalışanı</option>
                            <option value="admin">Şirket Yöneticisi</option>
                        </select>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-700 mt-6">
                        <Link
                            href="/dashboard/members"
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
            </div>
        </div>
    );
}
