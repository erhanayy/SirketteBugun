'use server';

import { auth, signOut } from '@/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function changePassword(
    prevState: { success?: boolean; error?: string } | undefined,
    formData: FormData,
) {
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
        return { error: 'Şifreler eşleşmiyor.' };
    }

    if (newPassword.length < 4) {
        return { error: 'Şifre en az 4 karakter olmalıdır.' };
    }

    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Oturum bulunamadı.' };
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.update(users)
            .set({
                password: hashedPassword,
                forcePasswordChange: false
            })
            .where(eq(users.id, session.user.id));

        return { success: true };
    } catch (error) {
        console.error('Password update failed:', error);
        return { error: 'Veritabanı hatası oluştu.' };
    } finally {
        // If successful, we want to redirect. 
        // Need to handle this carefully with useActionState vs direct redirect.
        // Or simply let the client handle it if success is true.
        // But server actions redirect is cleaner.
        // Wait, if I redirect here, the client sees a redirect navigation.
    }
}
