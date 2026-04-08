'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, MoreVertical, Lock, Unlock, Trash2, UserPlus, UserMinus, X, Search, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { sendMessage, deleteMessage, toggleChatLock, addParticipant, removeParticipant, markChatAsRead, toggleReaction } from '@/lib/actions/chat';
import { getMembers } from '@/lib/actions/member';
import { cn } from '@/lib/utils';
import { Smile, Plus } from 'lucide-react';

interface ChatWindowProps {
    chat: any;
    messages: any[];
    currentUserId: string;
    currentUserRole: string;
}

export default function ChatWindow({ chat, messages: initialMessages, currentUserId, currentUserRole }: ChatWindowProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Reaction State
    const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);

    // Member Management State
    const [showMenu, setShowMenu] = useState(false);
    const [showManageMembers, setShowManageMembers] = useState(false);
    const [availableMembers, setAvailableMembers] = useState<any[]>([]);
    const [memberSearch, setMemberSearch] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const isAdminOrStaff = ['admin', 'manager', 'staff'].includes(currentUserRole);
    const canManageChat = currentUserRole === 'admin'; // Only admin can lock/manage/delete chats

    const chatDisplayName = chat.name || chat.participants?.filter((p: any) => p.userId !== currentUserId).map((p: any) => p.user?.fullName).join(', ') || "İsimsiz Sohbet";

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        setMessages(initialMessages);
        scrollToBottom();
    }, [initialMessages]);

    useEffect(() => {
        scrollToBottom();
        // Mark as read on mount
        markChatAsRead(chat.id);
    }, [chat.id]); // Removed 'messages' from dependency to avoid loop/double scroll, or keep if needed for other updates

    useEffect(() => {
        if (showManageMembers) {
            loadMembers();
        }
    }, [showManageMembers]);

    const loadMembers = async (query = '') => {
        try {
            const members = await getMembers(query);
            setAvailableMembers(members);
        } catch (e) {
            console.error("Failed to load members", e);
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const content = newMessage.trim();
        setNewMessage('');
        setIsSending(true);
        setShowEmojiPicker(false);

        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            content: content,
            senderId: currentUserId,
            createdAt: new Date(),
            sender: { fullName: 'Ben' },
            isActive: true,
            reactions: []
        };
        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        try {
            await sendMessage(chat.id, content);
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setIsSending(false);
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage(prev => prev + emojiData.emoji);
        // Don't close picker for multiple emojis
    };

    const handleReaction = async (messageId: string, emoji: string) => {
        setActiveReactionMessageId(null); // Close picker
        // Optimistic update could be complex here due to nested structure, rely on revalidatePath for now or implement better optimistic logic
        // For MVP, just call action and let revalidate flow update
        await toggleReaction(messageId, emoji);
        router.refresh();
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm("Mesajı silmek istediğinize emin misiniz?")) return;
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isActive: false } : m));
        await deleteMessage(messageId);
    };

    const handleAddMember = async (userId: string) => {
        await addParticipant(chat.id, userId);
        router.refresh();
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Bu üyeyi gruptan çıkarmak istediğinize emin misiniz?")) return;
        await removeParticipant(chat.id, userId);
        router.refresh();
    };

    // Filter available members
    const participantsIds = new Set(chat.participants?.map((p: any) => p.userId) || []);
    const filteredAvailableMembers = availableMembers.filter(m => !participantsIds.has(m.id));

    return (
        <div className="flex flex-col h-full bg-[#efe7dd] dark:bg-zinc-950/50 relative">
            {/* Manage Members Modal */}
            {showManageMembers && (
                <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-900 rounded-t-xl">
                            <h3 className="font-bold text-lg">Grup Üyelerini Yönet</h3>
                            <button onClick={() => setShowManageMembers(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto">
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Mevcut Üyeler ({chat.participants?.length})</h4>
                            <div className="space-y-2 mb-6">
                                {chat.participants?.map((p: any) => (
                                    <div key={p.id} className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800/50 p-2 rounded">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600">
                                                {p.user?.fullName?.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium">{p.user?.fullName}</span>
                                        </div>
                                        {canManageChat && p.userId !== currentUserId && (
                                            <button
                                                onClick={() => handleRemoveMember(p.userId)}
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Yeni Üye Ekle</h4>
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    className="w-full bg-gray-100 dark:bg-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm outline-none border focus:border-blue-500 transition-colors"
                                    placeholder="Üye ara..."
                                    value={memberSearch}
                                    onChange={(e) => {
                                        setMemberSearch(e.target.value);
                                        loadMembers(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                {filteredAvailableMembers.length === 0 ? (
                                    <p className="text-center text-sm text-gray-500 py-4">Sonuç bulunamadı.</p>
                                ) : (
                                    filteredAvailableMembers.map((m: any) => (
                                        <div key={m.id} className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800 p-2 rounded transition-colors cursor-pointer group" onClick={() => handleAddMember(m.id)}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold">
                                                    {m.fullName?.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{m.fullName}</span>
                                                    <span className="text-[10px] text-gray-400">{m.email}</span>
                                                </div>
                                            </div>
                                            <button className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 p-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    {/* Mobile back button */}
                    <button
                        onClick={() => router.push('/dashboard/messages')}
                        className="md:hidden p-1.5 -ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-900"
                        aria-label="Geri"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-zinc-700 flex items-center justify-center text-gray-500 overflow-hidden">
                        {chat.imageUrl ? (
                            <img src={chat.imageUrl} alt={chatDisplayName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold">{chatDisplayName?.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-gray-100">{chatDisplayName}</h2>
                        <p className="text-xs text-gray-500">
                            {chat.participants?.length} katılımcı
                            {chat.isLocked && <span className="ml-2 text-red-500 flex items-center gap-1 inline-flex"><Lock className="w-3 h-3" /> Kilitli</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 relative">
                    {canManageChat && (
                        <button
                            onClick={async () => {
                                await toggleChatLock(chat.id);
                                router.refresh();
                            }}
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                chat.isLocked
                                    ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                    : "text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-800"
                            )}
                            title={chat.isLocked ? "Grubu Aç" : "Grubu Kilitle"}
                        >
                            {chat.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                        </button>
                    )}

                    {canManageChat && (
                        <>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            {showMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    {canManageChat && (
                                        <button
                                            onClick={() => {
                                                setShowMenu(false);
                                                setShowManageMembers(true);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                        >
                                            <Users className="w-4 h-4" />
                                            Üyeleri Yönet
                                        </button>
                                    )}
                                    {canManageChat && (
                                        <button className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2">
                                            <Trash2 className="w-4 h-4" />
                                            Sohbeti Sil
                                        </button>
                                    )}
                                </div>
                            )}
                            {showMenu && <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />}
                        </>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2" onClick={() => { setShowMenu(false); setActiveReactionMessageId(null); }}>
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    const isDeleted = !msg.isActive;
                    const isReactionPickerOpen = activeReactionMessageId === msg.id;

                    if (isDeleted) {
                        return (
                            <div key={msg.id} className={cn("flex mb-2", isMe ? "justify-end" : "justify-start")}>
                                <div className="bg-gray-200 dark:bg-zinc-800 text-gray-500 text-xs italic px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700">
                                    🚫 Bu mesaj silindi
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div key={msg.id} className={cn("flex flex-col mb-4 max-w-[80%] relative group", isMe ? "self-end items-end" : "self-start items-start")}>
                            <div className={cn(
                                "px-4 py-2 rounded-lg shadow-sm relative min-w-[120px]",
                                isMe
                                    ? "bg-[#d9fdd3] dark:bg-emerald-900/40 text-gray-900 dark:text-emerald-100 rounded-tr-none"
                                    : "bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-tl-none"
                            )}>
                                {!isMe && (
                                    <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">
                                        {msg.sender?.fullName || "Bilinmeyen"}
                                        {msg.sender?.role === 'admin' && <span className="ml-1 text-[10px] bg-blue-100 text-blue-800 px-1 rounded">YÖN</span>}
                                    </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                        {format(new Date(msg.createdAt), "HH:mm")}
                                    </span>
                                </div>

                                {/* Reactions Display */}
                                {msg.reactions && msg.reactions.length > 0 && (
                                    <div className="absolute -bottom-3 right-0 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-1 text-[10px]">
                                        {Array.from(new Set(msg.reactions.map((r: any) => r.emoji))).map((emoji: any) => (
                                            <span key={emoji}>{emoji}</span>
                                        ))}
                                        <span className="text-gray-500">{msg.reactions.length}</span>
                                    </div>
                                )}

                                {/* Message Actions (Delete & React) */}
                                <div className={cn(
                                    "absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1",
                                    isMe ? "right-full mr-2" : "left-full ml-2"
                                )}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setActiveReactionMessageId(isReactionPickerOpen ? null : msg.id); }}
                                        className="p-1 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500"
                                        title="Tepki Ver"
                                    >
                                        <Smile className="w-4 h-4" />
                                    </button>
                                    {(isMe || isAdminOrStaff) && (
                                        <button
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            className="p-1 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500"
                                            title="Mesajı Sil"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Reaction Picker Popover */}
                                {isReactionPickerOpen && (
                                    <div className="absolute top-full mt-2 z-50 bg-white dark:bg-zinc-900 shadow-xl rounded-lg border border-gray-200 dark:border-zinc-800 p-2 flex gap-2 animate-in zoom-in-95">
                                        {['👍', '❤️', '😂', '😮', '😢', '👏'].map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => handleReaction(msg.id, emoji)}
                                                className="hover:scale-125 transition-transform text-xl"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                        <button onClick={() => alert("More emojis coming soon!")} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">
                                            <Plus className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-gray-100 dark:bg-zinc-900 p-4 border-t border-gray-200 dark:border-zinc-800 relative z-20">
                {showEmojiPicker && (
                    <div className="absolute bottom-full left-4 mb-2 shadow-2xl rounded-xl z-50">
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            lazyLoadEmojis={true}
                            theme={"auto" as any} // 'auto' might satisfy, checking types
                        />
                    </div>
                )}
                {chat.isLocked && !canManageChat ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg text-center text-sm flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        Bu grup kapatılmıştır. Sadece yöneticiler mesaj gönderebilir.
                    </div>
                ) : (
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="shrink-0 p-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <Smile className="w-6 h-6" />
                        </button>
                        <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onFocus={() => { setShowEmojiPicker(false); markChatAsRead(chat.id); }}
                            className="flex-1 min-w-0 bg-white dark:bg-zinc-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 shadow-sm outline-none resize-none overflow-hidden"
                            placeholder="Bir mesaj yazın..."
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || isSending}
                            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
