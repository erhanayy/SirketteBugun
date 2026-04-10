'use client';

import { useActionState } from "react";
import { forgotPassword } from "@/lib/actions/auth";
import Link from "next/link";
import { ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";

const initialState = {
    message: '',
    success: false,
};

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(forgotPassword, initialState);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-zinc-700">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Şifremi Unuttum</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                        Kayıtlı telefon numaranızı ve e-posta adresinizi girin. Size geçici bir şifre göndereceğiz.
                    </p>
                </div>

                {state.message && (
                    <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${state.success
                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"
                        }`}>
                        {state.message}
                    </div>
                )}

                {!state.success ? (
                    <form action={formAction} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Telefon Numarası
                            </label>
                            <PhoneInput
                                name="phone"
                                required={true}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                E-Posta Adresi
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="ornek@email.com"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Gönderiliyor...
                                </>
                            ) : (
                                "Geçici Şifre Gönder"
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <Link
                            href="/login"
                            className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                        >
                            Giriş Yap
                        </Link>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 flex items-center justify-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Giriş ekranına dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
