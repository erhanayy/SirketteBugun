"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { db } from "../db";
import { contracts, userContracts, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getCurrentTenant } from "../data/tenant";
import { revalidatePath } from "next/cache";
import { sendEmail, EMAIL_CODES } from "../email";

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const identifier = formData.get('identifier') as string;

        // 1. Sign In (No Redirect)
        await signIn('credentials', { ...Object.fromEntries(formData), redirect: false });

        // Retrieve user to check contracts
        const userRecord = await db.query.users.findFirst({
            where: (users, { eq, or }) => or(
                eq(users.email, identifier),
                eq(users.phoneNumber, identifier)
            )
        });

        if (userRecord) {
            const activeContracts = await db.query.contracts.findMany({
                where: eq(contracts.isActive, true),
            });

            if (activeContracts.length > 0) {
                const signed = await db.query.userContracts.findMany({
                    where: eq(userContracts.userId, userRecord.id),
                });
                const signedIds = signed.map(s => s.contractId);
                const hasPending = activeContracts.some(c => !signedIds.includes(c.id));

                if (hasPending) {
                    redirect("/contracts/approve");
                }
            }
        }

        redirect('/dashboard/home');

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Giriş başarısız. Bilgilerinizi kontrol edin.';
                default:
                    return 'Bir hata oluştu.';
            }
        }
        throw error;
    }
}

export async function logoutAction() {
    await signOut({ redirectTo: "/login" });
}

export async function changePassword(prevState: any, formData: FormData) {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
        return { message: "Yeni şifreler eşleşmiyor.", errors: { confirmPassword: ["Şifreler eşleşmiyor"] } };
    }

    if (newPassword.length < 6) {
        return { message: "Şifre en az 6 karakter olmalıdır." };
    }

    const tenantData = await getCurrentTenant();
    if (!tenantData?.userId) {
        return { message: "Oturum bulunamadı." };
    }

    const userId = tenantData.userId;

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user || !user.password) {
        return { message: "Kullanıcı bulunamadı." };
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordsMatch) {
        return { message: "Mevcut şifre yanlış." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));

    revalidatePath("/dashboard");
    return { message: "Şifre başarıyla güncellendi.", success: true };
}

export async function updateForcedPassword(prevState: any, formData: FormData) {
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) return { message: "Şifreler eşleşmiyor.", success: false };
    if (newPassword.length < 6) return { message: "Şifre en az 6 karakter olmalıdır.", success: false };

    const tenantData = await getCurrentTenant();
    if (!tenantData?.userId) return { message: "Oturum hatası. Lütfen tekrar giriş yapın.", success: false };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users)
        .set({ password: hashedPassword, forcePasswordChange: false })
        .where(eq(users.id, tenantData.userId));

    revalidatePath("/dashboard");
    redirect("/dashboard/home");
}

export async function forgotPassword(prevState: any, formData: FormData) {
    const emailInput = (formData.get("email") as string)?.trim() ||
        (formData.get("identifier") as string)?.trim() || '';

    console.log("[forgotPassword] emailInput:", emailInput);

    if (!emailInput) {
        return { message: "Lütfen e-posta adresinizi girin.", success: false };
    }

    // 1. Find user by email
    const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, emailInput)
    });

    console.log("[forgotPassword] user found:", user ? `id=${user.id}, email=${user.email}` : "NOT FOUND");

    if (user && user.email) {
        // 2. Generate temporary password
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let temporaryPassword = '';
        for (let i = 0; i < 8; i++) {
            temporaryPassword += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // 3. Hash and update DB
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        await db.update(users)
            .set({ password: hashedPassword, forcePasswordChange: true })
            .where(eq(users.id, user.id));

        // 4. Send email
        const result = await sendEmail({
            code: EMAIL_CODES.SIFRE_GONDERIMI,
            sentTo: user.email,
            subject: 'Geçici Şifreniz - DernekteBugün',
            body: `
                <h2>Merhaba ${user.fullName},</h2>
                <p>Şifre sıfırlama talebiniz üzerine geçici şifreniz oluşturuldu.</p>
                <p><strong>Geçici Şifre:</strong> <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-size:16px;">${temporaryPassword}</code></p>
                <p>Lütfen bu şifre ile giriş yapın. Giriş yaptıktan sonra şifrenizi değiştirmeniz istenecektir.</p>
                <br/>
                <p>DernekteBugün Yönetimi</p>
            `,
            screen: 'forgot-password',
        });
        console.log("[forgotPassword] sendEmail result:", JSON.stringify(result));
    }

    // Always return success to prevent user enumeration
    return { message: "Eğer kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.", success: true };
}

