// Email utility - direkt DB log + Resend gönderimi

import { db } from '@/lib/db';
import { emailLogs } from '@/lib/db/schema';
import { Resend } from 'resend';

export const EMAIL_CODES = {
    SIFRE_GONDERIMI: 'sifre_gonderimi',
    DAVET: 'uye_davet',
    BILDIRIM: 'bildirim',
} as const;

export interface SendEmailOptions {
    code: string;
    sentTo: string;
    subject: string;
    body?: string;
    screen?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
    const { code, sentTo, subject, body, screen } = options;

    const sender = process.env.EMAIL_SENDER || 'onboarding@resend.dev';
    const resendApiKey = process.env.RESEND_API_KEY;

    let logStatus = 'logged';
    let errorMessage: string | undefined;

    // --- Resend ile gönder ---
    if (resendApiKey) {
        try {
            const resend = new Resend(resendApiKey);
            const { error: resendError } = await resend.emails.send({
                from: sender,
                to: [sentTo],
                subject,
                html: body || `<p>${subject}</p>`,
            });

            if (resendError) {
                logStatus = 'failed';
                errorMessage = resendError.message;
                console.error('[sendEmail] Resend error:', resendError);
            } else {
                logStatus = 'sent';
            }
        } catch (err: any) {
            logStatus = 'failed';
            errorMessage = err.message || String(err);
            console.error('[sendEmail] Resend exception:', err);
        }
    } else {
        console.warn('[sendEmail] RESEND_API_KEY not set, only logging to DB.');
    }

    // --- DB'ye log at ---
    try {
        await db.insert(emailLogs).values({
            code,
            sentTo,
            sender,
            subject,
            screen: screen ?? null,
            status: logStatus,
            errorMessage: errorMessage ?? null,
        });
        console.log(`[sendEmail] Logged: ${code} → ${sentTo} (${logStatus})`);
    } catch (dbErr: any) {
        console.error('[sendEmail] DB log error:', dbErr);
        return { success: false, error: dbErr.message };
    }

    return { success: logStatus !== 'failed', error: errorMessage };
}
