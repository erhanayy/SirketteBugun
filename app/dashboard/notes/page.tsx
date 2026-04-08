import { getCurrentTenant } from "@/lib/data/tenant";
import { getMyNotes } from "@/lib/actions/notes";
import NotesClient from "./notes-client";

export const metadata = {
    title: 'Notlar (Post-it) - Şirkette Bugün',
};

export default async function NotesPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    const res = await getMyNotes(tenantData.tenantId, tenantData.userId);
    const notes = res.data || [];

    return (
        <NotesClient
            initialNotes={notes}
            tenantId={tenantData.tenantId}
            userId={tenantData.userId}
        />
    );
}
