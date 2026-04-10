/* eslint-disable @next/next/no-img-element */
import { getBusinessCards } from "@/lib/actions/business_card";
import { getCurrentTenant } from "@/lib/data/tenant";
import { formatPhoneForDisplay } from "@/lib/phone";
import { Plus, Briefcase, UserRound, ArrowRight, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Search from "../members/search";
import DeleteCardButton from "./delete-card-button";

export default async function BusinessCardsPage({
    searchParams,
}: {
    searchParams: Promise<{
        query?: string;
    }>;
}) {
    const { query } = await searchParams || {};
    const tenant = await getCurrentTenant();

    if (!tenant) {
        redirect("/login");
    }

    const cards = await getBusinessCards(tenant.tenantId, query);

    // Is current user an admin or staff?
    const isAdminOrStaff = tenant.userRole === 'admin' || tenant.userRole === 'staff';

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Kartvizitler</h2>
                    <p className="text-sm text-gray-500 mt-1">Çalışan İletişim Bilgileri</p>
                </div>
                <Link
                    href="/dashboard/business-cards/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    Kartvizitimi Düzenle
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                <Search placeholder="Ad soyad veya firma adı ara..." />
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 border-dashed">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{query ? "Aradığınız kriterlere uygun kartvizit bulunamadı." : "Henüz oluşturulmuş bir kartvizit bulunmuyor."}</p>
                    </div>
                ) : (
                    cards.map((card) => (
                        <div key={card.id} className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm relative group flex flex-col h-full hover:border-blue-400 dark:hover:border-blue-500 transition-colors">

                            <div className="flex items-start gap-4 mb-4">
                                {card.profilePhotoUrl ? (
                                    <img src={card.profilePhotoUrl} alt={card.userFullName || "Profil"} className="w-14 h-14 rounded-full object-cover shrink-0 border border-gray-200 dark:border-zinc-700" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-gray-200 dark:border-zinc-700">
                                        <UserRound className="w-6 h-6 text-blue-500" />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{card.userFullName}</h3>
                                    <p className="text-sm text-gray-500 font-medium truncate">{card.title}</p>
                                    {card.phone && (
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                                            <Phone className="w-3 h-3 shrink-0 text-green-500" />
                                            <span className="truncate">{formatPhoneForDisplay(card.phone)}</span>
                                        </div>
                                    )}
                                    {card.email && (
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                                            <Mail className="w-3 h-3 shrink-0 text-blue-500" />
                                            <span className="truncate">{card.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1"></div> {/* Spacer to push actions to bottom */}

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
                                <Link href={`/dashboard/business-cards/${card.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                                    Detayları Gör <ArrowRight className="w-4 h-4" />
                                </Link>

                                {/* Only owner, admin, or staff can delete */}
                                {(tenant.userId === card.userId || isAdminOrStaff) && (
                                    <DeleteCardButton cardId={card.id} tenantId={tenant.tenantId} />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
