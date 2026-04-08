import { getMember } from "@/lib/actions/member";
import EditMemberForm from "./edit-member-form";
import { notFound, redirect } from "next/navigation";
import { getCurrentTenant } from "@/lib/data/tenant";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole === "member") {
        redirect("/dashboard/members");
    }
    const { id } = await params;
    const member = await getMember(id);

    if (!member) {
        notFound();
    }

    return (
        <EditMemberForm member={member} />
    );
}
