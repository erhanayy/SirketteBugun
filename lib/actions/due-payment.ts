'use server'

import { db } from "@/lib/db";
import { duePayments, users, tenantUsers } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, ilike, or, desc, asc } from "drizzle-orm";

export async function getMyDuePayments(userId: string) {
    return await db.query.duePayments.findMany({
        where: and(
            eq(duePayments.userId, userId),
            eq(duePayments.isActive, true)
        ),
        with: {
            due: {
                with: {
                    iban: true
                }
            }
        },
        orderBy: [desc(duePayments.id)] // simple order, you could sort by due's year instead
    });
}

export async function getDuePayments(
    dueId: string,
    query?: string,
    filterStatus?: string
) {
    // Basic query to fetch payments with user details
    // Note: Drizzle's query builder is cleaner for relations, but we need filtering on related fields

    // We'll use Drizzle's query API for simplicity if relations are set up,
    // explicitly ensuring we join with Users to sort/filter by name.

    const data = await db.query.duePayments.findMany({
        where: and(
            eq(duePayments.dueId, dueId),
            eq(duePayments.isActive, true)
        ),
        with: {
            user: true
        }
    });

    // In-memory filtering/sorting because filtering deep relations dynamicly 
    // with "or" conditions can be verbose in Drizzle without complex SQL construction.
    // For a typical association (< 1000 members), this is performant enough.

    let filtered = data.map(record => {
        // Determine logical status for UI filters
        let uiStatus = 'unpaid';
        const dueAmount = 0; // We need the due amount to determine 'partial', but it's on the parent. 
        // We'll handle this logic in the UI or fetch parent here.
        // For now, let's just return the raw data and user info.

        return record;
    });

    // Filter by Search Query
    if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(item =>
            item.user.fullName.toLowerCase().includes(lowerQuery)
        );
    }

    // Sort by Name
    filtered.sort((a, b) => a.user.fullName.localeCompare(b.user.fullName));

    return filtered;
}

export async function updateDuePayment(
    paymentId: string,
    data: {
        paymentStatus?: 'pending' | 'paid' | 'partial';
        paymentAmount?: number;
        paidAmount?: number;
        isExempt?: boolean;
    }
) {
    try {
        await db.update(duePayments)
            .set(data)
            .where(eq(duePayments.id, paymentId));

        // We don't know the dueId here easily without a fetch, so we revalidate the whole path pattern
        // Or we could pass dueId from client. Let's rely on standard path revalidation.
        revalidatePath("/dashboard/dues/[id]", "page");

        return { success: true };
    } catch (error) {
        console.error("Update Payment Error:", error);
        return { error: "Güncelleme başarısız." };
    }
}
