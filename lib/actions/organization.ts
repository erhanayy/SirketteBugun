'use server'

import { db } from "@/lib/db";
import { committees, committeeMembers, users, tenantUsers } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, desc, asc, like, ilike, or, not, sql, getTableColumns } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";

// --- Organization (Committee) Management ---

export async function getOrganizations(tenantId: string, query?: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) throw new Error("Unauthorized");
    // Determine sort order: Management Board first, then Executive, then by Name
    // Since we don't have a complex ordering function in simple drizzle query builder easily exposed for this enum logic without raw sql in orderBy,
    // we will fetch and sort in application logic or use a simple order if possible.
    // Let's try to order by type descending (management_board > executive_...) might not work alphabetically.
    // 'management_board' vs 'executive_committee'. 'm' > 'e'. So desc type puts management first? No, 'm' is after 'e'. 
    // So 'desc(committees.type)' might put management_board (m) before executive (e)? Yes. m comes after e in alphabet. 
    // So desc sort: m, e. Correct.

    const searchFilter = query
        ? and(
            eq(committees.tenantId, tenantId),
            eq(committees.isActive, true),
            ilike(committees.name, `%${query}%`)
        )
        : and(
            eq(committees.tenantId, tenantId),
            eq(committees.isActive, true)
        );

    const orgs = await db.select({
        id: committees.id,
        tenantId: committees.tenantId,
        parentCommitteeId: committees.parentCommitteeId,
        name: committees.name,
        type: committees.type,
        purpose: committees.purpose,
        description: committees.description,
        isActive: committees.isActive,
        createdAt: committees.createdAt,
        memberCount: sql<number>`count(${committeeMembers.id})`.mapWith(Number)
    })
        .from(committees)
        .leftJoin(committeeMembers, and(
            eq(committees.id, committeeMembers.committeeId),
            eq(committeeMembers.isActive, true)
        ))
        .where(searchFilter)
        .groupBy(committees.id, committees.tenantId, committees.parentCommitteeId, committees.name, committees.type, committees.purpose, committees.description, committees.isActive, committees.createdAt)
        .orderBy(desc(committees.type), asc(committees.name));

    return orgs;
}

export async function getOrganization(id: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    return await db.query.committees.findFirst({
        where: and(eq(committees.id, id), eq(committees.tenantId, tenantData.tenantId)),
        with: {
            members: {
                where: eq(committeeMembers.isActive, true),
                with: {
                    user: true
                }
            }
        }
    });
}

export async function createOrganization(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const tenantId = formData.get("tenantId") as string;
    const parentCommitteeId = formData.get("parentCommitteeId") as string | null;

    if (!name || !type || !tenantId) {
        return { error: "Lütfen zorunlu alanları doldurun." };
    }

    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return { error: "Unauthorized" };

    // RBAC check — admin only
    if (tenantData.userRole !== 'admin') {
        return { error: "Bu işlem sadece şirket yöneticisi tarafından yapılabilir." };
    }

    try {
        await db.insert(committees).values({
            tenantId,
            name,
            type: type as any,
            description,
            parentCommitteeId: parentCommitteeId || null,
        });

        revalidatePath("/dashboard/organization");
        return { success: true };
    } catch (error: any) {
        console.error("Create Organization Error:", error);
        return { error: `Hata: ${error.message}` };
    }
}

export async function updateOrganization(prevState: any, formData: FormData) {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const tenantId = formData.get("tenantId") as string;
    const parentCommitteeId = formData.get("parentCommitteeId") as string | null;

    if (!id || !name || !type || !tenantId) {
        return { error: "Lütfen zorunlu alanları doldurun." };
    }

    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return { error: "Unauthorized" };

    // RBAC check — admin only
    if (tenantData.userRole !== 'admin') {
        return { error: "Bu işlem sadece şirket yöneticisi tarafından yapılabilir." };
    }

    try {
        await db.update(committees)
            .set({ name, type: type as any, description, parentCommitteeId: parentCommitteeId || null })
            .where(and(eq(committees.id, id), eq(committees.tenantId, tenantId)));

        revalidatePath("/dashboard/organization");
        return { success: true };
    } catch (error: any) {
        console.error("Update Organization Error:", error);
        return { error: `Hata: ${error.message}` };
    }
}

