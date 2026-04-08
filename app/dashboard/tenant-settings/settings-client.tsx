'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    updateTenantInfoAction,
    updatePersonalizationAction
} from '@/lib/actions/tenant-settings';
import {
    Save,
    Palette,
    Upload,
    Info,
    Check,
    Type,
    Layout,
    StickyNote,
    Paintbrush
} from 'lucide-react';
import { usePermissions } from '@/lib/hooks/use-permissions';
import { Capacitor } from '@capacitor/core';
import Image from 'next/image';

const THEMES = [
    {
        name: 'Mavi Klasik',
        colors: {
            menuTextColor: '#FFFFFF',
            screenTextColor: '#1F2937',
            backgroundColor: '#F9FAFB',
            headerRow1Color: '#1E3A5F',
            headerRow2Color: '#2563EB',
        }
    },
    {
        name: 'Koyu Modern',
        colors: {
            menuTextColor: '#F4F4F5',
            screenTextColor: '#F4F4F5',
            backgroundColor: '#09090B',
            headerRow1Color: '#18181B',
            headerRow2Color: '#27272A',
        }
    },
    {
        name: 'Zümrüt Yeşil',
        colors: {
            menuTextColor: '#FFFFFF',
            screenTextColor: '#064E3B',
            backgroundColor: '#ECFDF5',
            headerRow1Color: '#064E3B',
            headerRow2Color: '#10B981',
        }
    },
    {
        name: 'Sıcak Turuncu',
        colors: {
            menuTextColor: '#FFFFFF',
            screenTextColor: '#7C2D12',
            backgroundColor: '#FFF7ED',
            headerRow1Color: '#7C2D12',
            headerRow2Color: '#F97316',
        }
    }
];

