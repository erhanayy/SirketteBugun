import { pgTable, text, timestamp, boolean, uuid, integer, unique, pgEnum, index, jsonb } from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

// Tenants (Şirketler)
export const tenants = pgTable('tenants', {
    id: uuid('id').defaultRandom().primaryKey(),
    shortName: text('short_name').notNull(), // Kisa Ad (Orn: KYD)
    longName: text('long_name').notNull(),   // Uzun Ad (Orn: Kadikoy Yardimlasma Dernegi)
    logoUrl: text('logo_url'),
    websiteUrl: text('website_url'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Users (Kullanıcılar - Global)
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    phoneNumber: text('phone_number').notNull().unique(),
    fullName: text('full_name').notNull(),
    email: text('email'),
    password: text('password'), // Hashed password
    forcePasswordChange: boolean('force_password_change').default(true).notNull(),
    verificationCode: text('verification_code'),
    verificationCodeExpiresAt: timestamp('verification_code_expires_at'),
    isActive: boolean('is_active').default(true).notNull(),
    isApplicationAdmin: boolean('is_application_admin').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tenant Users (Şirket Üyeleri ve Rolleri)
export const tenantUsers = pgTable('tenant_users', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    role: text('role', { enum: ['admin', 'staff'] }).notNull().default('staff'),
    status: text('status', { enum: ['active', 'banned', 'old_member'] }).notNull().default('active'),
    lastSeenAnnouncementsAt: timestamp('last_seen_announcements_at').defaultNow().notNull(),
    lastSeenSpostsAt: timestamp('last_seen_sposts_at').defaultNow().notNull(),
    lastSeenEventsAt: timestamp('last_seen_events_at').defaultNow().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('tenant_users_tenant_idx').on(t.tenantId),
    userIdx: index('tenant_users_user_idx').on(t.userId),
}));

// Posts (Gönderiler)
export const posts = pgTable('posts', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    title: text('title').default('Adsız Duyuru').notNull(), // Added Default to avoid migration prompt
    content: text('content').notNull(),
    mediaUrl: text('media_url'),
    isPinned: boolean('is_pinned').default(false).notNull(),
    pinnedUntil: timestamp('pinned_until'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('posts_tenant_idx').on(t.tenantId),
    createdIdx: index('posts_created_idx').on(t.createdAt),
}));

