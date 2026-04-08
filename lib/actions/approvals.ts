"use server";

import { db } from "@/lib/db";
import { approvalFlows, approvalRequests, committeeMembers } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- FLOW DEFINITION (ADMIN) ---

export async function createApprovalFlow(data: { tenantId: string, name: string, approvalLevel: number, fields: any[] }) {
    try {
        await db.insert(approvalFlows).values({
            tenantId: data.tenantId,
            name: data.name,
            approvalLevel: data.approvalLevel,
            fields: data.fields
        });
        revalidatePath('/dashboard/admin/approvals');
        return { success: true };
    } catch (error: any) {
        console.error("Error creating flow:", error);
        return { success: false, error: "Akış kaydedilirken hata oluştu." };
    }
}

export async function getApprovalFlows(tenantId: string) {
    return await db.query.approvalFlows.findMany({
        where: eq(approvalFlows.tenantId, tenantId),
        orderBy: [desc(approvalFlows.createdAt)]
    });
}

export async function deleteApprovalFlow(flowId: string) {
    try {
        await db.delete(approvalFlows).where(eq(approvalFlows.id, flowId));
        revalidatePath('/dashboard/admin/approvals');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Hata oluştu. Bu akışa ait başlatılmış talepler olabilir." };
    }
}

// --- HIERARCHY RESOLUTION ---

export async function findManagerOf(userId: string): Promise<string | null> {
    const memberships = await db.query.committeeMembers.findMany({
        where: eq(committeeMembers.userId, userId),
        with: { committee: true }
    });

    if (memberships.length === 0) return null;

    // Favor memberships where the user is NOT the president
    let roleMembership = memberships.find(m => m.role !== 'president');

    if (!roleMembership) {
        // User is president of ALL their active committees
        // Meaning their manager is the president of their committee's parent
        let parentCommitteeId = memberships[0]?.committee?.parentCommitteeId;
        if (!parentCommitteeId) return null; // Top of the tree

        const president = await db.query.committeeMembers.findFirst({
            where: and(
                eq(committeeMembers.committeeId, parentCommitteeId),
                eq(committeeMembers.role, 'president')
            )
        });
        return president?.userId ? (president.userId === userId ? null : president.userId) : null;
    } else {
        // User is a member (not president). Manager is the president of this same committee.
        const president = await db.query.committeeMembers.findFirst({
            where: and(
                eq(committeeMembers.committeeId, roleMembership.committeeId),
                eq(committeeMembers.role, 'president')
            )
        });

        if (president && president.userId !== userId) {
            return president.userId;
        }
        return null;
    }
}

// --- USER REQUESTS ---

export async function createApprovalRequest(data: { tenantId: string, flowId: string, requesterId: string, fieldData: any, attachmentUrl?: string }) {
    try {
        const managerId = await findManagerOf(data.requesterId);

        if (!managerId) {
            return { success: false, error: "Hiyerarşi bulunamadığı için akış başlatamazsınız." };
        }

        await db.insert(approvalRequests).values({
            tenantId: data.tenantId,
            flowId: data.flowId,
            requesterId: data.requesterId,
            currentApproverId: managerId,
            fieldData: data.fieldData,
            attachmentUrl: data.attachmentUrl,
            status: 'pending',
            currentLevel: 1
        });

        revalidatePath('/dashboard/flows');
        return { success: true };
    } catch (error: any) {
        console.error("Error creating request:", error);
        return { success: false, error: "Talep gönderilirken hata oluştu." };
    }
}

export async function getMyApprovalRequests(tenantId: string, userId: string) {
    return await db.query.approvalRequests.findMany({
        where: and(
            eq(approvalRequests.tenantId, tenantId),
            eq(approvalRequests.requesterId, userId)
        ),
        with: { flow: true, currentApprover: true },
        orderBy: [desc(approvalRequests.createdAt)]
    });
}

export async function getPendingApprovalsForMe(tenantId: string, approverId: string) {
    return await db.query.approvalRequests.findMany({
        where: and(
            eq(approvalRequests.tenantId, tenantId),
            eq(approvalRequests.currentApproverId, approverId),
            eq(approvalRequests.status, 'pending')
        ),
        with: { flow: true, requester: true },
        orderBy: [desc(approvalRequests.createdAt)]
    });
}

export async function processApproval(requestId: string, approverId: string, action: 'approve' | 'reject') {
    try {
        const req = await db.query.approvalRequests.findFirst({
            where: eq(approvalRequests.id, requestId),
            with: { flow: true }
        });

        if (!req) return { success: false, error: "Talep bulunamadı." };
        if (req.currentApproverId !== approverId || req.status !== 'pending') {
            return { success: false, error: "Yetkisiz veya tamamlanmış işlem." };
        }

        const flow = req.flow;
        if (!flow) return { success: false, error: "Akış tanımı bulunamadı." };

        if (action === 'reject') {
            await db.update(approvalRequests).set({ status: 'rejected' }).where(eq(approvalRequests.id, requestId));
            revalidatePath('/dashboard/flows');
            return { success: true };
        }

        // Action is approve
        const maxLevel = flow.approvalLevel; // 0 = top, N = max level

        if (maxLevel !== 0 && req.currentLevel >= maxLevel) {
            // Reached target level
            await db.update(approvalRequests).set({ status: 'approved', currentApproverId: null }).where(eq(approvalRequests.id, requestId));
            revalidatePath('/dashboard/flows');
            return { success: true };
        }

        // Needs next manager
        const nextManagerId = await findManagerOf(approverId);

        if (!nextManagerId) {
            // Peak of the tree reached
            await db.update(approvalRequests).set({ status: 'approved', currentApproverId: null }).where(eq(approvalRequests.id, requestId));
        } else {
            // Forward to next manager
            await db.update(approvalRequests).set({
                currentLevel: req.currentLevel + 1,
                currentApproverId: nextManagerId
            }).where(eq(approvalRequests.id, requestId));
        }

        revalidatePath('/dashboard/flows');
        return { success: true };
    } catch (e: any) {
        console.error("Error processing approval:", e);
        return { success: false, error: "İşlem sırasında hata oluştu." };
    }
}
