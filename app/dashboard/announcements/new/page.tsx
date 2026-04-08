'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAnnouncement } from '@/lib/actions/announcement';
import { ArrowLeft, Loader2, Upload, X, FileText } from 'lucide-react';
import Link from 'next/link';

export default function NewAnnouncementPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Remove 'file' key from native input if it exists to avoid duplication or confusion, 
        // though strictly FormData construction from form element handles it. 
        // However, we want to ensure we send *all* files. 

        // Native form construction usually captures the multiple files if input has name="files" and multiple attribute.
        // Let's ensure input name is "files".

        const result = await createAnnouncement(null, formData);

        if (result.success) {
            router.push('/dashboard/announcements');
        } else {
            setError(result.message || "Bir hata oluştu.");
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            // Append to existing or replace? Usually replace in simple multiple input, but let's do append for better UX?
            // Simple input behavior is replace. Let's stick to replace for now to match input behavior, 
            // or we need to manage a custom list and not use the input's value directly for submission (constructing FormData manually).
            // To keep it simple and consistent with standard form submit: use the input directly.
            // So we just update state for preview.
            setSelectedFiles(newFiles);
        }
    };

    const removeFile = (index: number) => {
        // This is tricky with native input. We can't easily remove one file from FileList of input.
        // If we want allow removing individual files, we MUST construct FormData manually.
        // Let's switch to manual FormData construction for better UX.
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
    };

    // Modified handleSubmit for manual FormData
    const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        // Remove the native file input data because we will append manually
        formData.delete('files');

        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        const result = await createAnnouncement(null, formData);

        if (result.success) {
            router.push('/dashboard/announcements');
        } else {
            setError(result.message || "Bir hata oluştu.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link
                href="/dashboard/announcements"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
            </Link>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                <h1 className="text-xl font-bold mb-6">Yeni Duyuru Oluştur</h1>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleManualSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Başlık
                        </label>
                        <input
                            name="title"
                            required
                            minLength={3}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Duyuru başlığı..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            İçerik
                        </label>
                        <textarea
                            name="content"
                            required
                            minLength={5}
                            rows={6}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Duyuru detayları..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Dosyalar (Resim, PDF)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer relative">
                            {/* Keep this input to trigger file selection, but we manage state */}
                            <input
                                type="file"
                                name="files" // Name used in form, but we delete and append manually
                                multiple
                                accept="image/*,.pdf"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        // Append newly selected files to existing list
                                        const newFiles = Array.from(e.target.files);
                                        setSelectedFiles(prev => [...prev, ...newFiles]);
                                        // Reset input logic if needed to allow selecting same file again?
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                <Upload className="w-8 h-8 text-gray-400" />
                                <span className="text-sm">Dosyaları seçmek için tıklayın veya sürükleyin</span>
                                <span className="text-xs text-gray-400">Çoklu seçim yapılabilir. (Max 5MB/dosya)</span>
                            </div>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center">
                                                {file.type.startsWith('image/') ? <FileText className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPinned"
                            name="isPinned"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isPinned" className="text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                            Bu duyuruyu sabitle (En üstte görünür)
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                        <Link
                            href="/dashboard/announcements"
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            İptal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSubmitting ? 'Paylaşılıyor...' : 'Duyuruyu Paylaş'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
