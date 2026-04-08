import { Suspense } from "react";
import EventsClient from "./components/events-client";
import { getEvents, markEventsAsRead } from "@/lib/actions/event";
import { getCurrentTenant } from "@/lib/data/tenant";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function EventsPage() {
    const events = await getEvents();
    const tenant = await getCurrentTenant();
    const userId = tenant?.userId;

    if (userId) {
        await markEventsAsRead();
    }

    return (
        <div className="min-h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Etkinlik Takvimi</h1>
                {(tenant?.userRole === 'admin' || tenant?.userRole === 'manager') && (
                    <Link href="/dashboard/events/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Etkinlik Ekle
                        </Button>
                    </Link>
                )}
            </div>

            <Suspense fallback={<div>Yükleniyor...</div>}>
                <EventsClient initialEvents={events} userId={userId} userRole={tenant?.userRole} />
            </Suspense>
        </div>
    );
}
