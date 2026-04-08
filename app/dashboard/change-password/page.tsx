'use client';

import { useActionState, useEffect } from "react";
import { updateForcedPassword } from "@/lib/actions/auth"; // Need to export this
import { Loader2, Lock, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

const initialState = {
    message: '',
    success: false,
};

export default function ForceChangePasswordPage() {
    const [state, formAction, isPending] = useActionState(updateForcedPassword, initialState);
    const router = useRouter();

    // The server action now directly redirects to /dashboard/home upon success.

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 border border-red-100 dark:border-red-900/30">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Şifre Değişikliği Gerekli</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                        Güvenliğiniz için geçici şifrenizi yenisiyle değiştirmeniz gerekmektedir.
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

                <form action={formAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Yeni Şifre
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="******"
                                required
                                minLength={6}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Yeni Şifre (Tekrar)
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="******"
                                required
                                minLength={6}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending || state.success}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Güncelleniyor...
                            </>
                        ) : state.success ? (
                            "Başarılı!"
                        ) : (
                            "Şifreyi Değiştir ve Devam Et"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
