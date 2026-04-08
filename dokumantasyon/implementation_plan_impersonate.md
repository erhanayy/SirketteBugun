# Implementation Plan: App Admin "Add User" Impersonation

## Goal
Allow the Application Admin to easily bootstrap a new Company (Tenant) by seamlessly entering the Company's context and navigating directly to the "Add Employee" (Kullanıcı Ekle) screen, satisfying the manual override flow requirement.

## Proposed Code Changes

1. **Server Action (`lib/actions/superadmin.ts`)**
   - [MODIFY] Add a new server action `impersonateTenantAndAddUser`.
   - This action will forcefully override the `dernekte_tenant_id` authorization cookie to the target Company ID and trigger a hard `redirect('/dashboard/members/new')`.

2. **Admin Tenant Detail Page (`app/dashboard/admin/tenants/[tenantId]/page.tsx`)**
   - [MODIFY] Inject an `<ImpersonateButton>` or direct form containing a "Şirkete Giriş Yap & Çalışan Ekle" button at the top header of the company card.
   - This button will only be rendered for existing companies (`!isNew`) to prevent crashing on uncreated forms.

## Verification Plan
1. Go to `http://localhost:3004/dashboard/admin/tenants`.
2. Click on any existing company (or create a new one).
3. Confirm the presence of the "Şirkete Giriş Yap & Çalışan Ekle" button.
4. Click the button and verify the UI bypasses App Admin logic, successfully adopting the active identity of the selected Company's manager, and lands securely on `/dashboard/members/new`.
