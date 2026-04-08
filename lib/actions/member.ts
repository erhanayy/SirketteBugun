'use server';

import { db } from "@/lib/db";
import { users, tenantUsers, tenants } from "@/lib/db/schema";
import { eq, and, ilike, or, ne, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentTenant } from "@/lib/data/tenant"; // Use the new tenant fetcher

const memberSchema = z.object({
    fullName: z.string().min(2, "Ad Soyad en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal('')),
    phoneNumber: z.string().min(10, "Telefon numarası en az 10 karakter olmalıdır"),
    role: z.enum(["admin", "staff"]),
    status: z.enum(["active", "banned", "old_member"]).optional().default("active"),
});

export async function getMembers(query: string = "") {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    const normalizedQuery = query.toLowerCase();

    // Fetch users belonging to the CURRENT tenant
    const members = await db
        .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            phoneNumber: users.phoneNumber,
            role: tenantUsers.role,
            status: tenantUsers.status,
            joinedAt: tenantUsers.createdAt,
        })
        .from(tenantUsers)
        .innerJoin(users, eq(tenantUsers.userId, users.id))
        .where(
            and(
                eq(tenantUsers.tenantId, tenantData.tenantId), // Filter by Current Tenant
                eq(users.isActive, true),
                eq(tenantUsers.isActive, true), // Only active memberships
                or(
                    ilike(users.fullName, `%${normalizedQuery}%`),
                    ilike(users.email, `%${normalizedQuery}%`),
                    ilike(users.phoneNumber, `%${normalizedQuery}%`)
                )
            )
        )
        .orderBy(desc(tenantUsers.createdAt));


    // Deduplicate logic: Keep the one with the most recent formatted joinedAt if duplicates exist
    // Map by userId to ensure uniqueness
    const uniqueMembersMap = new Map();
    for (const member of members) {
        if (!uniqueMembersMap.has(member.id)) {
            uniqueMembersMap.set(member.id, member);
        }
    }

    return Array.from(uniqueMembersMap.values());
}

export async function getMember(id: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    // Fetch user details for the specific member ID
    const [member] = await db
        .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            phoneNumber: users.phoneNumber,
            role: tenantUsers.role,
            status: tenantUsers.status,
            joinedAt: tenantUsers.createdAt,
        })
        .from(tenantUsers)
        .innerJoin(users, eq(tenantUsers.userId, users.id))
        .where(
            and(
                eq(tenantUsers.tenantId, tenantData.tenantId),
                eq(users.id, id)
            )
        );

    return member || null;
}

