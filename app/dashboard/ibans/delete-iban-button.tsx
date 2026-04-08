'use client';

import { deleteIban } from "@/lib/actions/iban";
import { Trash2 } from "lucide-react";
import { useTransition, useState } from "react";
import ConfirmationModal from "@/components/ui/confirmation-modal";

export default function DeleteIbanButton({ ibanId, tenantId }: { ibanId: string, tenantId: string }) {
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            await deleteIban(ibanId, tenantId);
        });
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
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
                title="Banka Hesabını Sil"
                message="Bu banka hesabını silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                confirmText={isPending ? "Siliniyor..." : "Sil"}
                isDestructive={true}
            />
        </>
    );
}