// Comments (Yorumlar)
export const comments = pgTable('comments', {
    id: uuid('id').defaultRandom().primaryKey(),
    postId: uuid('post_id').references(() => posts.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Social Posts (Ana Sayfa Gönderileri) ---

export const sposts = pgTable('sposts', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('sposts_tenant_idx').on(t.tenantId),
    createdIdx: index('sposts_created_idx').on(t.createdAt),
}));

export const spostMedia = pgTable('spost_media', {
    id: uuid('id').defaultRandom().primaryKey(),
    spostId: uuid('spost_id').references(() => sposts.id).notNull(),
    url: text('url').notNull(),
    type: text('type', { enum: ['image', 'video', 'document'] }).notNull(),
});

export const spostComments = pgTable('spost_comments', {
    id: uuid('id').defaultRandom().primaryKey(),
    spostId: uuid('spost_id').references(() => sposts.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const spostReactions = pgTable('spost_reactions', {
    spostId: uuid('spost_id').references(() => sposts.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    emoji: text('emoji').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    unq: unique().on(t.spostId, t.userId), // Her kullanıcı bir posta sadece 1 yorum bırakabilir mantığı (istiyorsanız) veya sadece 1 tip reaksiyon.
}));

// System Parameters (Sistem Ayarları)
export const parameters = pgTable('parameters', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull().unique(),
    dataInt: integer('data_int'),
    dataStr: text('data_str'),
});

// Email Log (Email Gönderim Kayıtları)
export const emailLogs = pgTable('email_log', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),              // Email türü: 'sifre_gonderimi', 'davet', vb.
    sentTo: text('sent_to').notNull(),         // Alıcı email adresi
    sender: text('sender').notNull(),          // Gönderici email adresi
    subject: text('subject'),                  // Email konusu
    screen: text('screen'),                    // Hangi ekrandan tetiklendi
    status: text('status').notNull().default('logged'),  // 'logged' | 'sent' | 'failed'
    errorMessage: text('error_message'),       // Hata mesajı (varsa)
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Business Cards (Kartvizitler)
export const businessCards = pgTable('business_cards', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    companyName: text('company_name').notNull(),
    workStatus: text('work_status', { enum: ['owner', 'employee'] }).notNull(),
    title: text('title').notNull(),
    educationDoctorate: text('education_doctorate'),
    educationMaster: text('education_master'),
    educationBachelor: text('education_bachelor'),
    educationHighSchool: text('education_high_school'),
    birthDate: timestamp('birth_date'),
    phone: text('phone').notNull(),
    email: text('email').notNull(),
    profilePhotoUrl: text('profile_photo_url'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: unique().on(t.tenantId, t.userId), // 1 User per Tenant can only have 1 Business Card
}));

// Event Participant Status Enum
export const eventParticipantStatusEnum = pgEnum('event_participant_status', ['confirmed', 'pending_payment', 'cancelled', 'attended']);

// Events (Etkinlikler)
export const events = pgTable('events', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    rules: text('rules').default('').notNull(), // Katılım Kuralları
    location: text('location'),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'),
    lcvDeadline: timestamp('lcv_deadline').notNull(), // LCV Son Tarihi

    isPaid: boolean('is_paid').default(false).notNull(),
    price: integer('price'), // Stored as cents or smallest unit
    ibanId: uuid('iban_id').references(() => ibans.id),

    quota: integer('quota'), // Null = Unlimited

    coverImageUrl: text('cover_image_url'),
    attachments: text('attachments'), // JSON string or simple text for now (users wanted N docs)

    isPublished: boolean('is_published').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Event Participants (Katılımcılar)
export const eventParticipants = pgTable('event_participants', {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id').references(() => events.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    status: eventParticipantStatusEnum('status').default('confirmed').notNull(),
    guestCount: integer('guest_count').default(0).notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
}, (t) => ({
    unq: unique().on(t.eventId, t.userId),
}));

// IBANs (Banka Hesapları)
export const ibans = pgTable('ibans', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: text('name').notNull(), // Kisa tanim (Orn: Merkez Hesap)
    bankName: text('bank_name').notNull(),
    ibanNumber: text('iban_number').notNull(),
    accountHolder: text('account_holder').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('ibans_tenant_idx').on(t.tenantId),
}));


// Chats (Sohbet Odaları)
export const chats = pgTable('chats', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: text('name'), // Optional for DMs, required for Groups
    description: text('description'), // Group description
    imageUrl: text('image_url'), // Group icon
    createdBy: uuid('created_by').references(() => users.id), // Creator of the group
    isPublic: boolean('is_public').default(false).notNull(), // true = Channel, false = Private Room/DM/Group
    isLocked: boolean('is_locked').default(false).notNull(), // true = Only admins can send messages
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('chats_tenant_idx').on(t.tenantId),
}));

// Chat Participants (Sohbet Katılımcıları)
export const chatParticipants = pgTable('chat_participants', {
    id: uuid('id').defaultRandom().primaryKey(),
    chatId: uuid('chat_id').references(() => chats.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    lastReadAt: timestamp('last_read_at').defaultNow().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
}, (t) => ({
    unq: unique().on(t.chatId, t.userId),
}));

// Chat Messages (Mesajlar)
export const messages = pgTable('messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    chatId: uuid('chat_id').references(() => chats.id).notNull(),
    senderId: uuid('sender_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    isActive: boolean('is_active').default(true).notNull(), // Soft delete for "Message Deleted"
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    chatIdx: index('messages_chat_idx').on(t.chatId),
    createdIdx: index('messages_created_idx').on(t.createdAt),
}));

// Message Reactions (Mesaj Beğenileri)
export const messageReactions = pgTable('message_reactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    messageId: uuid('message_id').references(() => messages.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    emoji: text('emoji').default('👍').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    unq: unique().on(t.messageId, t.userId), // One reaction per user per message (simple version)
}));

// Post Attachments (Duyuru Dosyaları)
export const postAttachments = pgTable('post_attachments', {
    id: uuid('id').defaultRandom().primaryKey(),
    postId: uuid('post_id').references(() => posts.id).notNull(),
    fileName: text('file_name').notNull(),
    fileUrl: text('file_url').notNull(),
    fileType: text('file_type').notNull(), // 'image', 'pdf', etc.
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Notifications & Web Push ---

export const notifications = pgTable('notifications', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    type: text('type', { enum: ['post', 'event', 'announcement', 'message', 'project_task'] }).notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    actionUrl: text('action_url'),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('notifications_tenant_idx').on(t.tenantId),
    userIdx: index('notifications_user_idx').on(t.userId),
    createdIdx: index('notifications_created_idx').on(t.createdAt),
}));

