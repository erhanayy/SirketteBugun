'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Bell,
    Calendar,
    Home,
    LayoutDashboard,
    MessageCircle,
    Settings,
    Users,
    Building,
    Briefcase,
    CreditCard,
    ClipboardList,
    StickyNote,
    Workflow,
    ChevronDown
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

function NavItem({
    href,
    icon: Icon,
    label,
    badge,
}: {
    href: string;
    icon: any;
    label: string;
    active?: boolean;
    badge?: number;
}) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors text-white/80 hover:bg-white/10 hover:text-white"
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 opacity-80" />
                {label}
            </div>
            {badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 h-5 min-w-[20px] rounded-full flex items-center justify-center shadow-sm border border-white/20">
                    {badge}
                </span>
            )}
        </Link>
    );
}

export function SidebarMenu({
    unreadSposts,
    unreadEvents,
    unreadAnnouncements,
    totalUnread,
    userRole,
    isApplicationAdmin
}: {
    unreadSposts: number;
    unreadEvents: number;
    unreadAnnouncements: number;
    totalUnread: number;
    userRole: string;
    isApplicationAdmin: boolean;
}) {
    const [sections, setSections] = useState({
        sosyal: true,
        is: true,
        yonetim: true,
        uygulama: true,
        ayarlar: true
    });

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('sidebarState');
        if (saved) {
            try {
                setSections(JSON.parse(saved));
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []);

    const toggleSection = (key: keyof typeof sections) => {
        const updated = { ...sections, [key]: !sections[key] };
        setSections(updated);
        localStorage.setItem('sidebarState', JSON.stringify(updated));
    };

    const SectionHeader = ({ title, sectionKey }: { title: string, sectionKey: keyof typeof sections }) => (
        <button
            onClick={() => toggleSection(sectionKey)}
            className="w-full flex items-center justify-between bg-white/10 text-white px-3 py-1.5 rounded-md mt-6 mb-2 hover:bg-white/20 transition-colors cursor-pointer"
        >
            <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${!sections[sectionKey] ? '-rotate-90' : ''}`} />
        </button>
    );

    return (
        <nav className="flex-1 p-4 overflow-y-auto space-y-1">
            {/* Sosyal */}
            <button
                onClick={() => toggleSection('sosyal')}
                className="w-full flex items-center justify-between bg-white/10 text-white px-3 py-1.5 rounded-md mb-2 hover:bg-white/20 transition-colors cursor-pointer"
            >
                <span className="text-[10px] font-bold uppercase tracking-wider">Sosyal</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${!sections.sosyal ? '-rotate-90' : ''}`} />
            </button>

            {sections.sosyal && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <NavItem href="/dashboard/home" icon={Home} label="Ana Sayfa" badge={unreadSposts > 0 ? unreadSposts : undefined} />
                    <NavItem href="/dashboard/events" icon={Calendar} label="Etkinlikler" badge={unreadEvents > 0 ? unreadEvents : undefined} />
                    <NavItem href="/dashboard/announcements" icon={Bell} label="Duyurular" badge={unreadAnnouncements > 0 ? unreadAnnouncements : undefined} />
                    <NavItem href="/dashboard/messages" icon={MessageCircle} label="Mesajlar" badge={totalUnread > 0 ? totalUnread : undefined} />
                    <NavItem href="/dashboard/business-cards" icon={Briefcase} label="Kartvizitler" />
                </div>
            )}

            {/* İş */}
            <SectionHeader title="İş" sectionKey="is" />
            {sections.is && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <NavItem href="/dashboard/members" icon={Users} label="Çalışanlar" />
                    <NavItem href="/dashboard/organization" icon={Building} label="Organizasyon" />
                    <NavItem href="/dashboard/projects" icon={ClipboardList} label="Proje & Task" />
                    <NavItem href="/dashboard/reminders" icon={Bell} label="Hatırlatma" />
                    <NavItem href="/dashboard/notes" icon={StickyNote} label="Notlar" />
                    <NavItem href="/dashboard/flows" icon={Workflow} label="Akışlar" />
                </div>
            )}

            {/* Yönetim */}
            {(userRole === 'admin' || userRole === 'manager') && (
                <>
                    <SectionHeader title="Yönetim" sectionKey="yonetim" />
                    {sections.yonetim && (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                            <NavItem href="/dashboard" icon={LayoutDashboard} label="Genel Bakış" />
                            <NavItem href="/dashboard/tenant-settings" icon={Building} label="Şirket Bilgileri" />
                            <NavItem href="/dashboard/ibans" icon={CreditCard} label="Banka Hesapları" />
                            <NavItem href="/dashboard/admin/approvals" icon={Settings} label="Akış Tanımlama" />
                        </div>
                    )}
                </>
            )}

            {/* Uygulama (Super Admin) */}
            {isApplicationAdmin && (
                <>
                    <SectionHeader title="Uygulama" sectionKey="uygulama" />
                    {sections.uygulama && (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                            <NavItem href="/dashboard/admin/tenants" icon={Building} label="Şirket Yönetimi" />
                            <NavItem href="/dashboard/admin/payment-entry" icon={CreditCard} label="Ödeme Girişi" />
                            <NavItem href="/dashboard/admin/scheduler" icon={Settings} label="Sistem Görevleri" />
                        </div>
                    )}
                </>
            )}

            {/* Ayarlar */}
            <SectionHeader title="Ayarlar" sectionKey="ayarlar" />
            {sections.ayarlar && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <NavItem href="/dashboard/settings" icon={Settings} label="Ayarlar" />
                    <SignOutButton />
                </div>
            )}
        </nav>
    );
}
