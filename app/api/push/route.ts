import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";

export async function GET() {
    return NextResponse.json({
        publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });
}

export async function POST(req: NextRequest) {
    try {
        const tenantData = await getCurrentTenant();
        if (!tenantData) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const subscription = await req.json();

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
        }

        const exists = await db.query.pushSubscriptions.findFirst({
            where: (sub, { eq, and }) => and(
                eq(sub.userId, tenantData.userId),
                eq(sub.endpoint, subscription.endpoint)
            )
        });

        if (!exists) {
            await db.insert(pushSubscriptions).values({
                userId: tenantData.userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            });
        }

        return NextResponse.json({ success: true, message: "Subscription saved" }, { status: 201 });
    } catch (e: any) {
        console.error("Save Push Error:", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}