export const userNotificationSettings = pgTable('user_notification_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    notifyPost: boolean('notify_post').default(true).notNull(),
    notifyEvent: boolean('notify_event').default(true).notNull(),
    notifyAnnouncement: boolean('notify_announcement').default(true).notNull(),
    notifyMessage: boolean('notify_message').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unq: unique().on(t.tenantId, t.userId),
}));

export const pushSubscriptions = pgTable('push_subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Organizational Structure (Organizasyon Yapısı) ---

// Committees & Boards (Kurullar: Yönetim Kurulu, İcra Kurulu vb.)
export const committees = pgTable('committees', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    parentCommitteeId: uuid('parent_committee_id').references((): AnyPgColumn => committees.id), // Nullable self-ref FK for tree hierarchy
    name: text('name').notNull(), // Örn: Yönetim Kurulu, Teknoloji İcra Kurulu
    type: text('type', { enum: ['management_board', 'executive_committee', 'sub_committee', 'other'] }).default('executive_committee').notNull(),
    purpose: text('purpose'), // Kurulun amacı
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Committee Members (Kurul Üyeleri)
export const committeeMembers = pgTable('committee_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    committeeId: uuid('committee_id').references(() => committees.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    title: text('title').notNull(), // Örn: Başkan, Genel Sekreter, Üye
    role: text('role', { enum: ['president', 'vice_president', 'secretary', 'member'] }).default('member').notNull(), // Sistemdeki rolü
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
}, (t) => ({
    // Bir kişi aynı kurulda birden fazla kez bulunamaz (Aynı kişi birden fazla FARKLI kurulda olabilir)
    unq: unique().on(t.committeeId, t.userId),
}));


// --- Projects & Tasks (Projeler ve Görevler) ---

// Projects (Projeler)
export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    committeeId: uuid('committee_id').references(() => committees.id), // Hangi kurula bağlı (Opsiyonel olabilir ama genelde bağlıdır)
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: ['planned', 'active', 'completed', 'on_hold', 'cancelled'] }).default('planned').notNull(),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    managerId: uuid('manager_id').references(() => users.id), // Proje Sorumlusu
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Project Tasks (Proje Altındaki Görevler)
export const projectTasks = pgTable('project_tasks', {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    task: text('task').notNull(),
    taskStatus: text('task_status', { enum: ['planned', 'in_progress', 'completed', 'cancelled'] }).default('planned').notNull(),
    expectedEndDate: timestamp('expected_end_date'),
    endDate: timestamp('end_date'),
    taskOwnerId: uuid('task_owner_id').references(() => users.id), // Opsiyonel, kime atandigi
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Executive Tasks (Yönetim Kurulu Görevleri)
export const executiveTasks = pgTable('executive_tasks', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    projectId: uuid('project_id').references(() => projects.id), // Opsiyonel, bir projeye bağlı olabilir
    title: text('title').notNull(),
    description: text('description'),
    assignedToId: uuid('assigned_to_id').references(() => users.id), // Kime atandı
    assignedById: uuid('assigned_by_id').references(() => users.id), // Kim atadı
    status: text('status', { enum: ['todo', 'in_progress', 'review', 'done'] }).default('todo').notNull(),
    priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium').notNull(),
    dueDate: timestamp('due_date'),
    completedAt: timestamp('completed_at'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Premium & Subscriptions (Abonelikler ve Paketler) ---

export const tenantUserOffers = pgTable('tenant_user_offer', {
    id: uuid('id').defaultRandom().primaryKey(),
    isTenantOffer: boolean('is_tenant_offer').default(false),
    isTenantUserOffer: boolean('is_tenant_user_offer').default(false),
    year: integer('year').notNull(),
    price: integer('price').notNull(), // We can use either decimal or integer (e.g., storing whole currency values or cents). Based on DB being DECIMAL(10,2), let's map it as integer in TS or use decimal type if needed. Typically we map decimal to text in Drizzle PG, or numeric. Using numeric.
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

export const tenantUserOfferPrices = pgTable('tenant_user_offer_price', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'set null' }),
    tenantUserId: uuid('tenant_user_id').references(() => tenantUsers.id, { onDelete: 'set null' }),
    tenantOfferId: uuid('tenant_offer_id').references(() => tenantUserOffers.id, { onDelete: 'restrict' }).notNull(),
    pricePaid: integer('price_paid').notNull(), // Matching the numeric style
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

// login_logs (Sisteme Giriş Kayıtları)
export const loginLogs = pgTable('login_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    loggedInAt: timestamp('logged_in_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('login_logs_tenant_idx').on(t.tenantId),
    userTimeIdx: index('login_logs_user_time_idx').on(t.userId, t.loggedInAt),
}));

// reminders (Hatırlatmalar)
export const reminders = pgTable('reminders', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    creatorId: uuid('creator_id').references(() => users.id).notNull(), // Kim oluşturdu
    assigneeId: uuid('assignee_id').references(() => users.id).notNull(), // Kime atandı

    title: text('title').notNull(),
    description: text('description'), // Opsiyonel ek not

    dueDate: timestamp('due_date').notNull(), // Hatırlatma tarihi/saati

    isRecurring: boolean('is_recurring').default(false).notNull(),
    recurringPattern: text('recurring_pattern'), // Örn: 'daily', 'weekly', 'monthly', 'yearly'

    status: text('status', { enum: ['pending', 'completed', 'cancelled'] }).default('pending').notNull(),
    completedAt: timestamp('completed_at'),

    isNotified: boolean('is_notified').default(false).notNull(), // Bildirimleri gönderildi mi?

    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('reminders_tenant_idx').on(t.tenantId),
    assigneeIdx: index('reminders_assignee_idx').on(t.assigneeId),
    statusIdx: index('reminders_status_idx').on(t.status),
}));

// Notes (Post-it Notlar)
export const notes = pgTable('notes', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    title: text('title'),
    content: text('content').notNull(),
    color: text('color').default('yellow').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('notes_tenant_idx').on(t.tenantId),
    userIdx: index('notes_user_idx').on(t.userId),
}));

