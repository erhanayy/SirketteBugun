'use server';

import { db } from "@/lib/db";
import { parameters, tenantUserOffers, tenantUserOfferPrices } from "@/lib/db/schema";
import { eq, or, and, gte, lte } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { auth } from "@/auth";

// 1. Get IBAN Parameters for the Upsell UI
export async function getPremiumIbanDetails() {
    try {
        const params = await db.select().from(parameters).where(
            or(
                eq(parameters.code, 'SirketteBugunIBANAccountName'),
                eq(parameters.code, 'SirketteBugunIBANBankName'),
                eq(parameters.code, 'SirketteBugunIBAN')
            )
        );

        const details = {
            accountName: params.find(p => p.code === 'SirketteBugunIBANAccountName')?.dataStr || '',
            bankName: params.find(p => p.code === 'SirketteBugunIBANBankName')?.dataStr || '',
            iban: params.find(p => p.code === 'SirketteBugunIBAN')?.dataStr || ''
        };
        return details;
    } catch (error) {
        console.error("Error fetching IBAN details:", error);
        return { accountName: '', bankName: '', iban: '' };
    }
}

// 2. Get Limits
export async function getSystemLimits() {
    try {
        const params = await db.select().from(parameters).where(
            or(
                eq(parameters.code, 'PostDailyLimit'),
                eq(parameters.code, 'MesajDailyLimit'),
                eq(parameters.code, 'AdWaitSeconds'),
                eq(parameters.code, 'UploadVideoSize'),
                eq(parameters.code, 'UploadPhotoSize'),
                eq(parameters.code, 'PremiumUploadVideoSize'),
                eq(parameters.code, 'PremiumUploadPhotoSize'),
                eq(parameters.code, 'PhotoCountPerPost'),
                eq(parameters.code, 'PremiumPhotoCountPerPost')
            )
        );

        return {
            postDailyLimit: params.find(p => p.code === 'PostDailyLimit')?.dataInt || 3,
            messageDailyLimit: params.find(p => p.code === 'MesajDailyLimit')?.dataInt || 3,
            adWaitSeconds: params.find(p => p.code === 'AdWaitSeconds')?.dataInt || 5,
            uploadVideoSize: params.find(p => p.code === 'UploadVideoSize')?.dataInt || 20,
            uploadPhotoSize: params.find(p => p.code === 'UploadPhotoSize')?.dataInt || 5,
            premiumUploadVideoSize: params.find(p => p.code === 'PremiumUploadVideoSize')?.dataInt || 500,
            premiumUploadPhotoSize: params.find(p => p.code === 'PremiumUploadPhotoSize')?.dataInt || 20,
            photoCountPerPost: params.find(p => p.code === 'PhotoCountPerPost')?.dataInt || 3,
            premiumPhotoCountPerPost: params.find(p => p.code === 'PremiumPhotoCountPerPost')?.dataInt || 10,
        };
    } catch {
        return {
            postDailyLimit: 3,
            messageDailyLimit: 3,
            adWaitSeconds: 5,
            uploadVideoSize: 20,
            uploadPhotoSize: 5,
            premiumUploadVideoSize: 500,
            premiumUploadPhotoSize: 20,
            photoCountPerPost: 3,
            premiumPhotoCountPerPost: 10
        };
    }
}

// 3. Get Active Offers depending on role
export async function getActiveOffers() {
    try {
        const currentTenant = await getCurrentTenant();
        if (!currentTenant) return { tenantOffers: [], userOffers: [] };

        const allActiveOffers = await db.select().from(tenantUserOffers).where(
            eq(tenantUserOffers.isActive, true)
        ).orderBy(tenantUserOffers.price);

        const userOffers = allActiveOffers.filter(o => o.isTenantUserOffer === true);
        const tenantOffers = allActiveOffers.filter(o => o.isTenantOffer === true);

        return {
            tenantOffers: currentTenant.userRole === 'member' ? [] : tenantOffers,
            userOffers: userOffers
        };
    } catch (error) {
        console.error("Error fetching active offers:", error);
        return { tenantOffers: [], userOffers: [] };
    }
}

// 4. Check if current user is Premium
export async function checkIsPremium() {
    try {
        const session = await auth();
        if (session?.user?.isApplicationAdmin) return true;

        const currentTenant = await getCurrentTenant();
        if (!currentTenant) return false;

        const now = new Date();

        // Check for any active purchase covering 'now' for either the user OR the tenant
        // A user is premium if:
        // 1. The tenant they belong to bought a corporate package.
        // 2. The user themselves bought an individual package.

        // Get tenant_users table ID to check individual purchases
        const memberships = await db.query.tenantUsers.findMany({
            where: (tu, { eq, and }) => and(
                eq(tu.userId, currentTenant.userId),
                eq(tu.tenantId, currentTenant.tenantId)
            )
        });

        const tenantUserId = memberships[0]?.id;

        const conditions = [];

        // Check Corporate purchases
        conditions.push(eq(tenantUserOfferPrices.tenantId, currentTenant.tenantId));

        // Check Individual purchases
        if (tenantUserId) {
            conditions.push(eq(tenantUserOfferPrices.tenantUserId, tenantUserId));
        }

        const validPurchases = await db.select().from(tenantUserOfferPrices).where(
            and(
                eq(tenantUserOfferPrices.isActive, true),
                lte(tenantUserOfferPrices.startDate, now),
                gte(tenantUserOfferPrices.endDate, now),
                or(...conditions)
            )
        );

        return validPurchases.length > 0;
    } catch (error) {
        console.error("Error checking premium status:", error);
        return false;
    }
}