export async function deleteOrganization(id: string, tenantId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return { error: "Unauthorized" };

    // RBAC check — admin only
    if (tenantData.userRole !== 'admin') {
        return { error: "Bu işlem sadece şirket yöneticisi tarafından yapılabilir." };
    }

    try {
        await db.update(committees)
            .set({ isActive: false })
            .where(and(eq(committees.id, id), eq(committees.tenantId, tenantId)));

        revalidatePath("/dashboard/organization");
        return { success: true };
    } catch (error: any) {
        console.error("Delete Organization Error:", error);
        return { error: `Hata: ${error.message}` };
    }
}

// Get flat list of organizations for dropdowns (new project form, etc.)
export async function getOrganizationsForSelect(tenantId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return [];

    return await db.select({
        id: committees.id,
        name: committees.name,
        parentCommitteeId: committees.parentCommitteeId,
    })
        .from(committees)
        .where(and(eq(committees.tenantId, tenantId), eq(committees.isActive, true)))
        .orderBy(committees.name);
}

// --- Member Assignment ---

export async function getOrganizationMembers(committeeId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    // Verify committee belongs to user's tenant
    const committee = await db.query.committees.findFirst({
        where: and(eq(committees.id, committeeId), eq(committees.tenantId, tenantData.tenantId))
    });
    if (!committee) return [];

    return await db.query.committeeMembers.findMany({
        where: and(eq(committeeMembers.committeeId, committeeId), eq(committeeMembers.isActive, true)),
        with: {
            user: true
        }
    });
}

export async function getUserCommitteeMemberships(userId: string) {
    return await db.query.committeeMembers.findMany({
        where: and(eq(committeeMembers.userId, userId), eq(committeeMembers.isActive, true)),
    });
}

export async function getAllUsersForAssignment(tenantId: string, query?: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return [];

    // RBAC check: Only staff can manage assignments
    if (!['admin', 'manager', 'staff'].includes(tenantData.userRole)) return [];

    // We need to fetch ALL active users (admin/staff/member) for this tenant to list them in the assignment grid
    // We will join with committee_members later or returning clean list

    const searchFilter = query
        ? and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.isActive, true),
            eq(tenantUsers.status, 'active'),
            or(
                ilike(users.fullName, `%${query}%`),
                ilike(users.phoneNumber, `%${query}%`)
            )
        )
        : and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.isActive, true),
            eq(tenantUsers.status, 'active')
        );

    // This join is needed to filter by user name/phone effectively
    // But since Drizzle's `findMany` on relational queries with filters on related tables can be tricky with `ilike`,
    // let's use db.select().from().innerJoin() for better control if needed, or stick to query builder if relations are set up for filtering.
    // The `tenantUsersRelations` has `user` relation.

    // Using query builder for simplicity:
    const results = await db.query.tenantUsers.findMany({
        where: searchFilter,
        with: {
            user: true
        },
        orderBy: [desc(tenantUsers.createdAt)],
        limit: 100 // Cap for performance if needed, but for now infinite scroll is not implemented
    });

    // Manually filter by user name if the relation filter didn't apply (drizzle query builder applies `where` to the root table)
    // Actually, to filter by `users.fullName`, we need to use `eq(users.id, tenantUsers.userId)` and join.
    // Drizzle `findMany` `where` applies to `tenantUsers`.
    // So we should do a proper join.

    const rows = await db.select({
        tenantUser: tenantUsers,
        user: users
    })
        .from(tenantUsers)
        .innerJoin(users, eq(tenantUsers.userId, users.id))
        .where(searchFilter);

    // Filter duplicates by user.id
    const uniqueUsers = new Map();
    for (const row of rows) {
        if (!uniqueUsers.has(row.user.id)) {
            uniqueUsers.set(row.user.id, row);
        }
    }

    return Array.from(uniqueUsers.values()).map((r: any) => ({ ...r.tenantUser, user: r.user }));
}