// Mini Approval Flow (Basit Onay Akışı)
export const approvalFlows = pgTable('approval_flows', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: text('name').notNull(),
    approvalLevel: integer('approval_level').default(1).notNull(), // 0 = En üst (Top), N = N. seviyeye kadar
    fields: jsonb('fields').default([]).notNull(), // Dinamik alan (Array)
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('approval_flows_tenant_idx').on(t.tenantId),
}));

export const approvalRequests = pgTable('approval_requests', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    flowId: uuid('flow_id').references(() => approvalFlows.id).notNull(),
    requesterId: uuid('requester_id').references(() => users.id).notNull(),
    currentApproverId: uuid('current_approver_id').references(() => users.id),

    status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending').notNull(),
    fieldData: jsonb('field_data').default({}).notNull(),
    attachmentUrl: text('attachment_url'),
    currentLevel: integer('current_level').default(1).notNull(),

    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    tenantIdx: index('approval_req_tenant_idx').on(t.tenantId),
    requesterIdx: index('approval_req_req_idx').on(t.requesterId),
    approverIdx: index('approval_req_appr_idx').on(t.currentApproverId),
}));

// tenant_personalization (Şirket Kişiselleştirme - Renkler vb.)
export const tenantPersonalization = pgTable('tenant_personalization', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull().unique(),
    menuTextColor: text('menu_text_color').default('#FFFFFF'),
    screenTextColor: text('screen_text_color').default('#1F2937'),
    backgroundColor: text('background_color').default('#FFFFFF'),
    headerRow1Color: text('header_row1_color').default('#1E3A5F'),
    headerRow2Color: text('header_row2_color').default('#2563EB'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Relations ---
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many, one }) => ({
    tenantUsers: many(tenantUsers),
    committeeMemberships: many(committeeMembers),
    assignedProjects: many(projects, { relationName: 'projectManager' }),
    assignedTasks: many(executiveTasks, { relationName: 'taskAssignee' }),
    createdTasks: many(executiveTasks, { relationName: 'taskCreator' }),
    businessCard: one(businessCards),
    notifications: many(notifications),
    notificationSettings: many(userNotificationSettings),
    pushSubscriptions: many(pushSubscriptions),
    createdReminders: many(reminders, { relationName: 'reminderCreator' }),
    assignedReminders: many(reminders, { relationName: 'reminderAssignee' }),
    notes: many(notes),
    approvalRequests: many(approvalRequests, { relationName: 'approvalRequester' }),
    pendingApprovals: many(approvalRequests, { relationName: 'approvalCurrentApprover' }),
}));

export const tenantUsersRelations = relations(tenantUsers, ({ one }) => ({
    user: one(users, {
        fields: [tenantUsers.userId],
        references: [users.id],
    }),
    tenant: one(tenants, {
        fields: [tenantUsers.tenantId],
        references: [tenants.id],
    }),
}));

