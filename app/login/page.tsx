'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions/auth';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(
        authenticate,
        undefined,
    );

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950">
            <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800">
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="w-24 h-24 flex items-center justify-center mb-4">
                        <Image src="/sirkettebugun-logo-v4.png" alt="Şirkette Bugün" width={100} height={100} className="w-full h-full object-contain scale-150" />
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        Şirkette Bugün
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Yönetim Paneli Girişi</p>
                </div>

                <form action={dispatch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="identifier">
                            E-posta
                        </label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            id="identifier"
                            type="email"
                            name="identifier"
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">
                            Şifre
                        </label>
                        <input
                            className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••"
                            required
                            minLength={4}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Beni Hatırla
                            </label>
                        </div>
                        <div className="text-sm">
                            <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                Şifremi unuttum?
                            </Link>
                        </div>
                    </div>

                    <div
                        className="flex h-8 items-end space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {errorMessage && (
                            <p className="text-sm text-red-500 w-full text-center">{errorMessage}</p>
                        )}
                    </div>

                    <button
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait transition-colors"
                        aria-disabled={isPending}
                    >
                        {isPending ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>
            </div>
        </div>
    );
}
