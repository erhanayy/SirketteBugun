/* eslint-disable @next/next/no-img-element */
'use client';

import { upsertBusinessCard } from "@/lib/actions/business_card";
import { useActionState, useState, useRef } from "react";
import { Save, User, Building2, Briefcase, Phone, Mail, GraduationCap, Calendar, Camera, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";

const initialState = {
    error: undefined,
    success: false
} as { error?: string, success: boolean };

export default function UpsertCardForm({ tenantData, existingCard }: { tenantData: any, existingCard?: any }) {
    const [state, action, isPending] = useActionState(upsertBusinessCard, initialState);

    const [photoUrl, setPhotoUrl] = useState(existingCard?.profilePhotoUrl || '');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.url) {
                setPhotoUrl(data.url);
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Fotoğraf yüklenemedi.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (state.success) {
        return (
            <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center">
                <p className="text-lg font-medium mb-4">Kartvizitiniz başarıyla kaydedildi! 🎉</p>
                <Link href="/dashboard/business-cards" className="text-blue-600 hover:underline font-medium">
                    Kartvizitlere Dön
                </Link>
            </div>
        );
    }

    return (
        <form action={action} className="space-y-8">
            <input type="hidden" name="tenantId" value={tenantData.tenantId} />
            <input type="hidden" name="userId" value={tenantData.userId} />
            {/* Provide URL string back to server action */}
            <input type="hidden" name="profilePhotoUrl" value={photoUrl} />

            {/* Global Error */}
            {state.error && typeof state.error === 'string' && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {state.error}
                </div>
            )}

            {/* Profil Fotografi ve Ad Soyad (Fixed) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-gray-100 dark:border-zinc-800">
                <div className="relative group shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-lg relative">
                        {photoUrl ? (
                            <img src={photoUrl} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <User className="w-10 h-10 mb-1 opacity-50" />
                                <span className="text-[10px] uppercase font-bold tracking-wider">Fotoğraf</span>
                            </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white" onClick={() => fileInputRef.current?.click()}>
                            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-8 h-8" />}
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handlePhotoUpload} />
                </div>

                <div className="flex-1 w-full space-y-2 mt-2 sm:mt-0">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Üye Adı Soyadı</label>
                    <input
                        type="text"
                        value={tenantData.userName}
                        disabled
                        className="w-full bg-gray-100 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-500 rounded-lg px-4 py-3 font-semibold outline-none cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400">Ad soyad bilgisi sistemden otomatik çekilmektedir.</p>
                </div>
            </div>

            {/* Zorunlu Şirket Bilgileri */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    Kurumsal Bilgiler
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2 sm:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            Firma Adı
                        </label>
                        <input
                            name="companyName" type="text"
                            value={tenantData.tenantName || ''}
                            readOnly
                            className="w-full bg-gray-100 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-500 rounded-lg px-4 py-2.5 outline-none cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400">Firma adı kayıtlı olduğunuz şirketten otomatik olarak çekilmektedir.</p>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Şirketteki Durumunuz <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="workStatus" value="owner" defaultChecked={existingCard?.workStatus === 'owner'} required className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Firma Sahibi</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="workStatus" value="employee" defaultChecked={existingCard?.workStatus === 'employee'} required className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Çalışan</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pozisyon / Ünvan <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="title" type="text" required placeholder="Örn: Genel Müdür, Yazılım Geliştirici"
                            defaultValue={existingCard?.title}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Zorunlu Iletisim Bilgileri */}
            <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-500" />
                    İletişim Bilgileri
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Telefon <span className="text-red-500">*</span>
                        </label>
                        <PhoneInput
                            name="phone"
                            required={true}
                            defaultValue={existingCard?.phone}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            E-Posta <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="email" type="email" required placeholder="isminiz@sirket.com"
                            defaultValue={existingCard?.email}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Opsiyonel Eğitim & Kişisel */}
            <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-500" />
                    Eğitim & Kişisel (Opsiyonel)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Doktora</label>
                        <input name="educationDoctorate" type="text" placeholder="Üniversite ve Bölüm (Opsiyonel)" defaultValue={existingCard?.educationDoctorate} className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Yüksek Lisans / MBA</label>
                        <input name="educationMaster" type="text" placeholder="Üniversite ve Bölüm (Opsiyonel)" defaultValue={existingCard?.educationMaster} className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Üniversite (Lisans)</label>
                        <input name="educationBachelor" type="text" placeholder="Üniversite ve Bölüm (Opsiyonel)" defaultValue={existingCard?.educationBachelor} className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lise</label>
                        <input name="educationHighSchool" type="text" placeholder="Lise Adı (Opsiyonel)" defaultValue={existingCard?.educationHighSchool} className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Calendar className="w-4 h-4 text-gray-400" /> Doğum Tarihi
                        </label>
                        <input
                            name="birthDate"
                            type="date"
                            defaultValue={existingCard?.birthDate ? new Date(existingCard.birthDate).toISOString().split('T')[0] : ''}
                            className="w-full sm:w-1/2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
                <Link
                    href="/dashboard/business-cards"
                    className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg font-medium transition-colors"
                >
                    İptal
                </Link>
                <button
                    type="submit"
                    disabled={isPending || isUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5" />
                    {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>
        </form>
    );
}
