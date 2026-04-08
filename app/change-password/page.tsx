'use client';

import { useActionState } from 'react';
import { changePassword } from '@/lib/actions/user';

export default function ChangePasswordPage() {
    const [state, dispatch, isPending] = useActionState(changePassword, undefined);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950">
            <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Şifre Değişikliği Gerekli
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Güvenliğiniz için lütfen şifrenizi değiştirin.
                    </p>
                </div>

                <form action={dispatch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="newPassword">
                            Yeni Şifre
                        </label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            id="newPassword"
                            type="password"
                            name="newPassword"
                            placeholder="••••"
                            required
                            minLength={4}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="confirmPassword">
                            Yeni Şifre (Tekrar)
                        </label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            placeholder="••••"
                            required
                            minLength={4}
                        />
                    </div>

                    <div
                        className="flex h-8 items-end space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {state?.error && (
                            <p className="text-sm text-red-500 w-full text-center">{state.error}</p>
                        )}
                        {state?.success && (
                            <p className="text-sm text-green-500 w-full text-center">Şifre başarıyla güncellendi. Yönlendiriliyorsunuz...</p>
                        )}
                    </div>

                    <button
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait transition-colors"
                        aria-disabled={isPending}
                    >
                        {isPending ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </button>
                </form>
            </div>
        </div>
    );
}
