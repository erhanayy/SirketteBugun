import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SchedulerClient from "./scheduler-client";

export const metadata = {
    title: 'Sistem Görevleri - Şirkette Bugün',
};

export default async function SchedulerPage() {
    const session = await auth();

    // Security check: Must be Super Admin
    if (!session?.user?.isApplicationAdmin) {
        redirect("/dashboard");
    }

    return (
        <SchedulerClient />
    );
}