export async function createMember(prevState: any, formData: FormData) {
    const formDataRecord: Record<string, string> = {};
    formData.forEach((value, key) => {
        if (typeof value === 'string') {
            formDataRecord[key] = value;
        }
    });

    const tenantData = await getCurrentTenant();
    if (!tenantData) {
        console.log("[createMember] Tenant data missing.");
        return {
            error: "Oturum süresi dolmuş veya şirket seçilmemiş.",
            message: "Oturum süresi dolmuş veya şirket seçilmemiş.",
            success: false,
            values: formDataRecord
        };
    }


    const validatedFields = memberSchema.safeParse({
        fullName: formData.get("fullName"),
        email: formData.get("email") || undefined, // Convert null/empty to undefined for optional()
        phoneNumber: formData.get("phoneNumber"),
        role: formData.get("role"),
        status: formData.get("status") || undefined, // Convert null to undefined for default()
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors, // Changed 'errors' to 'error'
            message: "Lütfen alanları kontrol ediniz.",
            success: false,
            values: formDataRecord // Return values
        };
    }

    const { fullName, email, phoneNumber: rawPhoneNumber, role, status } = validatedFields.data;
    // const fullName = `${firstName} ${lastName}`.trim(); // Removed
    // Strip spaces from phone number
    const phoneNumber = rawPhoneNumber.replace(/\s/g, '');

    try {
        console.log(`[createMember] Starting for: ${fullName}`);

        // 1. Check if user exists globally (by phone or email)
        let userId: string;

        const existingUser = await db.query.users.findFirst({
            where: or(
                eq(users.phoneNumber, phoneNumber),
                email ? eq(users.email, email) : undefined
            )
        });

        console.log(`[createMember] Existing user found: ${existingUser ? existingUser.id : 'No'}`);

        if (existingUser) {
            userId = existingUser.id;

            // Check if already a member of THIS tenant
            const existingMembership = await db.query.tenantUsers.findFirst({
                where: and(
                    eq(tenantUsers.tenantId, tenantData.tenantId),
                    eq(tenantUsers.userId, userId)
                )
            });

            console.log(`[createMember] Existing membership found: ${existingMembership ? existingMembership.id : 'No'}`);

            if (existingMembership) {
                if (!existingMembership.isActive) {
                    // Reactive soft-deleted membership
                    console.log(`[createMember] Reactivating soft-deleted membership.`);
                    await db.update(tenantUsers)
                        .set({ isActive: true, role: role as any, status: status as any })
                        .where(eq(tenantUsers.id, existingMembership.id));
                } else {
                    console.log(`[createMember] User already active member.`);
                    return {
                        error: "Bu kullanıcı zaten bu derneğe üye.", // Use 'error' for string message
                        message: "Bu kullanıcı zaten bu derneğe üye.",
                        success: false,
                        values: formDataRecord
                    };
                }
            } else {
                // Add to tenant
                console.log(`[createMember] Adding existing user to tenant.`);
                await db.insert(tenantUsers).values({
                    tenantId: tenantData.tenantId,
                    userId: userId,
                    role: role as any,
                    status: status as any,
                });
            }
        } else {
            // Create new user globally
            console.log(`[createMember] Creating new global user.`);
            const [newUser] = await db.insert(users).values({
                fullName,
                email: email || null,
                phoneNumber,
                password: null, // Will be set on first login or invite
                forcePasswordChange: true,
            }).returning();
            userId = newUser.id;
            console.log(`[createMember] New user created: ${userId}`);

            // Add to tenant
            console.log(`[createMember] Adding new user to tenant.`);
            await db.insert(tenantUsers).values({
                tenantId: tenantData.tenantId,
                userId: userId,
                role: role as any,
                status: status as any,
            });
        }

        revalidatePath("/dashboard/members");
        console.log(`[createMember] Success.`);
        return { message: "Üye başarıyla eklendi.", success: true, values: {} }; // Clear values on success? Or keep? Usually clear.
    } catch (error: any) {
        console.error("Member creation error:", error);
        return {
            error: "Veritabanı hatası oluştu: " + error.message, // Use 'error' string
            message: "Veritabanı hatası oluştu.",
            success: false,
            values: formDataRecord
        };
    }
}

export async function deleteMember(id: string) {
    try {
        // Here 'id' is the user.id, but we need to delete the tenant_user record for the current tenant
        const tenantData = await getCurrentTenant();
        if (!tenantData) return { message: "Tenant not found" };

        await db.update(tenantUsers)
            .set({ isActive: false })
            .where(
                and(
                    eq(tenantUsers.userId, id),
                    eq(tenantUsers.tenantId, tenantData.tenantId)
                )
            );

        revalidatePath("/dashboard/members");
        return { message: "Deleted Member" };
    } catch (error) {
        return { message: "Database Error" };
    }
}

export async function updateMember(prevState: any, formData: FormData) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) {
        return { message: "Oturum süresi dolmuş veya şirket seçilmemiş.", success: false };
    }

    const memberId = formData.get("memberId") as string;
    if (!memberId) return { message: "Üye ID bulunamadı.", success: false };

    // Validasyon basitleştirildi, çünkü form fullName gönderiyor
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const role = formData.get("role") as string;

    if (!fullName || fullName.length < 2) {
        return { message: "Ad Soyad en az 2 karakter olmalıdır.", success: false };
    }
    if (!phoneNumber || phoneNumber.length < 10) {
        return { message: "Telefon numarası geçersiz.", success: false };
    }

    try {
        // 1. Update Global User Data
        // Check uniqueness for phone/email excluding current user
        const existingUser = await db.query.users.findFirst({
            where: and(
                ne(users.id, memberId),
                or(
                    eq(users.phoneNumber, phoneNumber),
                    email ? eq(users.email, email) : undefined
                )
            )
        });

        if (existingUser) {
            return { message: "Bu telefon veya e-posta başka bir üyeye ait.", success: false };
        }

        await db.update(users)
            .set({
                fullName,
                email: email || null,
                phoneNumber
            })
            .where(eq(users.id, memberId));

        // 2. Update Tenant Membership Data (Role)
        await db.update(tenantUsers)
            .set({
                role: role as any
            })
            .where(
                and(
                    eq(tenantUsers.userId, memberId),
                    eq(tenantUsers.tenantId, tenantData.tenantId)
                )
            );

        revalidatePath("/dashboard/members");
        revalidatePath(`/dashboard/members/${memberId}/edit`);
        return { message: "Üye bilgileri güncellendi.", success: true };

    } catch (error) {
        console.error("Update member error:", error);
        return { message: "Güncelleme sırasında hata oluştu.", success: false };
    }
}