export default function TenantSettingsPage({
    tenant,
    personalization
}: {
    tenant: any;
    personalization: any;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Tenant info state
    const [longName, setLongName] = useState(tenant.longName);
    const [shortName, setShortName] = useState(tenant.shortName);
    const [logoUrl, setLogoUrl] = useState(tenant.logoUrl || '');
    const [websiteUrl, setWebsiteUrl] = useState(tenant.websiteUrl || '');

    // Personalization state
    const [colors, setColors] = useState({
        menuTextColor: personalization?.menuTextColor || '#FFFFFF',
        screenTextColor: personalization?.screenTextColor || '#1F2937',
        backgroundColor: personalization?.backgroundColor || '#F9FAFB',
        headerRow1Color: personalization?.headerRow1Color || '#1E3A5F',
        headerRow2Color: personalization?.headerRow2Color || '#2563EB',
    });

    const [fileName, setFileName] = useState('');
    const { requestPermission } = usePermissions();

    const handleSaveInfo = () => {
        startTransition(async () => {
            try {
                await updateTenantInfoAction({
                    tenantId: tenant.id,
                    longName,
                    shortName,
                    logoUrl,
                    websiteUrl
                });
                alert("Şirket bilgileri başarıyla güncellendi.");
                router.refresh();
            } catch (error: any) {
                alert(error.message);
            }
        });
    };

    const handleSaveColors = () => {
        startTransition(async () => {
            try {
                await updatePersonalizationAction({
                    tenantId: tenant.id,
                    ...colors
                });
                alert("Renk tercihleri kaydedildi. Uygulama genelinde aktif edildi.");
                router.refresh();
            } catch (error: any) {
                alert(error.message);
            }
        });
    };

    const applyTheme = (themeColors: any) => {
        setColors(themeColors);
    };

    const isValidUrl = (url: string) => {
        try {
            return url.startsWith('http') || url.startsWith('data:');
        } catch {
            return false;
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit for Base64 safety
                alert("Logo dosyası 1MB'dan küçük olmalıdır.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
                setFileName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Info className="w-6 h-6 text-blue-600" />
                    Şirket Bilgileri
                </h1>
                <p className="text-sm text-gray-500 mt-1 italic">
                    Derneğinizin genel bilgilerini buradan güncelleyebilirsiniz.
                </p>
            </div>

            {/* General Info Card */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Şirket Adı</label>
                            <input
                                type="text"
                                value={longName}
                                onChange={(e) => setLongName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Örn: Kadıköy Yardımlaşma Şirketi"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Kısa Ad</label>
                            <input
                                type="text"
                                value={shortName}
                                onChange={(e) => setShortName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Örn: KYD"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold">Şirket İnternet Sitesi (Varsa)</label>
                            <input
                                type="text"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Örn: https://www.şirket.org.tr"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Şirket Logosu</label>
                        <div className="p-4 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/50 flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-24 h-24 relative rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                                {logoUrl && isValidUrl(logoUrl) ? (
                                    <img
                                        src={logoUrl}
                                        alt="Logo Preview"
                                        className="w-full h-full object-contain p-2"
                                        onError={(e) => {
                                            (e.target as any).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-300">
                                        <Upload className="w-8 h-8 mb-1" />
                                        <span className="text-[10px]">Logo Yok</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-3 w-full">
                                <div className="flex items-center gap-2">
                                    <label className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-blue-500 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition shadow-sm flex items-center gap-2">
                                        <Upload className="w-4 h-4 text-blue-500" />
                                        {fileName ? fileName : 'Bilgisayardan Seç'}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onClick={async (e) => {
                                                if (Capacitor.isNativePlatform()) {
                                                    const status = await requestPermission('photos');
                                                    if (status !== 'granted') {
                                                        e.preventDefault();
                                                        alert("Galeri erişim izni verilmediği için dosya seçilemiyor.");
                                                    }
                                                }
                                            }}
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <span className="text-xs text-gray-400">veya aşağıya link yapıştırın</span>
                                </div>

                                <input
                                    type="text"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com/logo.png veya base64..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-700">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Check className="w-4 h-4 text-green-500" />
                            Statü: {tenant.isActive ? 'Aktif' : 'Pasif'} (Değiştirilemez)
                        </div>
                        <button
                            onClick={handleSaveInfo}
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>

            {/* Personalization Section */}
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Palette className="w-6 h-6 text-pink-600" />
                    Görünüm ve Renkler
                </h2>
                <p className="text-sm text-gray-500 mt-1 italic">
                    Uygulamanın derneğinize özel renklerle görünmesini sağlayın.
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                <div className="p-6 space-y-8">

                    {/* Presets */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold flex items-center gap-2">
                            <Paintbrush className="w-4 h-4" /> Hazır Temalar
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.name}
                                    onClick={() => applyTheme(theme.colors)}
                                    className="p-3 rounded-xl border border-gray-100 dark:border-zinc-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition group text-left"
                                >
                                    <div className="flex gap-1 mb-2">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.headerRow1Color }} />
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.headerRow2Color }} />
                                        <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: theme.colors.backgroundColor }} />
                                    </div>
                                    <span className="text-xs font-medium">{theme.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-zinc-700 pt-6">
                        <label className="text-sm font-semibold mb-4 block">Özel Renk Seçimi</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

                            {/* Color Item 1 */}
                            <ColorPickerItem
                                label="Üst Menü 1. Satır (Header)"
                                value={colors.headerRow1Color}
                                icon={Layout}
                                onChange={(v) => setColors({ ...colors, headerRow1Color: v })}
                            />

                            {/* Color Item 2 */}
                            <ColorPickerItem
                                label="Üst Menü 2. Satır (Icon Bar)"
                                value={colors.headerRow2Color}
                                icon={Layout}
                                onChange={(v) => setColors({ ...colors, headerRow2Color: v })}
                            />

                            {/* Color Item 3 */}
                            <ColorPickerItem
                                label="Menü Yazı Rengi"
                                value={colors.menuTextColor}
                                icon={Type}
                                onChange={(v) => setColors({ ...colors, menuTextColor: v })}
                            />

                            {/* Color Item 4 */}
                            <ColorPickerItem
                                label="Ekran Yazı Rengi"
                                value={colors.screenTextColor}
                                icon={Type}
                                onChange={(v) => setColors({ ...colors, screenTextColor: v })}
                            />

                            {/* Color Item 5 */}
                            <ColorPickerItem
                                label="Arka Fon Rengi"
                                value={colors.backgroundColor}
                                icon={StickyNote}
                                onChange={(v) => setColors({ ...colors, backgroundColor: v })}
                            />

                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-end">
                        <button
                            onClick={handleSaveColors}
                            disabled={isPending}
                            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            Renkleri Uygula
                        </button>
                    </div>
                </div>
            </div>

            {/* Dark Mode Warning */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-xl">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                    <span className="font-bold underline flex-shrink-0">Not:</span>
                    Seçtiğiniz renkler uygulama genelinde anında etkili olacaktır. Arka plan ve yazı rengi seçerken okunabilirliğe (kontrast) dikkat etmeniz önerilir.
                </p>
            </div>
        </div>
    );
}

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number) {
    const toHex = (c: number) => {
        const h = Math.max(0, Math.min(255, c)).toString(16);
        return h.length === 1 ? '0' + h : h;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
}

const HONEYCOMB_COLORS = [
    '#F87171', '#EF4444', '#B91C1C', '#991B1B', // Reds
    '#FB923C', '#F97316', '#C2410C', '#9A3412', // Oranges
    '#FBBF24', '#F59E0B', '#B45309', '#78350F', // Ambers
    '#4ADE80', '#22C55E', '#15803D', '#166534', // Greens
    '#2DD4BF', '#14B8A6', '#0F766E', '#134E4A', // Teals
    '#60A5FA', '#3B82F6', '#1D4ED8', '#1E3A8A', // Blues
    '#A78BFA', '#8B5CF6', '#6D28D9', '#4C1D95', // Purples
    '#F472B6', '#EC4899', '#BE185D', '#831843', // Pinks
    '#94A3B8', '#64748B', '#334155', '#1E293B', // Grays
    '#FFFFFF', '#F1F5F9', '#3F3F46', '#000000', // Monochrome
];

function ColorPickerItem({
    label,
    value,
    onChange,
    icon: Icon
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    icon: any;
}) {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'palette' | 'rgb'>('palette');
    const rgb = hexToRgb(value);

    const handleRgbChange = (channel: 'r' | 'g' | 'b', val: string) => {
        const n = parseInt(val) || 0;
        const newRgb = { ...rgb, [channel]: n };
        onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };

    return (
        <div className="space-y-3 relative">
            <div className="flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-400">{value.toUpperCase()}</span>
                    <button
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className="w-10 h-10 rounded-lg border-2 border-white dark:border-zinc-800 shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: value }}
                    >
                        {/* Overlay dot to show it's interactive if needed, or just the color */}
                        <div className={`w-1.5 h-1.5 rounded-full ${hexToRgb(value).r + hexToRgb(value).g + hexToRgb(value).b > 400 ? 'bg-black/20' : 'bg-white/40'}`} />
                    </button>
                </div>
            </div>

            {isAdvancedOpen && (
                <div className="absolute top-12 right-0 z-50 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded-2xl shadow-2xl p-4 w-72 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50 dark:border-zinc-800">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('palette')}
                                className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${activeTab === 'palette' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                PALET
                            </button>
                            <button
                                onClick={() => setActiveTab('rgb')}
                                className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${activeTab === 'rgb' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                RGB / HEX
                            </button>
                        </div>
                        <button onClick={() => setIsAdvancedOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <span className="text-sm leading-none">&times;</span>
                        </button>
                    </div>

                    {activeTab === 'palette' && (
                        <div className="grid grid-cols-8 gap-2">
                            {HONEYCOMB_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => {
                                        onChange(color);
                                        // Keeping it open for fine tuning
                                    }}
                                    className={`w-6 h-6 rounded-md transition-all hover:scale-125 hover:z-10 relative ${value.toUpperCase() === color.toUpperCase() ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900 z-10' : ''}`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    )}

                    {activeTab === 'rgb' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1 text-center">
                                    <label className="text-[10px] font-bold text-gray-400">RED</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="255"
                                        value={rgb.r}
                                        onChange={(e) => handleRgbChange('r', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs text-center"
                                    />
                                </div>
                                <div className="space-y-1 text-center">
                                    <label className="text-[10px] font-bold text-gray-400">GREEN</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="255"
                                        value={rgb.g}
                                        onChange={(e) => handleRgbChange('g', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs text-center"
                                    />
                                </div>
                                <div className="space-y-1 text-center">
                                    <label className="text-[10px] font-bold text-gray-400">BLUE</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="255"
                                        value={rgb.b}
                                        onChange={(e) => handleRgbChange('b', e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs text-center"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 block ml-1 text-center">HEX KODU</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={value.toUpperCase()}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (/^#[0-9A-F]{0,6}$/i.test(v)) {
                                                onChange(v);
                                            }
                                        }}
                                        className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-center"
                                    />
                                    <input
                                        type="color"
                                        value={value.length === 7 ? value : '#000000'}
                                        onChange={(e) => onChange(e.target.value)}
                                        className="w-10 h-8 p-0 border-0 bg-transparent cursor-pointer rounded overflow-hidden shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
