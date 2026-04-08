"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Search, Plus, Trash2, Edit2, X, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createNote, updateNote, deleteNote } from "@/lib/actions/notes";

const NOTE_COLORS = [
    { id: "yellow", label: "Sarı", bg: "bg-yellow-200 dark:bg-yellow-700/50", border: "border-yellow-300 dark:border-yellow-600", text: "text-yellow-900 dark:text-yellow-100", hex: "#fde047" },
    { id: "blue", label: "Mavi", bg: "bg-blue-200 dark:bg-blue-700/50", border: "border-blue-300 dark:border-blue-600", text: "text-blue-900 dark:text-blue-100", hex: "#93c5fd" },
    { id: "green", label: "Yeşil", bg: "bg-green-200 dark:bg-green-700/50", border: "border-green-300 dark:border-green-600", text: "text-green-900 dark:text-green-100", hex: "#86efac" },
    { id: "pink", label: "Pembe", bg: "bg-pink-200 dark:bg-pink-700/50", border: "border-pink-300 dark:border-pink-600", text: "text-pink-900 dark:text-pink-100", hex: "#f9a8d4" },
    { id: "purple", label: "Mor", bg: "bg-purple-200 dark:bg-purple-700/50", border: "border-purple-300 dark:border-purple-600", text: "text-purple-900 dark:text-purple-100", hex: "#d8b4fe" },
];

export default function NotesClient({ initialNotes, tenantId, userId }: { initialNotes: any[], tenantId: string, userId: string }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [color, setColor] = useState("yellow");

    const filteredNotes = useMemo(() => {
        let result = [...initialNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (selectedFilter !== "all") {
            result = result.filter(n => n.color === selectedFilter);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(n =>
                (n.title && n.title.toLowerCase().includes(q)) ||
                n.content.toLowerCase().includes(q)
            );
        }
        return result;
    }, [initialNotes, searchQuery, selectedFilter]);

    const openAddModal = () => {
        setTitle("");
        setContent("");
        setColor("yellow");
        setCurrentId(null);
        setIsAddOpen(true);
    };

    const openEditModal = (note: any) => {
        setTitle(note.title || "");
        setContent(note.content);
        setColor(note.color || "yellow");
        setCurrentId(note.id);
        setIsEditOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return toast.error("Not içeriği boş olamaz");

        setLoading(true);
        if (currentId) {
            const res = await updateNote(currentId, { title, content, color });
            if (res.success) {
                toast.success("Not güncellendi");
                setIsEditOpen(false);
            } else {
                toast.error(res.error || "Hata oluştu");
            }
        } else {
            const res = await createNote({ tenantId, userId, title, content, color });
            if (res.success) {
                toast.success("Not eklendi");
                setIsAddOpen(false);
            } else {
                toast.error(res.error || "Hata oluştu");
            }
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Bu notu silmek istiyor musunuz?")) return;

        const res = await deleteNote(id);
        if (res.success) {
            toast.success("Not silindi");
        } else {
            toast.error("Hata oluştu");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header Toolbar */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-500">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Notlarım (Post-it)
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Kendinize ait renkli kısa notlar oluşturun ve yönetin.</p>
                        </div>
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <button
                                onClick={openAddModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center shrink-0"
                            >
                                <Plus className="w-5 h-5" />
                                Yeni Not
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Yeni Not Ekle</DialogTitle>
                            </DialogHeader>
                            <NoteForm
                                title={title} setTitle={setTitle}
                                content={content} setContent={setContent}
                                color={color} setColor={setColor}
                                handleSave={handleSave} loading={loading}
                            />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Notu Düzenle</DialogTitle>
                            </DialogHeader>
                            <NoteForm
                                title={title} setTitle={setTitle}
                                content={content} setContent={setContent}
                                color={color} setColor={setColor}
                                handleSave={handleSave} loading={loading}
                                isEdit
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search & Filter Container (like Business Cards) */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <button
                            onClick={() => setSelectedFilter("all")}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedFilter === "all" ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700"}`}
                        >
                            Tüm Renkler
                        </button>
                        {NOTE_COLORS.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedFilter(c.id)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border flex items-center gap-2 transition-colors ${selectedFilter === c.id ? "ring-2 ring-offset-2 border-transparent ring-gray-400 dark:ring-gray-500" : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
                            >
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                                {c.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm mt-1">
                        <div className="relative flex items-center w-full">
                            <Search className="absolute left-3 text-gray-400 w-5 h-5 pointer-events-none" />
                            <Input
                                placeholder="Başlık veya not içeriğinde ara..."
                                className="pl-10 h-10 w-full bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-gray-300 rounded-lg text-sm sm:text-base border-none shadow-inner"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="absolute right-3 text-gray-400 hover:text-gray-600">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Masonry / Grid Post-it Layout */}
            {filteredNotes.length === 0 ? (
                <div className="text-center py-20 bg-white/50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-500" />
                    <p className="text-gray-500">
                        {searchQuery ? "Aramanızla eşleşen not bulunamadı." : "Henüz hiç not eklemediniz. Hemen yeni bir post-it yapıştırın!"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                    {filteredNotes.map((note) => {
                        const colorTheme = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];

                        return (
                            <div
                                key={note.id}
                                onClick={() => openEditModal(note)}
                                style={{ backgroundColor: colorTheme.hex }}
                                className={`relative group p-5 rounded-bl-3xl rounded-tr-lg rounded-tl-sm rounded-br-sm shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 hover:rotate-1 dark:bg-opacity-20 border border-black/5 dark:border-white/5`}
                            >
                                {/* Tape / Fold illusion */}
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/40 dark:bg-black/30 rounded-full rotate-2"></div>

                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold text-lg mb-1 leading-tight ${colorTheme.text}`}>
                                        {note.title}
                                    </h3>

                                    <button
                                        onClick={(e) => handleDelete(note.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 -mr-2 -mt-2 rounded-full hover:bg-black/10 text-black/50 transition-all dark:text-white/50 dark:hover:bg-white/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className={`whitespace-pre-wrap text-sm leading-relaxed ${colorTheme.text} opacity-90 font-medium`}>
                                    {note.content}
                                </div>

                                <div className={`mt-4 text-[10px] font-bold uppercase tracking-wider opacity-60 ${colorTheme.text}`}>
                                    {format(new Date(note.updatedAt || note.createdAt), "d MMM, HH:mm", { locale: tr })}
                                </div>

                                {/* Folded corner illusion */}
                                <div className={`absolute bottom-0 left-0 w-6 h-6 rounded-tr-lg border-t border-r border-black/10 opacity-40 bg-black/5 dark:bg-white/10`}></div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function NoteForm({ title, setTitle, content, setContent, color, setColor, handleSave, loading, isEdit = false }: any) {
    return (
        <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Başlık (Opsiyonel)</label>
                <Input placeholder="Not başlığı..." value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Notunuz <span className="text-red-500">*</span></label>
                <Textarea
                    placeholder="Görevler, fikirler, hızlı notlar..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="min-h-[120px] resize-none"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Post-it Rengi</label>
                <div className="flex gap-4">
                    {NOTE_COLORS.map(c => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setColor(c.id)}
                            style={{ backgroundColor: c.hex }}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform shadow-sm ${color === c.id ? `ring-offset-2 ring-gray-400 scale-110 border-white/50 border-4` : 'border-transparent hover:scale-105 border-2'
                                }`}
                        >
                            {color === c.id && <Check className="w-5 h-5 text-gray-800" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-600 hover:bg-blue-700">
                    {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Notu Ekle"}
                </Button>
            </div>
        </form>
    );
}
