import { z } from "zod";

export const createTenantSchema = z.object({
    shortName: z.string().min(2, "Kısa ad en az 2 karakter olmalıdır"),
    longName: z.string().min(5, "Uzun ad en az 5 karakter olmalıdır"),
});

export const createUserSchema = z.object({
    phoneNumber: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
    fullName: z.string().min(3, "Ad Soyad en az 3 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta adresi giriniz").optional(),
});

export const createPostSchema = z.object({
    title: z.string().min(3, "Başlık en az 3 karakter olmalıdır"),
    content: z.string().min(1, "İçerik boş olamaz"),
    tenantId: z.string().uuid(),
    userId: z.string().uuid(),
    mediaUrl: z.string().optional(),
});

export const createMemberSchema = z.object({
    fullName: z.string().min(3, "Ad Soyad en az 3 karakter olmalıdır"),
    phoneNumber: z.string().min(8, "Geçerli bir telefon numarası giriniz"), // Relaxed for intl
    email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal("")),
    role: z.enum(["admin", "staff", "member"]).default("member"), // Removed manager
    tenantId: z.string().uuid(),
});

export const createEventSchema = z.object({
    title: z.string().min(3, "Başlık en az 3 karakter olmalıdır"),
    tenantId: z.string().uuid(),
    eventDate: z.string().datetime(), // ISO Date string
    capacity: z.number().int().positive().optional(),
    description: z.string().optional(),
});

export const createDueSchema = z.object({
    title: z.string().min(3, "Başlık en az 3 karakter olmalıdır."),
    year: z.coerce.number().min(2020, "Geçerli bir yıl giriniz."),
    amount: z.coerce.number().positive("Tutar 0'dan büyük olmalıdır."),
    ibanId: z.string().optional(),
    tenantId: z.string().uuid(),
});

export const createIbanSchema = z.object({
    name: z.string().min(2, "Tanım en az 2 karakter olmalıdır. (Örn: Merkez Hesap)"),
    bankName: z.string().min(2, "Banka adı en az 2 karakter olmalıdır."),
    ibanNumber: z.string().min(15, "Geçerli bir IBAN numarası giriniz.").max(34, "IBAN çok uzun."),
    accountHolder: z.string().min(3, "Hesap sahibi adı en az 3 karakter olmalıdır."),
    tenantId: z.string().uuid(),
});
