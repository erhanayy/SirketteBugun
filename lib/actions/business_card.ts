'use server'

import { db } from "@/lib/db";
import { businessCards, users } from "@/lib/db/schema";
import { eq, and, ilike, or, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentTenant } from "@/lib/data/tenant";

export async function upsertBusinessCard(prevState: unknown, formData: FormData) {
    const tenantId = formData.get("tenantId") as string;
    const userId = formData.get("userId") as string;
    const companyName = formData.get("companyName") as string;
    const workStatus = formData.get("workStatus") as "owner" | "employee";
    const title = formData.get("title") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;

    // Optional Fields
    const educationDoctorate = formData.get("educationDoctorate") as string | null;
    const educationMaster = formData.get("educationMaster") as string | null;
    const educationBachelor = formData.get("educationBachelor") as string | null;
    const educationHighSchool = formData.get("educationHighSchool") as string | null;
    const birthDateRaw = formData.get("birthDate") as string | null;
    const profilePhotoUrl = formData.get("profilePhotoUrl") as string | null;

    if (!companyName || !workStatus || !title || !phone || !email) {
        return { error: "Lütfen gerekli tüm alanları doldurun." };
    }

    let birthDate: Date | null = null;
    if (birthDateRaw) {
        birthDate = new Date(birthDateRaw);
    }

    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return { error: "Unauthorized" };

    // Security check: User can only update their own card unless they are admin/manager/staff
    if (tenantData.userId !== userId && !['admin', 'manager', 'staff'].includes(tenantData.userRole)) {
        return { error: "Yetersiz yetki." };
    }

    try {
        const existingCard = await db.select()
            .from(businessCards)
            .where(
                and(
                    eq(businessCards.tenantId, tenantId),
                    eq(businessCards.userId, userId)
                )
            ).limit(1);

        if (existingCard.length > 0) {
            // Update
            await db.update(businessCards).set({
                companyName,
                workStatus,
                title,
                phone,
                email,
                educationDoctorate,
                educationMaster,
                educationBachelor,
                educationHighSchool,
                birthDate,
                profilePhotoUrl,
                updatedAt: new Date(),
                isActive: true
            }).where(eq(businessCards.id, existingCard[0].id));
        } else {
            // Insert
            await db.insert(businessCards).values({
                tenantId,
                userId,
                companyName,
                workStatus,
                title,
                phone,
                email,
                educationDoctorate,
                educationMaster,
                educationBachelor,
                educationHighSchool,
                birthDate,
                profilePhotoUrl,
            });
        }

        revalidatePath("/dashboard/business-cards");
        return { success: true };

    } catch (error) {
        console.error("Failed to upsert Business Card:", error);
        return { error: "Kartvizit kaydedilirken bir hata oluştu." };
    }
}

export async function getBusinessCards(tenantId: string, query?: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return [];

    // We join with users table to get the full name
    const data = await db
        .select({
            id: businessCards.id,
            companyName: businessCards.companyName,
            title: businessCards.title,
            phone: businessCards.phone,
            email: businessCards.email,
            profilePhotoUrl: businessCards.profilePhotoUrl,
            userFullName: users.fullName,
            userId: businessCards.userId,
            isActive: businessCards.isActive,
        })
        .from(businessCards)
        .leftJoin(users, eq(businessCards.userId, users.id))
        .where(
            and(
                eq(businessCards.tenantId, tenantId),
                eq(businessCards.isActive, true),
                query ? or(
                    ilike(businessCards.companyName, `%${query}%`),
                    ilike(users.fullName, `%${query}%`)
                ) : undefined
            )
        )
        .orderBy(asc(users.fullName));

    return data;
}

export async function getBusinessCardByUserId(tenantId: string, userId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return null;

    const data = await db.select()
        .from(businessCards)
        .where(
            and(
                eq(businessCards.tenantId, tenantId),
                eq(businessCards.userId, userId)
            )
        ).limit(1);

    return data.length > 0 ? data[0] : null;
}

export async function getBusinessCardById(cardId: string, tenantId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return null;

    const data = await db
        .select({
            id: businessCards.id,
            tenantId: businessCards.tenantId,
            userId: businessCards.userId,
            companyName: businessCards.companyName,
            workStatus: businessCards.workStatus,
            title: businessCards.title,
            phone: businessCards.phone,
            email: businessCards.email,
            educationDoctorate: businessCards.educationDoctorate,
            educationMaster: businessCards.educationMaster,
            educationBachelor: businessCards.educationBachelor,
            educationHighSchool: businessCards.educationHighSchool,
            birthDate: businessCards.birthDate,
            profilePhotoUrl: businessCards.profilePhotoUrl,
            userFullName: users.fullName,
        })
        .from(businessCards)
        .leftJoin(users, eq(businessCards.userId, users.id))
        .where(
            and(
                eq(businessCards.id, cardId),
                eq(businessCards.tenantId, tenantId)
            )
        ).limit(1);

    return data.length > 0 ? data[0] : null;
}

export async function deleteBusinessCard(cardId: string, tenantId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return { error: "Unauthorized" };

    try {
        // Find card to check ownership
        const card = await db.query.businessCards.findFirst({
            where: and(eq(businessCards.id, cardId), eq(businessCards.tenantId, tenantId))
        });

        if (!card) return { error: "Kartvizit bulunamadı." };

        // Security check: Only owner or managers can delete
        if (tenantData.userId !== card.userId && !['admin', 'manager', 'staff'].includes(tenantData.userRole)) {
            return { error: "Yetersiz yetki." };
        }

        await db.update(businessCards)
            .set({ isActive: false })
            .where(
                and(
                    eq(businessCards.id, cardId),
                    eq(businessCards.tenantId, tenantId)
                )
            );

        revalidatePath("/dashboard/business-cards");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete Business Card:", error);
        return { error: "Silinirken hata oluştu." };
    }
}
