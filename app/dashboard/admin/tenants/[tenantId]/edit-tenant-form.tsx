'use client';

import { createTenant, updateTenant } from "@/lib/actions/superadmin";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Save, Loader2, Building, AlertCircle } from "lucide-react";

export function EditTenantForm({ initialData }: { initialData: any | null }) {
    const isNew = !initialData;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setIsLoading(true);
        try {
            if (isNew) {
                await createTenant(formData);
            } else {
                await updateTenant(initialData.id, formData);
            }
            router.push('/dashboard/admin/tenants');
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu");
            setIsLoading(false);
        }
    }

    return (
        <form ref={formRef} action={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Şirket Tam Adı (Uzun Ad) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="longName"
                        defaultValue={initialData?.longName || ""}
                        required
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Örn: Kadıköy Yardımlaşma Şirketi"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Kısa Ad / Kısaltma <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="shortName"
                        defaultValue={initialData?.shortName || ""}
                        required
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Örn: KYD"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Logo URL (İsteğe Bağlı)
                    </label>
                    <input
                        type="url"
                        name="logoUrl"
                        defaultValue={initialData?.logoUrl || ""}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://example.com/logo.png"
                    />
                </div>

                {!isNew && (
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                        <input type="hidden" name="isActive" value="false" />
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                value="true"
                                defaultChecked={initialData?.isActive ?? true}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Şirketi Aktif Tut (Giriş Yapılabilir)
                            </span>
                        </label>
                    </div>
                )}
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-zinc-800 flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isNew ? 'Şirketi Oluştur' : 'Değişiklikleri Kaydet'}
                </button>
            </div>
        </form>
    );
}
