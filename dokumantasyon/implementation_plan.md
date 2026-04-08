# Deployment Plan

## Goal Description
The application will be configured for Apple (iOS), custom domain email sending, and production launch.

## Proposed Changes

### Apple (iOS) Configuration
1. Synchronize the Capacitor project for iOS: `npx cap sync ios`
2. Open the project in Xcode: `npx cap open ios`
3. Configure the **Bundle Identifier** and **Signing & Capabilities** using the user's Apple Developer ID.
4. Set up the camera/photo gallery privacy keys in `Info.plist`.

### Email (Mail) Configuration
1. Since we have a new domain name, we'll need SMTP credentials (e.g., from a provider like Resend, SendGrid, or the domain's cPanel email).
2. Update `.env.local` or `.env.local.cloud` with the new SMTP credentials:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `EMAIL_FROM`
3. Update `lib/email/index.ts` (or equivalent) to utilize the new credentials.

### Production Environment Setup
1. Point `capacitor.config.ts` to the new production URL (instead of local IP).
2. Final builds for Android and iOS pointing to the live server.
3. Hosting the Next.js application on a VPS/Vercel.

## User Actions Needed
- The user must provide the **SMTP credentials** for the new domain (or create an account on Resend/SendGrid).
- The user must log in to **Xcode** with their Apple Developer Account.
