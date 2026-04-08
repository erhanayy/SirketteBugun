'use server'

import { db } from "@/lib/db";
import { projectTasks, projects, users } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc, and } from "drizzle-orm";
import { createNotification } from "./notification";
import { getProject } from "./projects";

export async function getProjectTasks(projectId: string) {
    return await db.query.projectTasks.findMany({
        where: and(
            eq(projectTasks.projectId, projectId),
            eq(projectTasks.isActive, true)
        ),
        with: {
            taskOwner: true
        },
        orderBy: [desc(projectTasks.createdAt)]
    });
}

export async function createProjectTask(
    tenantId: string,
    committeeId: string,
    projectId: string,
    task: string,
    taskOwnerId?: string,
    expectedEndDate?: string
) {
    if (!task) return { error: "Görev içeriği zorunludur." };

    try {
        const [newTask] = await db.insert(projectTasks).values({
            projectId,
            task,
            taskOwnerId: taskOwnerId || null,
            expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : null,
            taskStatus: 'planned'
        }).returning();

        // Send Notification if assigned to someone
        if (taskOwnerId) {
            const project = await getProject(projectId);
            const projectName = project ? project.title : 'Bir proje';

            await createNotification(
                tenantId,
                [taskOwnerId],
                'project_task',
                'Yeni Görev Atandı',
                `"${projectName}" projesinde size yeni bir görev atandı: ${task}`,
                `/dashboard/organization/${committeeId}/projects/${projectId}`
            );
        }

        revalidatePath(`/dashboard/organization/${committeeId}/projects/${projectId}`);
        return { success: true, task: newTask };
    } catch (error: any) {
        console.error("Create Project Task Error:", error);
        return { error: `Hata: ${error.message}` };
    }
}

export async function updateProjectTask(
    tenantId: string,
    committeeId: string,
    taskId: string,
    projectId: string,
    updates: {
        taskStatus?: string,
        expectedEndDate?: string | null,
        taskOwnerId?: string | null,
        task?: string
    }
) {
    try {
        // Fetch current task to see if owner changed
        const currentTask = await db.query.projectTasks.findFirst({
            where: eq(projectTasks.id, taskId),
            with: { project: true }
        });

        if (!currentTask) return { error: "Görev bulunamadı." };

        const updateData: any = { updatedAt: new Date() };
        if (updates.taskStatus !== undefined) {
            updateData.taskStatus = updates.taskStatus;
            if (updates.taskStatus === 'completed') {
                updateData.endDate = new Date();
            } else {
                updateData.endDate = null;
            }
        }
        if (updates.expectedEndDate !== undefined) {
            updateData.expectedEndDate = updates.expectedEndDate ? new Date(updates.expectedEndDate) : null;
        }
        if (updates.taskOwnerId !== undefined) {
            updateData.taskOwnerId = updates.taskOwnerId;
        }
        if (updates.task !== undefined) {
            updateData.task = updates.task;
        }

        await db.update(projectTasks)
            .set(updateData)
            .where(eq(projectTasks.id, taskId));

        // Send notification if owner changed
        if (updates.taskOwnerId && updates.taskOwnerId !== currentTask.taskOwnerId) {
            const projectName = currentTask.project?.title || 'Bir proje';
            await createNotification(
                tenantId,
                [updates.taskOwnerId],
                'project_task',
                'Yeni Görev Atandı',
                `"${projectName}" projesinde size bir görev devredildi: ${currentTask.task || updates.task}`,
                `/dashboard/organization/${committeeId}/projects/${projectId}`
            );
        }

        revalidatePath(`/dashboard/organization/${committeeId}/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Update Project Task Error:", error);
        return { error: `Hata: ${error.message}` };
    }
}

export async function deleteProjectTask(committeeId: string, projectId: string, taskId: string) {
    try {
        await db.update(projectTasks)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(projectTasks.id, taskId));

        revalidatePath(`/dashboard/organization/${committeeId}/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getMyActiveProjectsAndTasks(tenantId: string, userId: string) {
    try {
        // Fetch tasks assigned to the user that are NOT completed/cancelled
        const myTasks = await db.query.projectTasks.findMany({
            where: and(
                eq(projectTasks.taskOwnerId, userId),
                eq(projectTasks.isActive, true)
            ),
            with: {
                project: true
            }
        });

        // Filter active ones
        const activeTasks = myTasks.filter(t => t.taskStatus === 'planned' || t.taskStatus === 'in_progress');

        // Fetch projects managed by the user that are NOT completed/cancelled
        // We need to group these since a user might have tasks in a project they also manage, and we don't want duplicates in dropdown link
        const myProjects = await db.query.projects.findMany({
            where: and(
                eq(projects.managerId, userId),
                eq(projects.tenantId, tenantId),
                eq(projects.isActive, true)
            )
        });

        const activeProjects = myProjects.filter(p => p.status === 'planned' || p.status === 'active');

        // Build unique map of project IDs to show in the dropdown
        const projectMap = new Map<string, { id: string, committeeId: string, title: string, reason: string }>();

        // Add projects where user is manager
        activeProjects.forEach(p => {
            if (p.committeeId) {
                projectMap.set(p.id, {
                    id: p.id,
                    committeeId: p.committeeId,
                    title: p.title,
                    reason: 'Yönetici'
                });
            }
        });

        // Add projects where user has pending tasks
        activeTasks.forEach(t => {
            if (t.project && t.project.committeeId) {
                if (projectMap.has(t.projectId)) {
                    // Update reason if already manager
                    const existing = projectMap.get(t.projectId)!;
                    existing.reason = 'Yönetici & Görevli';
                } else {
                    projectMap.set(t.projectId, {
                        id: t.projectId,
                        committeeId: t.project.committeeId,
                        title: t.project.title,
                        reason: 'Görevli'
                    });
                }
            }
        });

        const activeItemCount = activeTasks.length + activeProjects.length;

        return {
            totalActionableCount: activeItemCount, // Count of open items (used for the badge)
            dropdownProjects: Array.from(projectMap.values())
        };

    } catch (error) {
        console.error("getMyActiveProjectsAndTasks error:", error);
        return { totalActionableCount: 0, dropdownProjects: [] };
    }
}
