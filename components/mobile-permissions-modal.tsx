'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/lib/hooks/use-permissions';
import {
    Camera,
    Image as ImageIcon,
    FileText,
    ShieldCheck,
    ChevronRight,
    Lock
} from 'lucide-react';

export function MobilePermissionsModal() {
    const { permissions, isNative, requestAll, checkAllPermissions } = usePermissions();
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Only show if native and permissions are not already decided
        if (isNative) {
            const hasSeen = localStorage.getItem('hasSeenPermissionOnboarding');
            if (!hasSeen && (permissions.camera === 'prompt' || permissions.photos === 'prompt')) {
                setShow(true);
            }
        }
    }, [isNative, permissions]);

    const handleGrantAll = () => {
        localStorage.setItem('hasSeenPermissionOnboarding', 'true');
        setShow(false);
        // Request asynchronously without blocking the UI
        requestAll().catch(console.error);
    };

    const handleDismiss = () => {
        localStorage.setItem('hasSeenPermissionOnboarding', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col pt-20 px-6 animate-in slide-in-from-bottom duration-500">
            <div className="flex-1 space-y-8">
                <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Erişim İzinleri</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Uygulamayı tam performansla kullanabilmeniz için aşağıdaki izinlere ihtiyaç duyuyoruz.
                    </p>
                </div>

                <div className="space-y-4">
                    <PermissionItem
                        icon={Camera}
                        title="Kamera"
                        desc="Profil fotoğrafı çekmek ve paylaşım yapmak için gereklidir."
                    />
                    <PermissionItem
                        icon={ImageIcon}
                        title="Fotoğraflar"
                        desc="Galerinizden görsel seçebilmek için gereklidir."
                    />
                    <PermissionItem
                        icon={FileText}
                        title="Dosyalar"
                        desc="Aidat makbuzu ve doküman yükleme için kullanılır."
                    />
                </div>
            </div>

            <div className="pb-12 space-y-3">
                <button
                    onClick={handleGrantAll}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    İzinleri Yönet <ChevronRight className="w-5 h-5" />
                </button>
                <button
                    onClick={handleDismiss}
                    className="w-full py-4 text-gray-500 dark:text-gray-400 font-medium text-sm flex items-center justify-center gap-2"
                >
                    <Lock className="w-4 h-4" /> İhtiyaç halinde karar vereceğim
                </button>
            </div>
        </div>
    );
}

function PermissionItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-1">
                <h3 className="font-bold text-sm">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
