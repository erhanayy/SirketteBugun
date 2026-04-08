"use server";

import { db } from "../db";
import { contracts, userContracts } from "../db/schema";
import { eq, and, desc, notInArray } from "drizzle-orm";
import { getCurrentTenant } from "../data/tenant";
import { revalidatePath } from "next/cache";

export async function getPendingContracts() {
    const tenantData = await getCurrentTenant();
    if (!tenantData?.userId) return [];

    const userId = tenantData.userId;

    // Get all active contracts
    const activeContracts = await db.query.contracts.findMany({
        where: eq(contracts.isActive, true),
    });

    if (activeContracts.length === 0) return [];

    // Get signed contracts for this user
    const signed = await db.query.userContracts.findMany({
        where: eq(userContracts.userId, userId),
        with: {
            contract: true
        }
    });

    // Filter out signed ones
    const signedContractIds = signed.map(s => s.contractId);

    // If no signed, return all active
    if (signedContractIds.length === 0) return activeContracts;

    // Return active contracts that are NOT in signed list
    // Note: This logic assumes if I signed v1.0, and v1.0 is still active, I don't need to sign again.
    // If v2.0 is active, and I signed v1.0, then v2.0.id != v1.0.id so I will need to sign v2.0.
    return activeContracts.filter(c => !signedContractIds.includes(c.id));
}

export async function acceptContract(contractId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData?.userId) {
        throw new Error("Kullanıcı bulunamadı.");
    }

    const userId = tenantData.userId;

    // Check if valid contract
    const contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, contractId)
    });

    if (!contract || !contract.isActive) {
        throw new Error("Geçersiz veya pasif sözleşme.");
    }

    // Check if already signed
    const existing = await db.query.userContracts.findFirst({
        where: and(
            eq(userContracts.userId, userId),
            eq(userContracts.contractId, contractId)
        )
    });

    if (existing) {
        return { success: true, message: "Zaten onaylanmış." };
    }

    // Sign
    await db.insert(userContracts).values({
        userId,
        contractId,
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Sözleşme onaylandı." };
}

export async function getSignedContracts() {
    const tenantData = await getCurrentTenant();
    if (!tenantData?.userId) return [];

    const userId = tenantData.userId;

    // Get distinct contract types that user has signed?
    // User requests: "imzaladığı sözleşmelerden 3 tipteki sözleşmenin SON versiyonlarını"
    // So we fetch userContracts, join contracts, order by acceptedAt desc.
    // Then group by type in JS logic.

    const signed = await db.query.userContracts.findMany({
        where: eq(userContracts.userId, userId),
        with: {
            contract: true
        },
        orderBy: desc(userContracts.acceptedAt)
    });

    // Filter to get the latest accepted version for each type
    const latestContractsByType = new Map();

    for (const s of signed) {
        const type = s.contract.type;
        if (!latestContractsByType.has(type)) {
            // Since we ordered by acceptedAt desc, the first one we see is the latest one accepted (or we should use version logic if user can sign multiple same versions?)
            // Usually version is monotonic.
            latestContractsByType.set(type, s.contract);
        }
    }

    return Array.from(latestContractsByType.values());
}