export const businessCardsRelations = relations(businessCards, ({ one }) => ({
    tenant: one(tenants, {
        fields: [businessCards.tenantId],
        references: [tenants.id],
    }),
    user: one(users, {
        fields: [businessCards.userId],
        references: [users.id],
    }),
}));

export const committeesRelations = relations(committees, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [committees.tenantId],
        references: [tenants.id],
    }),
    members: many(committeeMembers),
    projects: many(projects),
}));

export const committeeMembersRelations = relations(committeeMembers, ({ one }) => ({
    committee: one(committees, {
        fields: [committeeMembers.committeeId],
        references: [committees.id],
    }),
    user: one(users, {
        fields: [committeeMembers.userId],
        references: [users.id],
    }),
}));


export const projectsRelations = relations(projects, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [projects.tenantId],
        references: [tenants.id],
    }),
    committee: one(committees, {
        fields: [projects.committeeId],
        references: [committees.id],
    }),
    manager: one(users, {
        fields: [projects.managerId],
        references: [users.id],
        relationName: 'projectManager',
    }),
    executiveTasks: many(executiveTasks),
    projectTasks: many(projectTasks),
}));

export const executiveTasksRelations = relations(executiveTasks, ({ one }) => ({
    tenant: one(tenants, {
        fields: [executiveTasks.tenantId],
        references: [tenants.id],
    }),
    project: one(projects, {
        fields: [executiveTasks.projectId],
        references: [projects.id],
    }),
    assignedTo: one(users, {
        fields: [executiveTasks.assignedToId],
        references: [users.id],
        relationName: 'taskAssignee',
    }),
    assignedBy: one(users, {
        fields: [executiveTasks.assignedById],
        references: [users.id],
        relationName: 'taskCreator',
    }),
}));

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
    project: one(projects, {
        fields: [projectTasks.projectId],
        references: [projects.id],
    }),
    taskOwner: one(users, {
        fields: [projectTasks.taskOwnerId],
        references: [users.id],
        relationName: 'projectTaskOwner',
    }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [chats.tenantId],
        references: [tenants.id],
    }),
    creator: one(users, {
        fields: [chats.createdBy],
        references: [users.id],
    }),
    participants: many(chatParticipants),
    messages: many(messages),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
    chat: one(chats, {
        fields: [chatParticipants.chatId],
        references: [chats.id],
    }),
    user: one(users, {
        fields: [chatParticipants.userId],
        references: [users.id],
    }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
    chat: one(chats, {
        fields: [messages.chatId],
        references: [chats.id],
    }),
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
    }),
    reactions: many(messageReactions),
}));

export const messageReactionsRelations = relations(messageReactions, ({ one }) => ({
    message: one(messages, {
        fields: [messageReactions.messageId],
        references: [messages.id],
    }),
    user: one(users, {
        fields: [messageReactions.userId],
        references: [users.id],
    }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
    attachments: many(postAttachments),
}));

export const postAttachmentsRelations = relations(postAttachments, ({ one }) => ({
    post: one(posts, {
        fields: [postAttachments.postId],
        references: [posts.id],
    }),
}));

export const spostsRelations = relations(sposts, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [sposts.tenantId],
        references: [tenants.id],
    }),
    user: one(users, {
        fields: [sposts.userId],
        references: [users.id],
    }),
    media: many(spostMedia),
    comments: many(spostComments),
    reactions: many(spostReactions),
}));

export const spostMediaRelations = relations(spostMedia, ({ one }) => ({
    spost: one(sposts, {
        fields: [spostMedia.spostId],
        references: [sposts.id],
    }),
}));

export const spostCommentsRelations = relations(spostComments, ({ one }) => ({
    spost: one(sposts, {
        fields: [spostComments.spostId],
        references: [sposts.id],
    }),
    user: one(users, {
        fields: [spostComments.userId],
        references: [users.id],
    }),
}));

export const spostReactionsRelations = relations(spostReactions, ({ one }) => ({
    spost: one(sposts, {
        fields: [spostReactions.spostId],
        references: [sposts.id],
    }),
    user: one(users, {
        fields: [spostReactions.userId],
        references: [users.id],
    }),
}));

// --- Contracts & Agreements ---

export const contractTypeEnum = pgEnum('contract_type', ['KVKK', 'USER_AGREEMENT', 'ASSOCIATION_AGREEMENT']);

