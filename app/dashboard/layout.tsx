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
} from "lucide-react";

import { getCurrentTenant } from "@/lib/data/tenant";
import { SignOutButton } from "@/components/sign-out-button";
import { TenantSwitcher } from "@/components/tenant-switcher";
import { NotificationBell } from "@/components/notification-bell";
import { getChats } from "@/lib/actions/chat";
import { getUnreadAnnouncementCount } from "@/lib/actions/announcement";
import { getPendingContracts } from "@/lib/actions/contract";
import { getUnreadSpostsCount } from "@/lib/actions/spost";
import { getMyActiveProjectsAndTasks } from "@/lib/actions/tasks";
import { MyTasksDropdown } from "@/components/my-tasks-dropdown";
import { getUnreadEventCount } from "@/lib/actions/event";
import { redirect } from "next/navigation";
import { ForcePasswordCheck } from "./force-password-check";
import { checkIsPremium, getSystemLimits } from "@/lib/actions/premium";
import { PremiumWrapper } from "@/components/premium-wrapper";
import { auth } from "@/auth";
import { MobileWorkNavBar, MobileSocialNavBar } from "@/components/mobile-nav-bar";
import { MobileAvatarMenu } from "@/components/mobile-avatar-menu";
import { getTenantPersonalization } from "@/lib/actions/tenant-settings";
import { logActivityAction } from "@/lib/actions/dashboard-stats";
import { MobilePermissionsModal } from "@/components/mobile-permissions-modal";
import { BadgePoller } from "@/components/badge-poller";
import { HeaderLogo, HeaderTenantName } from "@/components/header-actions";
import Image from "next/image";
import { SidebarMenu } from "./sidebar-menu";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const isApplicationAdmin = session?.user?.isApplicationAdmin || false;

    const tenantData = await getCurrentTenant();
    const chats = await getChats();
    const totalUnread = chats.reduce((acc: number, chat: any) => acc + (chat.unreadCount || 0), 0);
    const unreadAnnouncements = await getUnreadAnnouncementCount();
    const unreadSposts = await getUnreadSpostsCount();
    const unreadEvents = await getUnreadEventCount();
    const pendingContracts = await getPendingContracts();

    const activeTasksData = tenantData
        ? await getMyActiveProjectsAndTasks(tenantData.tenantId, tenantData.userId)
        : { totalActionableCount: 0, dropdownProjects: [] };

    const isPremium = await checkIsPremium();
    const systemLimits = await getSystemLimits();

    const personalization = tenantData ? await getTenantPersonalization(tenantData.tenantId) : null;

    // Log activity
    if (tenantData) {
        logActivityAction(tenantData.tenantId).catch(console.error); // Fire and forget
    }

    const activeTenantName = tenantData?.tenantShortName || "ŞirketteBugün";
    const userRole = tenantData?.userRole || "member";

    const isForceChange = tenantData?.forcePasswordChange;

    if (isForceChange) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
                <ForcePasswordCheck forcePasswordChange={!!isForceChange} />
                <div className="w-full max-w-4xl">
                    <header className="mb-8 text-center flex flex-col items-center justify-center">
                        <div className="w-24 h-24 rounded-full border border-gray-100 bg-white shadow-sm flex items-center justify-center p-1 transition-transform duration-300 group-hover:scale-[1.03] mx-auto">
                            <Image src="/sirkettebugun-logo-v4.png" alt="Şirkette Bugün" width={120} height={120} className="w-full h-full object-contain transition-transform duration-300" />
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            Şirkette Bugün
                        </h1>
                    </header>
                    <main className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 p-2">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    return (
        <PremiumWrapper isPremium={isPremium} adWaitSeconds={systemLimits.adWaitSeconds} userRole={userRole}>
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --menu-text: ${personalization?.menuTextColor || '#FFFFFF'};
                    --screen-text: ${personalization?.screenTextColor || '#1F2937'};
                    --bg-color: ${personalization?.backgroundColor || '#F9FAFB'};
                    --header-bg: ${personalization?.headerRow1Color || '#1E3A5F'};
                    --nav-bg: ${personalization?.headerRow2Color || '#2563EB'};
                }
                .dark {
                    --bg-color: ${personalization?.backgroundColor ? personalization.backgroundColor : '#18181b'};
                    --screen-text: ${personalization?.screenTextColor ? personalization.screenTextColor : '#f4f4f5'};
                }
            `}} />
            <div className="h-screen overflow-hidden bg-[var(--bg-color)] dark:bg-[var(--bg-color)] text-[var(--screen-text)] dark:text-[var(--screen-text)] flex">
                <ForcePasswordCheck forcePasswordChange={false} />
                <MobilePermissionsModal />
                <BadgePoller />

                {/* ─── Desktop Sidebar (hidden on mobile) ─── */}
                <aside className="w-64 border-r border-gray-200 dark:border-zinc-800 bg-[var(--nav-bg)] text-[var(--menu-text)] hidden lg:flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-gray-200/20 dark:border-zinc-800 font-bold text-lg text-[var(--menu-text)]">
                        {tenantData?.userName}
                    </div>
                    <SidebarMenu
                        unreadSposts={unreadSposts}
                        unreadEvents={unreadEvents}
                        unreadAnnouncements={unreadAnnouncements}
                        totalUnread={totalUnread}
                        userRole={userRole}
                        isApplicationAdmin={isApplicationAdmin}
                    />
                </aside>

                {/* ─── Main Content ─── */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
                    <header
                        className="min-h-14 lg:h-14 border-b border-gray-200/20 dark:border-zinc-800 bg-[var(--header-bg)] text-white flex items-center justify-between px-4 lg:px-6 flex-shrink-0"
                        style={{ paddingTop: 'env(safe-area-inset-top)' }}
                    >
                        {/* Left: Topluluk (Tenant) logo + tenant name */}
                        <div className="flex items-center gap-2 overflow-hidden">
                            <HeaderLogo logoUrl={tenantData?.logoUrl ?? null} tenantName={activeTenantName} />
                            <HeaderTenantName name={activeTenantName} websiteUrl={tenantData?.websiteUrl ?? null} />
                        </div>

                        {/* Right: desktop tools + mobile avatar */}
                        <div className="flex items-center gap-3">
                            {/* Desktop only items */}
                            {tenantData && (
                                <>
                                    <div className="hidden lg:flex items-center gap-3">
                                        <TenantSwitcher
                                            currentTenant={{
                                                id: tenantData.tenantId,
                                                shortName: tenantData.tenantShortName,
                                                longName: tenantData.tenantName
                                            }}
                                            availableTenants={tenantData.availableTenants}
                                        />
                                        <MyTasksDropdown
                                            count={activeTasksData.totalActionableCount}
                                            projects={activeTasksData.dropdownProjects}
                                        />
                                        <NotificationBell tenantId={tenantData.tenantId} userId={tenantData.userId} />
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                                            {tenantData.userName?.charAt(0) || 'A'}
                                        </div>
                                    </div>

                                    {/* Mobile notification bell */}
                                    <div className="lg:hidden">
                                        <NotificationBell tenantId={tenantData.tenantId} userId={tenantData.userId} />
                                    </div>
                                </>
                            )}

                            {/* Mobile avatar menu (2-letter initials + dropdown) */}
                            <MobileAvatarMenu
                                userName={tenantData?.userName || 'U'}
                                userRole={userRole}
                                isApplicationAdmin={isApplicationAdmin}
                                logoUrl={tenantData?.logoUrl}
                            />
                            {/* Far Right: Global App Logo (Masked into a perfect circle) */}
                            <div className="w-8 h-8 rounded-full border border-gray-100 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                                <Image src="/sirkettebugun-logo-v6.jpeg" alt="App Logo" width={40} height={40} className="w-full h-full object-cover scale-[1.20]" />
                            </div>
                        </div>
                    </header>

                    {/* Mobile Navigation Icon Bar (Top / Work) */}
                    <MobileWorkNavBar />

                    {/* Page Content with standard bottom padding since Nav uses safe area */}
                    <main className="flex-1 p-4 lg:p-6 overflow-y-auto overflow-x-hidden max-w-full w-full pb-4 lg:pb-6">{children}</main>

                    {/* Mobile Social Icon Bar (Bottom) */}
                    <MobileSocialNavBar
                        unreadSposts={unreadSposts}
                        unreadEvents={unreadEvents}
                        unreadAnnouncements={unreadAnnouncements}
                        unreadMessages={totalUnread}
                    />
                </div>
            </div>
        </PremiumWrapper>
    );
}

