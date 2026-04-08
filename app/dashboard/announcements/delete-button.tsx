'use client';

import { Trash2 } from "lucide-react";
import { deleteAnnouncement } from "@/lib/actions/announcement";
import { useTransition } from "react";

export function DeleteAnnouncementButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (!confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;

        startTransition(async () => {
            const result = await deleteAnnouncement(id);
            if (!result.success) {
                alert(result.message || "Silme işlemi başarısız.");
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="Sil"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
