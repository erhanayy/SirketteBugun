'use server'

import { db } from "@/lib/db";
import { projects, projectTasks, users, committees } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, desc, sql } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";

// Fetch all active projects for tenant (committeeId optional for filtering)
export async function getProjectsWithTaskCounts(committeeId?: string | null) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    const whereCondition = committeeId
        ? and(
            eq(projects.tenantId, tenantData.tenantId),
            eq(projects.committeeId, committeeId),
            eq(projects.isActive, true)
        )
        : and(
            eq(projects.tenantId, tenantData.tenantId),
            eq(projects.isActive, true)
        );

    const result = await db.select({
        project: projects,
        managerName: users.fullName,
        managerId: users.id,
        committeeId: committees.id,
        committeeName: committees.name,
        totalTasks: sql<number>`count(${projectTasks.id})`.mapWith(Number),
        completedTasks: sql<number>`sum(case when ${projectTasks.taskStatus} = 'completed' then 1 else 0 end)`.mapWith(Number)
    })
        .from(projects)
        .leftJoin(users, eq(projects.managerId, users.id))
        .leftJoin(committees, eq(projects.committeeId, committees.id))
        .leftJoin(projectTasks, and(
            eq(projects.id, projectTasks.projectId),
            eq(projectTasks.isActive, true)
        ))
        .where(whereCondition)
        .groupBy(projects.id, users.fullName, users.id, committees.id, committees.name)
        .orderBy(desc(projects.startDate), desc(projects.createdAt));

    // Sort: open projects first, then closed
    const openStatuses = ['planned', 'active'];
    const sorted = result.sort((a, b) => {
        const aIsOpen = openStatuses.includes(a.project.status);
        const bIsOpen = openStatuses.includes(b.project.status);
        if (aIsOpen && !bIsOpen) return -1;
        if (!aIsOpen && bIsOpen) return 1;
        const aDate = a.project.startDate ? new Date(a.project.startDate).getTime() : 0;
        const bDate = b.project.startDate ? new Date(b.project.startDate).getTime() : 0;
        return bDate - aDate;
    });

    return sorted;
}

export async function createProject(prevState: any, formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tenantId = formData.get("tenantId") as string;
    const committeeId = formData.get("committeeId") as string | null;
    const managerId = formData.get("managerId") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    if (!title || !tenantId) {
        return { error: "Lütfen zorunlu alanları doldurun." };
    }

    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return { error: "Unauthorized" };

    if (!['admin', 'staff'].includes(tenantData.userRole)) {
        return { error: "Yönetici yetkisi gereklidir." };
    }

    try {
        await db.insert(projects).values({
            tenantId,
            committeeId: committeeId || null,
            managerId: managerId || null,
            title,
            description,
            status: 'planned',
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
        });

        revalidatePath(`/dashboard/projects`);
        return { success: true };
    } catch (error: any) {
        console.error("Create Project Error:", error);
        return { error: `Hata: ${error.message}` };
    }
}

export async function getProject(projectId: string) {
    return await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
            manager: true
        }
    });
}

export async function updateProject(prevState: any, formData: FormData) {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const committeeId = formData.get("committeeId") as string | null;
    const managerId = formData.get("managerId") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const status = formData.get("status") as string;

    if (!id || !title) {
        return { error: "Lütfen zorunlu alanları doldurun." };
    }

    try {
        await db.update(projects)
            .set({
                title,
                description,
                committeeId: committeeId || null,
                managerId: managerId || null,
                status: status as any,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                updatedAt: new Date()
            })
            .where(eq(projects.id, id));

        revalidatePath(`/dashboard/projects/${id}`);
        revalidatePath(`/dashboard/projects`);
        return { success: true };
    } catch (error: any) {
        console.error("Update Project Error:", error);
        return { error: `Hata: ${error.message}` };
    }
}
