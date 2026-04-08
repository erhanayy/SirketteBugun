import CreateMemberForm from "./create-member-form";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";

export default async function NewMemberPage() {
    const tenantData = await getCurrentTenant();
    if (tenantData?.userRole === "member") {
        redirect("/dashboard/members");
    }
    return (
        <CreateMemberForm />
    );
}
