# Production Release Plan

- [ ] **Phase 1: iOS (Apple) Setup & Testing**
  - [ ] App Store Connect & Apple Developer account preparation.
  - [ ] Capacitor iOS syncing (`npx cap sync ios`).
  - [ ] Xcode setup (Signing & Capabilities, App Icons, Splash Screens).
  - [ ] TestFlight or Simulator testing.

- [x] **Phase 2: Email Configuration (Custom Domain)**
  - [x] Configure `nodemailer` or `resend` for the new domain name.
  - [x] Set up DNS records (SPF, DKIM, DMARC) for the new domain.
  - [x] Test password reset & welcome emails.

- [x] **Phase 3: Production Deployment**
  - [x] Update `capacitor.config.ts` to point to the production server URL.
  - [x] Deploy Next.js to production server (Vercel / VPS / Google Cloud Run).
  - [x] Generate final Android AAB and iOS IPA for App Store & Google Play.

- [ ] **Phase 4: Database Cost Optimization**
  - [x] Create fallback data migration scripts.
  - [x] Provision new Cloud SQL micro instance (Waiting for GCP).
  - [x] Restore data to new database.
  - [ ] Update Cloud Run & local `.env` with new connection string.