export const contracts = pgTable('contracts', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: contractTypeEnum('type').notNull(),
    version: text('version').notNull(), // e.g. "1.0", "2024-02-19"
    title: text('title').notNull(),
    content: text('content').notNull(), // HTML or Markdown
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userContracts = pgTable('user_contracts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    contractId: uuid('contract_id').references(() => contracts.id).notNull(),
    acceptedAt: timestamp('accepted_at').defaultNow().notNull(),
});

export const contractsRelations = relations(contracts, ({ many }) => ({
    acceptances: many(userContracts),
}));

export const userContractsRelations = relations(userContracts, ({ one }) => ({
    user: one(users, {
        fields: [userContracts.userId],
        references: [users.id],
    }),
    contract: one(contracts, {
        fields: [userContracts.contractId],
        references: [contracts.id],
    }),
}));

// Events Relations
export const eventsRelations = relations(events, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [events.tenantId],
        references: [tenants.id],
    }),
    iban: one(ibans, {
        fields: [events.ibanId],
        references: [ibans.id],
    }),
    participants: many(eventParticipants),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
    event: one(events, {
        fields: [eventParticipants.eventId],
        references: [events.id],
    }),
    user: one(users, {
        fields: [eventParticipants.userId],
        references: [users.id],
    }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    tenant: one(tenants, {
        fields: [notifications.tenantId],
        references: [tenants.id],
    }),
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

export const userNotificationSettingsRelations = relations(userNotificationSettings, ({ one }) => ({
    tenant: one(tenants, {
        fields: [userNotificationSettings.tenantId],
        references: [tenants.id],
    }),
    user: one(users, {
        fields: [userNotificationSettings.userId],
        references: [users.id],
    }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
    user: one(users, {
        fields: [pushSubscriptions.userId],
        references: [users.id],
    }),
}));

export const tenantUserOffersRelations = relations(tenantUserOffers, ({ many }) => ({
    purchases: many(tenantUserOfferPrices),
}));

export const tenantUserOfferPricesRelations = relations(tenantUserOfferPrices, ({ one }) => ({
    tenant: one(tenants, {
        fields: [tenantUserOfferPrices.tenantId],
        references: [tenants.id],
    }),
    tenantUser: one(tenantUsers, {
        fields: [tenantUserOfferPrices.tenantUserId],
        references: [tenantUsers.id],
    }),
    offer: one(tenantUserOffers, {
        fields: [tenantUserOfferPrices.tenantOfferId],
        references: [tenantUserOffers.id],
    }),
}));

export const loginLogsRelations = relations(loginLogs, ({ one }) => ({
    tenant: one(tenants, {
        fields: [loginLogs.tenantId],
        references: [tenants.id],
    }),
    user: one(users, {
        fields: [loginLogs.userId],
        references: [users.id],
    }),
}));

export const tenantPersonalizationRelations = relations(tenantPersonalization, ({ one }) => ({
    tenant: one(tenants, {
        fields: [tenantPersonalization.tenantId],
        references: [tenants.id],
    }),
}));

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
    users: many(tenantUsers),
    personalization: one(tenantPersonalization),
    loginLogs: many(loginLogs),
    reminders: many(reminders),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
    tenant: one(tenants, {
        fields: [reminders.tenantId],
        references: [tenants.id],
    }),
    creator: one(users, {
        fields: [reminders.creatorId],
        references: [users.id],
        relationName: 'reminderCreator',
    }),
    assignee: one(users, {
        fields: [reminders.assigneeId],
        references: [users.id],
        relationName: 'reminderAssignee',
    }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
    tenant: one(tenants, {
        fields: [notes.tenantId],
        references: [tenants.id],
    }),
    user: one(users, {
        fields: [notes.userId],
        references: [users.id],
    }),
}));

export const approvalFlowsRelations = relations(approvalFlows, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [approvalFlows.tenantId],
        references: [tenants.id],
    }),
    requests: many(approvalRequests),
}));

export const approvalRequestsRelations = relations(approvalRequests, ({ one }) => ({
    tenant: one(tenants, {
        fields: [approvalRequests.tenantId],
        references: [tenants.id],
    }),
    flow: one(approvalFlows, {
        fields: [approvalRequests.flowId],
        references: [approvalFlows.id],
    }),
    requester: one(users, {
        fields: [approvalRequests.requesterId],
        references: [users.id],
        relationName: 'approvalRequester',
    }),
    currentApprover: one(users, {
        fields: [approvalRequests.currentApproverId],
        references: [users.id],
        relationName: 'approvalCurrentApprover',
    }),
}));

