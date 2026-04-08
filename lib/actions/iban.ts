'use server'

import { db } from "@/lib/db";
import { ibans } from "@/lib/db/schema";
import { createIbanSchema } from "@/lib/validations";
import { eq, and, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentTenant } from "@/lib/data/tenant";

export async function createIban(prevState: any, formData: FormData) {
    const rawData = {
        name: formData.get("name"),
        bankName: formData.get("bankName"),
        ibanNumber: formData.get("ibanNumber"),
        accountHolder: formData.get("accountHolder"),
        tenantId: formData.get("tenantId"),
    };

    const validatedData = createIbanSchema.safeParse(rawData);

    if (!validatedData.success) {
        return {
            error: validatedData.error.flatten().fieldErrors,
            values: rawData
        };
    }

    const { name, bankName, ibanNumber, accountHolder } = validatedData.data;
    const tenantId = rawData.tenantId as string;

    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return { error: "Unauthorized" };

    // RBAC check
    if (!['admin', 'manager', 'staff'].includes(tenantData.userRole)) {
        return { error: "Yönetici yetkisi gereklidir." };
    }

    try {
        // 1. Check if IBAN already exists for this tenant
        const existingIban = await db.select()
            .from(ibans)
            .where(
                and(
                    eq(ibans.tenantId, tenantId),
                    eq(ibans.ibanNumber, ibanNumber)
                )
            )
            .limit(1);

        if (existingIban.length > 0) {
            // If exists but inactive, REACTIVATE it
            if (!existingIban[0].isActive) {
                await db.update(ibans).set({
                    isActive: true,
                    name,
                    bankName,
                    accountHolder
                }).where(eq(ibans.id, existingIban[0].id));

                revalidatePath("/dashboard/ibans");
                return { success: true };
            }

            // If exists and active, return error
            return {
                error: { ibanNumber: ["Bu IBAN numarası zaten kayıtlı."] },
                values: rawData
            };
        }

        // 2. New Record
        await db.insert(ibans).values({
            tenantId,
            name,
            bankName,
            ibanNumber,
            accountHolder,
        });

        revalidatePath("/dashboard/ibans");
        return { success: true };

    } catch (error) {
        console.error("Failed to create IBAN:", error);
        return { error: "IBAN eklenirken bir hata oluştu.", values: rawData };
    }
}

export async function getIbans(tenantId: string, query?: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return [];

    const data = await db
        .select()
        .from(ibans)
        .where(
            and(
                eq(ibans.tenantId, tenantId),
                eq(ibans.isActive, true),
                query ? or(
                    ilike(ibans.name, `%${query}%`),
                    ilike(ibans.bankName, `%${query}%`),
                    ilike(ibans.accountHolder, `%${query}%`)
                ) : undefined
            )
        )
        .orderBy(ibans.createdAt);

    return data;
}

export async function deleteIban(ibanId: string, tenantId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || tenantData.tenantId !== tenantId) return { error: "Unauthorized" };

    // RBAC check
    if (!['admin', 'manager', 'staff'].includes(tenantData.userRole)) {
        return { error: "Yönetici yetkisi gereklidir." };
    }

    try {
        await db.update(ibans)
            .set({ isActive: false })
            .where(
                and(
                    eq(ibans.id, ibanId),
                    eq(ibans.tenantId, tenantId)
                )
            );

        revalidatePath("/dashboard/ibans");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete IBAN:", error);
        return { error: "Silinirken hata oluştu." };
    }
}
