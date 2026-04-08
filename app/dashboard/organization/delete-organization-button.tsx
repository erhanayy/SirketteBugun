'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteOrganization } from '@/lib/actions/organization';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import { toast } from 'sonner';

export default function DeleteOrganizationButton({
    id,
    tenantId,
    name
}: {
    id: string;
    tenantId: string;
    name: string;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteOrganization(id, tenantId);
            if (result.success) {
                toast.success('Organizasyon silindi.');
            } else {
                toast.error(result.error || 'Bir hata oluştu.');
            }
        } catch (error) {
            toast.error('Silme işlemi başarısız.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Sil"
                disabled={isDeleting}
            >
                <Trash2 className="w-4 h-4" />
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Organizasyonu Sil"
                message={`"${name}" adlı organizasyonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                confirmText={isDeleting ? "Siliniyor..." : "Sil"}
                isDestructive={true}
            />
        </>
    );
}
