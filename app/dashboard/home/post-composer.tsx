'use client';

import { useState, useRef } from 'react';
import { createSpost } from '@/lib/actions/spost';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Video, FileText, Smile, X, Loader2 } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export default function PostComposer({ tenantData, isPremium, onPostCreated }: { tenantData: any, isPremium: boolean, onPostCreated: () => void }) {
    const [content, setContent] = useState('');
    const [mediaItems, setMediaItems] = useState<{ url: string, type: 'image' | 'video' | 'document', name?: string }[]>([]);
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const isAdminOrStaff = tenantData.userRole === 'admin' || tenantData.userRole === 'staff';

    const handleEmojiClick = (emojiObject: any) => {
        setContent(prev => prev + emojiObject.emoji);
        setIsEmojiOpen(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
        if (!e.target.files || e.target.files.length === 0) return;

        const files = Array.from(e.target.files);
        const photoLimit = isPremium ? 10 : 3;

        const currentPhotos = mediaItems.filter(m => m.type === 'image').length;
        const newPhotos = files.filter(f => f.type.startsWith('image/')).length;

        if (type === 'image' && currentPhotos + newPhotos > photoLimit) {
            alert(`Bir gönderide en fazla ${photoLimit} adet fotoğraf paylaşabilirsiniz.${!isPremium ? " Daha fazla fotoğraf için Premium'a geçin." : ""}`);
            return;
        }

        setLoading(true);

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();

                if (data.url) {
                    let finalType = type;
                    if (type !== 'document') {
                        if (file.type.startsWith('video/')) finalType = 'video';
                        else finalType = 'image';
                    }

                    setMediaItems(prev => [...prev, { url: data.url, type: finalType, name: file.name }]);
                }
            } catch (error) {
                console.error("Upload Error:", error);
                alert(`${file.name} yüklenemedi.`);
            }
        }

        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (docInputRef.current) docInputRef.current.value = '';
    };

    const removeMedia = (index: number) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content.trim() && mediaItems.length === 0) return;

        setLoading(true);
        const res = await createSpost(content, mediaItems.map(m => ({ url: m.url, type: m.type })));
        setLoading(false);

        if (res.success) {
            setContent('');
            setMediaItems([]);
            onPostCreated();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm relative">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold font-lg shrink-0">
                    {tenantData.userName.charAt(0)}
                </div>
                <div className="flex-1 space-y-3">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Derneğinizde neler oluyor? Bir şeyler paylaşın..."
                        className="w-full bg-transparent resize-none outline-none min-h-[80px] text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                    />

                    {/* Yüklenen Eklentiler */}
                    {mediaItems.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {mediaItems.map((item, index) => (
                                <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 dark:bg-zinc-800 flex items-center p-1">
                                    {item.type === 'document' ? (
                                        <div className="flex items-center gap-2 px-2 text-sm text-blue-600">
                                            <FileText className="w-4 h-4" /> {item.name || 'Doküman'}
                                        </div>
                                    ) : item.type === 'video' ? (
                                        <video src={item.url} className="h-16 w-16 object-cover rounded" />
                                    ) : (
                                        <img src={item.url} alt="upload" className="h-16 w-16 object-cover rounded" />
                                    )}
                                    <button
                                        onClick={() => removeMedia(index)}
                                        className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-1">
                            {/* Medya Butonu */}
                            <input
                                type="file"
                                hidden
                                multiple
                                ref={fileInputRef}
                                accept="image/*,video/*"
                                onChange={(e) => handleFileUpload(e, 'image')}
                            />
                            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                <ImageIcon className="w-5 h-5" />
                            </Button>

                            {/* Doküman Butonu (Sadece Admin/Staff) */}
                            {isAdminOrStaff && (
                                <>
                                    <input
                                        type="file"
                                        hidden
                                        ref={docInputRef}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        onChange={(e) => handleFileUpload(e, 'document')}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => docInputRef.current?.click()} className="text-orange-500 hover:text-orange-600 hover:bg-orange-50">
                                        <FileText className="w-5 h-5" />
                                    </Button>
                                </>
                            )}

                            {/* Emoji Butonu */}
                            <div className="relative">
                                <Button variant="ghost" size="icon" onClick={() => setIsEmojiOpen(!isEmojiOpen)} className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50">
                                    <Smile className="w-5 h-5" />
                                </Button>
                                {isEmojiOpen && (
                                    <div className="absolute top-full left-0 z-50 mt-2 shadow-2xl rounded-xl border border-gray-100">
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={loading || (!content.trim() && mediaItems.length === 0)}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Paylaş
                        </Button>
                    </div>
                </div>
            </div>

            {/* Click outside to close emoji - simple overlay wrapper */}
            {isEmojiOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsEmojiOpen(false)} />
            )}
        </div>
    );
}
