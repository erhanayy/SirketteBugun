'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteBusinessCard } from "@/lib/actions/business_card";

export default function DeleteCardButton({ cardId, tenantId }: { cardId: string, tenantId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Bu kartviziti silmek istediğinize emin misiniz?")) return;

        setIsDeleting(true);
        const res = await deleteBusinessCard(cardId, tenantId);
        setIsDeleting(false);

        if (res.error) {
            alert(res.error);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span className="sr-only">Sil</span>
        </Button>
    );
}