export async function toggleCommitteeMember(
    committeeId: string,
    userId: string,
    isMember: boolean,
    title: string = "Üye",
    role: 'president' | 'vice_president' | 'secretary' | 'member' = 'member'
) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { error: "Unauthorized" };

    // RBAC check
    if (!['admin', 'manager', 'staff'].includes(tenantData.userRole)) {
        return { error: "Yönetici yetkisi gereklidir." };
    }

    // Verify committee belongs to tenant
    const committee = await db.query.committees.findFirst({
        where: and(eq(committees.id, committeeId), eq(committees.tenantId, tenantData.tenantId))
    });
    if (!committee) return { error: "Organizasyon bulunamadı." };

    console.log(`[toggleCommitteeMember] Request: committee=${committeeId}, user=${userId}, isMember=${isMember}, role=${role}`);
    try {
        if (isMember) {
            // Check if already exists (including soft deleted)
            const existing = await db.query.committeeMembers.findFirst({
                where: and(
                    eq(committeeMembers.committeeId, committeeId),
                    eq(committeeMembers.userId, userId)
                )
            });

            console.log(`[toggleCommitteeMember] Existing record: ${existing ? existing.id : 'None'}`);

            if (existing) {
                // Update and Reactivate
                await db.update(committeeMembers)
                    .set({
                        isActive: true,
                        title: title || "Üye", // Default if empty
                        role: role // Update role
                    })
                    .where(eq(committeeMembers.id, existing.id));
                console.log(`[toggleCommitteeMember] Updated existing record.`);
            } else {
                // Insert New
                await db.insert(committeeMembers).values({
                    committeeId,
                    userId,
                    title: title || "Üye",
                    role: role
                });
                console.log(`[toggleCommitteeMember] Inserted new record.`);
            }
        } else {
            // Remove (Soft Delete)
            await db.update(committeeMembers)
                .set({ isActive: false })
                .where(and(
                    eq(committeeMembers.committeeId, committeeId),
                    eq(committeeMembers.userId, userId)
                ));
            console.log(`[toggleCommitteeMember] Deactivated record.`);
        }

        revalidatePath(`/dashboard/organization/${committeeId}/members`);
        revalidatePath(`/dashboard/organization`);
        return { success: true };

    } catch (error: any) {
        console.error("Toggle Committee Member Error:", error);
        return { error: error.message };
    }
}

// ============================================================
// V2 TREE ACTIONS
// ============================================================

export async function getAllCommitteesForTree() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    const rows = await db.select({
        id: committees.id,
        name: committees.name,
        type: committees.type,
        description: committees.description,
        parentCommitteeId: committees.parentCommitteeId,
        tenantId: committees.tenantId,
        isActive: committees.isActive,
        // member info
        memberId: committeeMembers.id,
        memberUserId: committeeMembers.userId,
        memberRole: committeeMembers.role,
        memberTitle: committeeMembers.title,
        memberIsActive: committeeMembers.isActive,
        memberFullName: users.fullName,
    })
        .from(committees)
        .leftJoin(committeeMembers, and(
            eq(committeeMembers.committeeId, committees.id),
            eq(committeeMembers.isActive, true)
        ))
        .leftJoin(users, eq(users.id, committeeMembers.userId))
        .where(and(
            eq(committees.tenantId, tenantData.tenantId),
            eq(committees.isActive, true)
        ))
        .orderBy(asc(committees.name));

    // Group into committee objects with members[]
    const committeeMap = new Map<string, {
        id: string; name: string; type: string; description: string | null;
        parentCommitteeId: string | null; tenantId: string;
        members: { userId: string; role: string; title: string; fullName: string }[];
    }>();

    for (const row of rows) {
        if (!committeeMap.has(row.id)) {
            committeeMap.set(row.id, {
                id: row.id, name: row.name, type: row.type,
                description: row.description, parentCommitteeId: row.parentCommitteeId,
                tenantId: row.tenantId, members: []
            });
        }
        if (row.memberId && row.memberUserId && row.memberIsActive) {
            committeeMap.get(row.id)!.members.push({
                userId: row.memberUserId,
                role: row.memberRole ?? 'member',
                title: row.memberTitle ?? '',
                fullName: row.memberFullName ?? '',
            });
        }
    }

    return Array.from(committeeMap.values());
}

