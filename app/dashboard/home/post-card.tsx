'use client';

import { useState } from 'react';
import { deleteSpost, toggleSpostReaction, createSpostComment, deleteSpostComment } from '@/lib/actions/spost';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Trash2, FileText, MessageCircle, Heart, ThumbsUp, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageGallery } from '@/components/image-gallery';

export default function PostCard({ post, currentUser, onUpdate }: { post: any, currentUser: any, onUpdate: () => void }) {
    const [isCommenting, setIsCommenting] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);

    const isAdminOrStaff = currentUser.userRole === 'admin' || currentUser.userRole === 'staff';
    const canDeletePost = post.userId === currentUser.userId || isAdminOrStaff;

    const handleDeletePost = async () => {
        if (!confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;
        setLoading(true);
        await deleteSpost(post.id);
        onUpdate();
    };

    const handleReaction = async (emoji: string) => {
        await toggleSpostReaction(post.id, emoji);
        onUpdate();
    };

    const submitComment = async () => {
        if (!commentText.trim()) return;
        setLoading(true);
        await createSpostComment(post.id, commentText);
        setCommentText('');
        setIsCommenting(false);
        onUpdate();
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Yorumu silmek istediğinize emin misiniz?")) return;
        await deleteSpostComment(commentId);
        onUpdate();
    };

    // Calculate reaction counts
    const reactionCounts: Record<string, number> = {};
    const userReaction = post.reactions.find((r: any) => r.userId === currentUser.userId)?.emoji;

    post.reactions.forEach((r: any) => {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    });

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            {/* Post Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                        {post.user.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{post.user.fullName}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400" suppressHydrationWarning>
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                    </div>
                </div>
                {canDeletePost && (
                    <button onClick={handleDeletePost} disabled={loading} className="text-gray-400 hover:text-red-500 transition">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>

            {/* Media Gallery */}
            {post.media && post.media.length > 0 && (
                <>
                    <div className={cn(
                        "grid gap-2 mt-3 rounded-xl overflow-hidden cursor-pointer",
                        post.media.filter((m: any) => m.type === 'image').length === 1 ? "grid-cols-1" : "grid-cols-2"
                    )}>
                        {post.media.map((media: any, index: number) => {
                            const images = post.media.filter((m: any) => m.type === 'image');
                            const imageIndex = images.findIndex((img: any) => img.id === media.id);

                            if (media.type === 'image') {
                                // Show first 4 images, overlay on the last one if more
                                if (imageIndex >= 4) return null;

                                return (
                                    <div
                                        key={media.id}
                                        className={cn(
                                            "relative aspect-square bg-gray-100 dark:bg-zinc-800",
                                            images.length === 3 && imageIndex === 0 ? "col-span-2 aspect-[2/1]" : ""
                                        )}
                                        onClick={() => {
                                            setGalleryIndex(imageIndex);
                                            setIsGalleryOpen(true);
                                        }}
                                    >
                                        <img src={media.url} alt="post media" className="w-full h-full object-cover" />
                                        {images.length > 4 && imageIndex === 3 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-bold">
                                                +{images.length - 3}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            if (media.type === 'video') {
                                return (
                                    <div key={media.id} className="col-span-2 relative rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-800 bg-black">
                                        <video src={media.url} controls className="w-full h-auto max-h-[400px]" />
                                    </div>
                                );
                            }

                            if (media.type === 'document') {
                                return (
                                    <div key={media.id} className="col-span-2 border border-gray-100 dark:border-zinc-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-800/50">
                                        <a href={media.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                                            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="font-medium text-sm text-blue-600 underline line-clamp-2">
                                                Dokümanı İndir / Görüntüle
                                            </div>
                                        </a>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>

                    {/* Full-screen Gallery */}
                    <ImageGallery
                        images={post.media.filter((m: any) => m.type === 'image').map((m: any) => ({ url: m.url }))}
                        isOpen={isGalleryOpen}
                        initialIndex={galleryIndex}
                        onClose={() => setIsGalleryOpen(false)}
                    />
                </>
            )}

            {/* Actions / Reactions */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleReaction('👍')}
                        className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition ${userReaction === '👍' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                        <ThumbsUp className="w-5 h-5" />
                    </button>
                    {(reactionCounts['👍'] || 0) > 0 && <span className="text-sm">{reactionCounts['👍']}</span>}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleReaction('❤️')}
                        className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition ${userReaction === '❤️' ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}
                    >
                        <Heart className="w-5 h-5" />
                    </button>
                    {(reactionCounts['❤️'] || 0) > 0 && <span className="text-sm">{reactionCounts['❤️']}</span>}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleReaction('😂')}
                        className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition ${userReaction === '😂' ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
                    >
                        <Smile className="w-5 h-5" />
                    </button>
                    {(reactionCounts['😂'] || 0) > 0 && <span className="text-sm">{reactionCounts['😂']}</span>}
                </div>

                <button
                    onClick={() => setIsCommenting(!isCommenting)}
                    className="flex items-center gap-1 ml-auto p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.comments.length} Yorum</span>
                </button>
            </div>

            {/* Comments Section */}
            {(isCommenting || post.comments.length > 0) && (
                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-4">
                    {/* Yorumlar Listesi */}
                    <div className="space-y-3">
                        {post.comments.map((comment: any) => (
                            <div key={comment.id} className="flex gap-2 group">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex shrink-0 items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                    {comment.user.fullName?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-50 dark:bg-zinc-800/60 rounded-2xl rounded-tl-none px-4 py-2 relative">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                                {comment.user.fullName}
                                            </span>
                                            {(comment.userId === currentUser.userId || isAdminOrStaff) && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{comment.content}</p>
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1 ml-2" suppressHydrationWarning>
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Yorum Yap */}
                    {isCommenting && (
                        <div className="flex gap-2 items-start mt-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex shrink-0 items-center justify-center font-bold text-sm">
                                {currentUser.userName.charAt(0)}
                            </div>
                            <div className="flex-1 flex gap-2">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Bir yorum yaz..."
                                    className="w-full text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 resize-none outline-none focus:ring-1 focus:ring-blue-500 min-h-[40px]"
                                />
                                <Button
                                    size="sm"
                                    onClick={submitComment}
                                    disabled={loading || !commentText.trim()}
                                    className="shrink-0 h-10"
                                >
                                    Gönder
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
