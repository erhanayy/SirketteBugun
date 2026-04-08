'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function switchTenant(tenantId: string) {
    const cookieStore = await cookies();
    cookieStore.set('dernekte_tenant_id', tenantId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: 'lax'
    });

    // Redirect to dashboard to refresh context
    redirect('/dashboard/home');
}

export async function createTenant(formData: FormData) {
    const shortName = formData.get("shortName") as string;
    const longName = formData.get("longName") as string;
    // Mock implementation to satisfy build
    console.log("Tenant creation requested:", shortName, longName);
    redirect('/dashboard/home');
}
