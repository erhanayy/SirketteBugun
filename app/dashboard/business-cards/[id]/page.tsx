/* eslint-disable @next/next/no-img-element */
import { getCurrentTenant } from "@/lib/data/tenant";
import { getBusinessCardById } from "@/lib/actions/business_card";
import { redirect } from "next/navigation";
import { Building2, Briefcase, Phone, Mail, GraduationCap, Calendar, UserRound, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function BusinessCardDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const tenant = await getCurrentTenant();

    if (!tenant) {
        redirect("/login");
    }

    const card = await getBusinessCardById(id, tenant.tenantId);

    if (!card) {
        return (
            <div className="text-center py-20 px-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Kartvizit Bulunamadı</h3>
                <p className="mt-2 text-gray-500">Aradığınız kartvizit silinmiş veya erişim izniniz yok.</p>
                <Link href="/dashboard/business-cards" className="mt-6 inline-flex text-blue-600 hover:text-blue-700 font-medium">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Listeye Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/dashboard/business-cards" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kayıtlara Dön
            </Link>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                {/* Banner / Cover */}
                <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-950 relative"></div>

                <div className="px-6 pb-8 sm:px-10 sm:pb-12">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 sm:-mt-20 mb-8 relative z-10">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-zinc-900 overflow-hidden bg-white dark:bg-zinc-800 shrink-0 mx-auto sm:mx-0">
                            {card.profilePhotoUrl ? (
                                <img src={card.profilePhotoUrl} alt={card.userFullName || "Profil"} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-zinc-800">
                                    <UserRound className="w-16 h-16 text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center sm:text-left mb-2 sm:mb-4 pt-4 sm:pt-0">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                {card.userFullName}
                            </h1>
                            <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mt-1">
                                {card.title}
                            </p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mt-3 border border-blue-100 dark:border-blue-800">
                                <Building2 className="w-4 h-4 mr-1.5" />
                                {card.companyName} ({card.workStatus === 'owner' ? 'Firma Sahibi' : 'Çalışan'})
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* İletişim Bilgileri */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center border-b border-gray-200 dark:border-zinc-800 pb-3">
                                <Phone className="w-5 h-5 text-green-500 mr-2" /> İletişim Bilgileri
                            </h2>
                            <div className="space-y-4">
                                <a href={`tel:${card.phone}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-gray-700 dark:text-gray-300">
                                    <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-green-600 dark:text-green-500" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 font-medium mb-0.5">Telefon</div>
                                        <div className="font-semibold">{card.phone}</div>
                                    </div>
                                </a>

                                <a href={`mailto:${card.email}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-gray-700 dark:text-gray-300">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-sm text-gray-500 font-medium mb-0.5">E-Posta</div>
                                        <div className="font-semibold truncate">{card.email}</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Eğitim Bilgileri */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center border-b border-gray-200 dark:border-zinc-800 pb-3">
                                <GraduationCap className="w-5 h-5 text-purple-500 mr-2" /> Eğitim Durumu
                            </h2>
                            <div className="space-y-4">
                                {card.educationDoctorate && (
                                    <div className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">Doktora</div>
                                            <div className="text-sm text-gray-500">{card.educationDoctorate}</div>
                                        </div>
                                    </div>
                                )}
                                {card.educationMaster && (
                                    <div className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">Yüksek Lisans / MBA</div>
                                            <div className="text-sm text-gray-500">{card.educationMaster}</div>
                                        </div>
                                    </div>
                                )}
                                {card.educationBachelor && (
                                    <div className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">Lisans (Üniversite)</div>
                                            <div className="text-sm text-gray-500">{card.educationBachelor}</div>
                                        </div>
                                    </div>
                                )}
                                {card.educationHighSchool && (
                                    <div className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">Lise</div>
                                            <div className="text-sm text-gray-500">{card.educationHighSchool}</div>
                                        </div>
                                    </div>
                                )}
                                {(!card.educationDoctorate && !card.educationMaster && !card.educationBachelor && !card.educationHighSchool) && (
                                    <p className="text-sm text-gray-500 italic">Eğitim bilgisi girilmemiş.</p>
                                )}
                            </div>

                            {/* Doğum Tarihi (Eğer varsa) */}
                            {card.birthDate && (
                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                                        <Calendar className="w-5 h-5 text-orange-500 mr-2" /> Kişisel
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">Doğum Tarihi:</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {format(new Date(card.birthDate), "dd MMMM yyyy", { locale: tr })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {tenant.userId !== card.userId && (
                <div className="flex justify-center pt-4">
                    <form action={async () => {
                        "use server";
                        const { createOrGetDirectMessage } = await import("@/lib/actions/chat");
                        const res = await createOrGetDirectMessage(card.userId);
                        if (res.success && res.chatId) {
                            redirect(`/dashboard/messages/${res.chatId}`);
                        }
                    }}>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm inline-flex items-center"
                        >
                            <Mail className="w-5 h-5 mr-2" />
                            Mesaj Gönder
                        </button>
                    </form>
                </div>
            )}

            {(tenant.userId === card.userId || tenant.userRole === 'admin') && (
                <div className="flex justify-center pt-4">
                    <Link
                        href="/dashboard/business-cards/new"
                        className="bg-gray-900 hover:bg-gray-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors border border-transparent dark:border-zinc-700 shadow-sm"
                    >
                        Kartviziti Düzenle
                    </Link>
                </div>
            )}
        </div>
    );
}
