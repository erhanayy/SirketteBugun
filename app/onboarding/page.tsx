import { createTenant } from "@/lib/actions/tenant";
import { MoveRight, Building2 } from "lucide-react";

export default function OnboardingPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Derneğinizi Oluşturun
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Yönetim panelinize erişmek için şirket bilgilerinizi girin.
                    </p>
                </div>

                {/* Form */}
                <div className="mt-8 bg-white dark:bg-zinc-800/50 py-8 px-4 shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl sm:px-10 backdrop-blur-sm border border-gray-100 dark:border-zinc-700">
                    <form action={createTenant} className="space-y-6">
                        <div>
                            <label
                                htmlFor="shortName"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
                            >
                                Şirket Kısa Adı
                            </label>
                            <div className="mt-2">
                                <input
                                    id="shortName"
                                    name="shortName"
                                    type="text"
                                    required
                                    placeholder="Örn: KYD"
                                    className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:ring-zinc-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="longName"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
                            >
                                Şirket Uzun Adı (Resmi Ad)
                            </label>
                            <div className="mt-2">
                                <input
                                    id="longName"
                                    name="longName"
                                    type="text"
                                    required
                                    placeholder="Örn: Kadıköy Yardımlaşma Şirketi"
                                    className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:ring-zinc-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
                        >
                            <span className="flex items-center gap-2">
                                Oluştur ve Devam Et
                                <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
