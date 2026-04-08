import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailLogs } from "@/lib/db/schema";
import { Resend } from "resend";

// POST /api/send-email
export async function POST(req: NextRequest) {
    // ------- Token Auth -------
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.EMAIL_API_TOKEN;

    if (!expectedToken) {
        return NextResponse.json(
            { error: "Server misconfigured: EMAIL_API_TOKEN not set." },
            { status: 500 }
        );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ------- Request Body -------
    let payload: { code: string; sentTo: string; subject: string; body?: string; screen?: string };
    try {
        payload = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { code, sentTo, subject, body, screen } = payload;

    if (!code || !sentTo || !subject) {
        return NextResponse.json(
            { error: "code, sentTo ve subject alanları zorunludur." },
            { status: 400 }
        );
    }

    // E-posta format doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sentTo)) {
        return NextResponse.json({ error: "Geçersiz e-posta adresi." }, { status: 400 });
    }

    // Sender: onboarding@resend.dev geçici, domain hazırda info@sirkettebugun.com
    const sender = process.env.EMAIL_SENDER || "onboarding@resend.dev";

    // ------- Resend ile Gönder -------
    let logStatus = "sent";
    let errorMessage: string | undefined;

    const resendApiKey = process.env.RESEND_API_KEY;

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
                logStatus = "failed";
                errorMessage = resendError.message;
                console.error("[send-email] Resend error:", resendError);
            }
        } catch (err: any) {
            logStatus = "failed";
            errorMessage = err.message || String(err);
            console.error("[send-email] Resend exception:", err);
        }
    } else {
        // RESEND_API_KEY ayarlanmamışsa sadece DB'ye logla
        logStatus = "logged";
        console.warn("[send-email] RESEND_API_KEY not set, only logging to DB.");
    }

    // ------- DB'ye Log At -------
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
    } catch (dbErr: any) {
        console.error("[send-email] DB log error:", dbErr);
        return NextResponse.json(
            { error: "Email log kaydedilemedi.", detail: dbErr.message },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: logStatus !== "failed",
        status: logStatus,
        message: logStatus === "sent"
            ? "E-posta başarıyla gönderildi ve loglandı."
            : logStatus === "logged"
                ? "E-posta loglandı (RESEND_API_KEY ayarlanmamış)."
                : "E-posta gönderilemedi, hata loglandı.",
    });
}
