import { getCurrentTenant } from "@/lib/data/tenant";
import { DeleteAnnouncementButton } from "./delete-button";
import { MarkAnnouncementsRead } from "./mark-read";
import { getAnnouncements, deleteAnnouncement, togglePinAnnouncement } from "@/lib/actions/announcement";
import Link from "next/link";
import { Plus, Pin, Trash2, Calendar, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { revalidatePath } from "next/cache";

export default async function AnnouncementsPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return <div>Yetkisiz Erişim</div>;

    const announcements = await getAnnouncements();
    const canManageAnnouncements = ['admin'].includes(tenantData.userRole);

    return (
        <div className="max-w-4xl mx-auto">
            <MarkAnnouncementsRead />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Duyurular</h1>
                {canManageAnnouncements && (
                    <Link
                        href="/dashboard/announcements/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Duyuru
                    </Link>
                )}
            </div>

            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Henüz duyuru yok</h3>
                        <p className="text-gray-500">
                            {canManageAnnouncements ? "İlk duyuruyu oluşturarak başlayın." : "Şirket yönetimi henüz bir duyuru paylaşmadı."}
                        </p>
                    </div>
                ) : (
                    announcements.map((post: any) => (
                        <div
                            key={post.id}
                            className={`bg-white dark:bg-zinc-900 rounded-xl border p-6 transition-all ${post.isPinned
                                ? 'border-blue-200 dark:border-blue-900 shadow-md ring-1 ring-blue-50 dark:ring-blue-900/20'
                                : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    {post.isPinned && (
                                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-1.5 rounded-lg">
                                            <Pin className="w-4 h-4 fill-current" />
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                            {post.title}
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{format(new Date(post.createdAt), "d MMMM yyyy, HH:mm", { locale: tr })}</span>
                                            {/* Author can be added here if joined */}
                                        </div>
                                    </div>
                                </div>

                                {canManageAnnouncements && (
                                    <div className="flex items-center gap-2">
                                        <form action={async () => {
                                            'use server';
                                            await togglePinAnnouncement(post.id);
                                        }}>
                                            <button
                                                className={`p-2 rounded-lg transition-colors ${post.isPinned
                                                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100'
                                                    : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-zinc-800'
                                                    }`}
                                                title={post.isPinned ? "Sabitlemeyi Kaldır" : "Sabitle"}
                                            >
                                                <Pin className="w-4 h-4" />
                                            </button>
                                        </form>

                                        <DeleteAnnouncementButton id={post.id} />
                                    </div>
                                )}
                            </div>

                            <div className="prose dark:prose-invert max-w-none mb-4 text-gray-600 dark:text-gray-300">
                                <p className="whitespace-pre-wrap">{post.content}</p>
                            </div>

                            {/* Attachments Display - New Method */}
                            {post.attachments && post.attachments.length > 0 && (
                                <div className="mt-4 border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Ekli Dosyalar
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {post.attachments.map((file: any) => (
                                            <a
                                                key={file.id}
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors group border border-gray-100 dark:border-zinc-700"
                                            >
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    {file.fileType === 'image' ? <FileText className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate group-hover:underline">
                                                        {file.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 capitalize">{file.fileType} Dosyası</p>
                                                </div>
                                                <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Backward Compatibility for mediaUrl (Old Single File) */}
                            {(!post.attachments || post.attachments.length === 0) && post.mediaUrl && (
                                <div className="mt-4 border-t border-gray-100 dark:border-zinc-800 pt-4">
                                    <a
                                        href={post.mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors group border border-gray-100 dark:border-zinc-700"
                                    >
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate group-hover:underline">
                                                Dosyayı Görüntüle
                                            </p>
                                            <p className="text-xs text-gray-500">Ekli Dosya</p>
                                        </div>
                                        <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Note: For 'confirm' logic on delete, we ideally need a client component.
// I will keep it as server action without confirm for this iteration to keep it single file,
// or I can extract `AnnouncementCard` as a client component in next step if needed.