export async function createChildCommittee(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const parentCommitteeId = formData.get('parentCommitteeId') as string | null;
    const type = (formData.get('type') as string) || 'executive_committee';

    if (!name?.trim()) return { error: 'Departman adı zorunludur.' };

    const tenantData = await getCurrentTenant();
    if (!tenantData) return { error: 'Unauthorized' };
    if (tenantData.userRole !== 'admin') return { error: 'Sadece yöneticiler ekleyebilir.' };

    try {
        const newId = await db.insert(committees).values({
            tenantId: tenantData.tenantId,
            name: name.trim(),
            type: type as any,
            parentCommitteeId: parentCommitteeId || null,
        }).returning({ id: committees.id });

        revalidatePath('/dashboard/organization/tree');
        revalidatePath('/dashboard/organization');
        return { success: true, id: newId[0]?.id };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateCommitteeNode(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const managerId = formData.get('managerId') as string | null;
    // memberIds is a JSON array string
    const memberIdsRaw = formData.get('memberIds') as string;
    const memberIds: string[] = memberIdsRaw ? JSON.parse(memberIdsRaw) : [];

    if (!id || !name?.trim()) return { error: 'Zorunlu alanlar eksik.' };

    const tenantData = await getCurrentTenant();
    if (!tenantData) return { error: 'Unauthorized' };
    if (tenantData.userRole !== 'admin') return { error: 'Sadece yöneticiler düzenleyebilir.' };

    try {
        // 1. Update committee info
        await db.update(committees)
            .set({ name: name.trim(), type: type as any, description })
            .where(and(eq(committees.id, id), eq(committees.tenantId, tenantData.tenantId)));

        // 2. Sync members: deactivate all, then re-add selected ones
        await db.update(committeeMembers)
            .set({ isActive: false })
            .where(eq(committeeMembers.committeeId, id));

        for (const userId of memberIds) {
            const role = userId === managerId ? 'president' : 'member';
            const title = userId === managerId ? 'Departman Yöneticisi' : 'Çalışan';

            const existing = await db.query.committeeMembers.findFirst({
                where: and(eq(committeeMembers.committeeId, id), eq(committeeMembers.userId, userId))
            });
            if (existing) {
                await db.update(committeeMembers)
                    .set({ isActive: true, role, title })
                    .where(eq(committeeMembers.id, existing.id));
            } else {
                await db.insert(committeeMembers).values({ committeeId: id, userId, role, title });
            }
        }

        revalidatePath('/dashboard/organization/tree');
        revalidatePath('/dashboard/organization');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function softDeleteCommitteeTree(committeeId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { error: 'Unauthorized' };
    if (tenantData.userRole !== 'admin') return { error: 'Sadece yöneticiler silebilir.' };

    // Recursively find all descendants using a CTE
    try {
        // Get all IDs to soft-delete (this committee + all descendants)
        const allIds = await getDescendantIds(committeeId, tenantData.tenantId);
        allIds.push(committeeId);

        // Soft-delete all
        for (const id of allIds) {
            await db.update(committees)
                .set({ isActive: false })
                .where(and(eq(committees.id, id), eq(committees.tenantId, tenantData.tenantId)));
        }

        revalidatePath('/dashboard/organization/tree');
        revalidatePath('/dashboard/organization');
        return { success: true, deletedCount: allIds.length };
    } catch (e: any) {
        return { error: e.message };
    }
}

async function getDescendantIds(parentId: string, tenantId: string): Promise<string[]> {
    const children = await db.select({ id: committees.id })
        .from(committees)
        .where(and(
            eq(committees.parentCommitteeId, parentId),
            eq(committees.tenantId, tenantId),
            eq(committees.isActive, true)
        ));

    const ids: string[] = [];
    for (const child of children) {
        ids.push(child.id);
        const grandchildren = await getDescendantIds(child.id, tenantId);
        ids.push(...grandchildren);
    }
    return ids;
}
