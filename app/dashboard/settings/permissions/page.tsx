'use client';

import { usePermissions } from '@/lib/hooks/use-permissions';
import {
    Camera,
    Image as ImageIcon,
    FileText,
    ChevronRight,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function PermissionsPage() {
    const { permissions, isNative, requestPermission } = usePermissions();

    if (!isNative) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-6 text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="w-12 h-12" />
                </div>
                <h1 className="text-2xl font-bold">Web Tarayıcı Modu</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Sistem izinleri yönetimi sadece mobil uygulamalar (Android/iOS) için geçerlidir.
                    Tarayıcı üzerinden erişimlerde sistem sizi otomatik olarak uyaracaktır.
                </p>
                <Link href="/dashboard/settings" className="inline-flex items-center gap-2 text-blue-600 font-medium">
                    <ArrowLeft className="w-4 h-4" /> Ayarlara Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/settings" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Uygulama İzinleri</h1>
                    <p className="text-sm text-gray-500">Mobil özelliklere erişim durumunuzu buradan yönetin.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50 dark:divide-zinc-800">
                    <PermissionRow
                        icon={Camera}
                        title="Kamera"
                        status={permissions.camera}
                        onRequest={() => requestPermission('camera')}
                    />
                    <PermissionRow
                        icon={ImageIcon}
                        title="Fotoğraflar"
                        status={permissions.photos}
                        onRequest={() => requestPermission('photos')}
                    />
                    <PermissionRow
                        icon={FileText}
                        title="Dosyalar"
                        status={permissions.files}
                        onRequest={() => requestPermission('files')}
                    />
                </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    <strong>Not:</strong> Eğer bir izni "Asla sorma" diyerek reddettiyseniz,
                    tekrar aktif etmek için cihazınızın <strong>Ayarlar &gt; Uygulamalar &gt; DernekteBugün</strong> bölümüne gitmeniz gerekebilir.
                </p>
            </div>
        </div>
    );
}

function PermissionRow({
    icon: Icon,
    title,
    status,
    onRequest
}: {
    icon: any,
    title: string,
    status: string,
    onRequest: () => void
}) {
    const getStatusInfo = (s: string) => {
        switch (s) {
            case 'granted': return { label: 'İzin Verildi', color: 'text-green-500', icon: CheckCircle2 };
            case 'denied': return { label: 'Reddedildi', color: 'text-red-500', icon: XCircle };
            case 'limited': return { label: 'Kısıtlı', color: 'text-yellow-500', icon: AlertCircle };
            default: return { label: 'Bekliyor', color: 'text-gray-400', icon: AlertCircle };
        }
    };

    const info = getStatusInfo(status);

    return (
        <div className="p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-500" />
                </div>
                <div className="space-y-0.5">
                    <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">{title}</h3>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${info.color}`}>
                        <info.icon className="w-3.5 h-3.5" />
                        {info.label}
                    </div>
                </div>
            </div>

            {status !== 'granted' ? (
                <button
                    onClick={onRequest}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                    İzin İste <ChevronRight className="w-4 h-4" />
                </button>
            ) : (
                <div className="px-4 py-2 text-xs font-bold text-gray-400">
                    Aktif
                </div>
            )}
        </div>
    );
}
