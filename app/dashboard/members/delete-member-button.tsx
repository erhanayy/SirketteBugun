'use client';

import { deleteMember } from "@/lib/actions/member";
import { Trash2 } from "lucide-react";
import { useTransition, useState } from "react";
import ConfirmationModal from "@/components/ui/confirmation-modal";

export default function DeleteMemberButton({ memberId }: { memberId: string }) {
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            await deleteMember(memberId);
        });
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsModalOpen(true);
                }}
                disabled={isPending}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                title="Sil"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Çalışanı Sil"
                message="Bu çalışanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ancak veriler arşivlenir."
                confirmText={isPending ? "Siliniyor..." : "Sil"}
                isDestructive={true}
            />
        </>
    );
}
