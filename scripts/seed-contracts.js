"use strict";
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// scripts/seed-contracts.ts
var import_config = require("dotenv/config");

// lib/db/index.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = require("pg");

// lib/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chatParticipants: () => chatParticipants,
  chatParticipantsRelations: () => chatParticipantsRelations,
  chats: () => chats,
  chatsRelations: () => chatsRelations,
  comments: () => comments,
  committeeMembers: () => committeeMembers,
  committeeMembersRelations: () => committeeMembersRelations,
  committees: () => committees,
  committeesRelations: () => committeesRelations,
  contractTypeEnum: () => contractTypeEnum,
  contracts: () => contracts,
  contractsRelations: () => contractsRelations,
  duePayments: () => duePayments,
  duePaymentsRelations: () => duePaymentsRelations,
  dues: () => dues,
  duesRelations: () => duesRelations,
  eventParticipants: () => eventParticipants,
  events: () => events,
  executiveTasks: () => executiveTasks,
  executiveTasksRelations: () => executiveTasksRelations,
  ibans: () => ibans,
  ibansRelations: () => ibansRelations,
  messageReactions: () => messageReactions,
  messageReactionsRelations: () => messageReactionsRelations,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  postAttachments: () => postAttachments,
  postAttachmentsRelations: () => postAttachmentsRelations,
  posts: () => posts,
  postsRelations: () => postsRelations,
  projects: () => projects,
  projectsRelations: () => projectsRelations,
  tenantUsers: () => tenantUsers,
  tenantUsersRelations: () => tenantUsersRelations,
  tenants: () => tenants,
  userContracts: () => userContracts,
  userContractsRelations: () => userContractsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_orm = require("drizzle-orm");
var tenants = (0, import_pg_core.pgTable)("tenants", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  shortName: (0, import_pg_core.text)("short_name").notNull(),
  // Kisa Ad (Orn: KYD)
  longName: (0, import_pg_core.text)("long_name").notNull(),
  // Uzun Ad (Orn: Kadikoy Yardimlasma Dernegi)
  logoUrl: (0, import_pg_core.text)("logo_url"),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  phoneNumber: (0, import_pg_core.text)("phone_number").notNull().unique(),
  fullName: (0, import_pg_core.text)("full_name").notNull(),
  email: (0, import_pg_core.text)("email"),
  password: (0, import_pg_core.text)("password"),
  // Hashed password
  forcePasswordChange: (0, import_pg_core.boolean)("force_password_change").default(true).notNull(),
  verificationCode: (0, import_pg_core.text)("verification_code"),
  verificationCodeExpiresAt: (0, import_pg_core.timestamp)("verification_code_expires_at"),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var tenantUsers = (0, import_pg_core.pgTable)("tenant_users", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  tenantId: (0, import_pg_core.uuid)("tenant_id").references(() => tenants.id).notNull(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id).notNull(),
  role: (0, import_pg_core.text)("role", { enum: ["admin", "manager", "staff", "member"] }).notNull().default("member"),
  status: (0, import_pg_core.text)("status", { enum: ["active", "banned", "old_member"] }).notNull().default("active"),
  lastSeenAnnouncementsAt: (0, import_pg_core.timestamp)("last_seen_announcements_at").defaultNow().notNull(),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var posts = (0, import_pg_core.pgTable)("posts", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  tenantId: (0, import_pg_core.uuid)("tenant_id").references(() => tenants.id).notNull(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id).notNull(),
  title: (0, import_pg_core.text)("title").default("Ads\u0131z Duyuru").notNull(),
  // Added Default to avoid migration prompt
  content: (0, import_pg_core.text)("content").notNull(),
  mediaUrl: (0, import_pg_core.text)("media_url"),
  isPinned: (0, import_pg_core.boolean)("is_pinned").default(false).notNull(),
  pinnedUntil: (0, import_pg_core.timestamp)("pinned_until"),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var comments = (0, import_pg_core.pgTable)("comments", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  postId: (0, import_pg_core.uuid)("post_id").references(() => posts.id).notNull(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id).notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var events = (0, import_pg_core.pgTable)("events", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  tenantId: (0, import_pg_core.uuid)("tenant_id").references(() => tenants.id).notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description"),
  eventDate: (0, import_pg_core.timestamp)("event_date").notNull(),
  capacity: (0, import_pg_core.integer)("capacity"),
  ibanId: (0, import_pg_core.text)("iban_id"),
  // Assuming IBAN is stored as text or ID reference, using text for simplicity/flexibility
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var eventParticipants = (0, import_pg_core.pgTable)("event_participants", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  eventId: (0, import_pg_core.uuid)("event_id").references(() => events.id).notNull(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id).notNull(),
  paymentStatus: (0, import_pg_core.text)("payment_status", { enum: ["pending", "paid"] }).default("pending").notNull(),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var ibans = (0, import_pg_core.pgTable)("ibans", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  tenantId: (0, import_pg_core.uuid)("tenant_id").references(() => tenants.id).notNull(),
  name: (0, import_pg_core.text)("name").notNull(),
  // Kisa tanim (Orn: Merkez Hesap)
  bankName: (0, import_pg_core.text)("bank_name").notNull(),
  ibanNumber: (0, import_pg_core.text)("iban_number").notNull(),
  accountHolder: (0, import_pg_core.text)("account_holder").notNull(),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var dues = (0, import_pg_core.pgTable)("dues", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  tenantId: (0, import_pg_core.uuid)("tenant_id").references(() => tenants.id).notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  // Added Title
  year: (0, import_pg_core.integer)("year").notNull(),
  amount: (0, import_pg_core.integer)("amount").notNull(),
  // Amount in smallest currency unit (e.g. cents) or just integer
  ibanId: (0, import_pg_core.uuid)("iban_id").references(() => ibans.id),
  // Link to IBAN table
  targetManagers: (0, import_pg_core.boolean)("is_enabled_for_tenants_manager").default(false).notNull(),
  targetStaff: (0, import_pg_core.boolean)("is_enabled_for_tenants_worker").default(false).notNull(),
  targetMembers: (0, import_pg_core.boolean)("is_enabled_for_tenants_members").default(true).notNull(),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var duePayments = (0, import_pg_core.pgTable)("due_payments", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  dueId: (0, import_pg_core.uuid)("due_id").references(() => dues.id).notNull(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id).notNull(),
  paymentStatus: (0, import_pg_core.text)("payment_status", { enum: ["pending", "paid", "partial"] }).default("pending").notNull(),
  paymentDate: (0, import_pg_core.timestamp)("payment_date"),
  paymentAmount: (0, import_pg_core.integer)("payment_amount").notNull(),
  // The amount THIS user is supposed to pay (Snapshot or override)
  paidAmount: (0, import_pg_core.integer)("paid_amount").default(0).notNull(),
  // Amount paid so far
  isExempt: (0, import_pg_core.boolean)("is_exempt").default(false).notNull(),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull()
});
var chats = (0, import_pg_core.pgTable)("chats", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  tenantId: (0, import_pg_core.uuid)("tenant_id").references(() => tenants.id).notNull(),
  name: (0, import_pg_core.text)("name"),
  // Optional for DMs, required for Groups
  description: (0, import_pg_core.text)("description"),
  // Group description
  imageUrl: (0, import_pg_core.text)("image_url"),
  // Group icon
  createdBy: (0, import_pg_core.uuid)("created_by").references(() => users.id),
  // Creator of the group
  isPublic: (0, import_pg_core.boolean)("is_public").default(false).notNull(),
  // true = Channel, false = Private Room/DM/Group
  isLocked: (0, import_pg_core.boolean)("is_locked").default(false).notNull(),
  // true = Only admins can send messages
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var chatParticipants = (0, import_pg_core.pgTable)("chat_participants", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  chatId: (0, import_pg_core.uuid)("chat_id").references(() => chats.id).notNull(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id).notNull(),
  joinedAt: (0, import_pg_core.timestamp)("joined_at").defaultNow().notNull(),
  lastReadAt: (0, import_pg_core.timestamp)("last_read_at").defaultNow().notNull(),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)().on(t.chatId, t.userId)
}));
var messages = (0, import_pg_core.pgTable)("messages", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  chatId: (0, import_pg_core.uuid)("chat_id").references(() => chats.id).notNull(),
  senderId: (0, import_pg_core.uuid)("sender_id").references(() => users.id).notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  // Soft delete for "Message Deleted"
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var messageReactions = (0, import_pg_core.pgTable)("message_reactions", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  messageId: (0, import_pg_core.uuid)("message_id").references(() => messages.id).notNull(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id).notNull(),
  emoji: (0, import_pg_core.text)("emoji").default("\u{1F44D}").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
}, (t) => ({
  unq: (0, import_pg_core.unique)().on(t.messageId, t.userId)
  // One reaction per user per message (simple version)
}));
var postAttachments = (0, import_pg_core.pgTable)("post_attachments", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  postId: (0, import_pg_core.uuid)("post_id").references(() => posts.id).notNull(),
  fileName: (0, import_pg_core.text)("file_name").notNull(),
  fileUrl: (0, import_pg_core.text)("file_url").notNull(),
  fileType: (0, import_pg_core.text)("file_type").notNull(),
  // 'image', 'pdf', etc.
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var committees = (0, import_pg_core.pgTable)("committees", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  tenantId: (0, import_pg_core.uuid)("tenant_id").references(() => tenants.id).notNull(),
  name: (0, import_pg_core.text)("name").notNull(),
  // Örn: Yönetim Kurulu, Teknoloji İcra Kurulu
  type: (0, import_pg_core.text)("type", { enum: ["management_board", "executive_committee", "sub_committee", "other"] }).default("executive_committee").notNull(),
  purpose: (0, import_pg_core.text)("purpose"),
  // Kurulun amacı
  description: (0, import_pg_core.text)("description"),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var committeeMembers = (0, import_pg_core.pgTable)("committee_members", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  committeeId: (0, import_pg_core.uuid)("committee_id").references(() => committees.id).notNull(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id).notNull(),
  title: (0, import_pg_core.text)("title").notNull(),
  // Örn: Başkan, Genel Sekreter, Üye
  role: (0, import_pg_core.text)("role", { enum: ["president", "vice_president", "secretary", "member"] }).default("member").notNull(),
  // Sistemdeki rolü
  joinedAt: (0, import_pg_core.timestamp)("joined_at").defaultNow().notNull(),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull()
}, (t) => ({
  // Bir kişi aynı kurulda birden fazla kez bulunamaz (Aynı kişi birden fazla FARKLI kurulda olabilir)
  unq: (0, import_pg_core.unique)().on(t.committeeId, t.userId)
}));
var projects = (0, import_pg_core.pgTable)("projects", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  tenantId: (0, import_pg_core.uuid)("tenant_id").references(() => tenants.id).notNull(),
  committeeId: (0, import_pg_core.uuid)("committee_id").references(() => committees.id),
  // Hangi kurula bağlı (Opsiyonel olabilir ama genelde bağlıdır)
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description"),
  status: (0, import_pg_core.text)("status", { enum: ["planned", "active", "completed", "on_hold", "cancelled"] }).default("planned").notNull(),
  startDate: (0, import_pg_core.timestamp)("start_date"),
  endDate: (0, import_pg_core.timestamp)("end_date"),
  managerId: (0, import_pg_core.uuid)("manager_id").references(() => users.id),
  // Proje Sorumlusu
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var executiveTasks = (0, import_pg_core.pgTable)("executive_tasks", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  tenantId: (0, import_pg_core.uuid)("tenant_id").references(() => tenants.id).notNull(),
  projectId: (0, import_pg_core.uuid)("project_id").references(() => projects.id),
  // Opsiyonel, bir projeye bağlı olabilir
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description"),
  assignedToId: (0, import_pg_core.uuid)("assigned_to_id").references(() => users.id),
  // Kime atandı
  assignedById: (0, import_pg_core.uuid)("assigned_by_id").references(() => users.id),
  // Kim atadı
  status: (0, import_pg_core.text)("status", { enum: ["todo", "in_progress", "review", "done"] }).default("todo").notNull(),
  priority: (0, import_pg_core.text)("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium").notNull(),
  dueDate: (0, import_pg_core.timestamp)("due_date"),
  completedAt: (0, import_pg_core.timestamp)("completed_at"),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var usersRelations = (0, import_drizzle_orm.relations)(users, ({ many }) => ({
  tenantUsers: many(tenantUsers),
  duePayments: many(duePayments),
  committeeMemberships: many(committeeMembers),
  assignedProjects: many(projects, { relationName: "projectManager" }),
  assignedTasks: many(executiveTasks, { relationName: "taskAssignee" }),
  createdTasks: many(executiveTasks, { relationName: "taskCreator" })
}));
var tenantUsersRelations = (0, import_drizzle_orm.relations)(tenantUsers, ({ one }) => ({
  user: one(users, {
    fields: [tenantUsers.userId],
    references: [users.id]
  }),
  tenant: one(tenants, {
    fields: [tenantUsers.tenantId],
    references: [tenants.id]
  })
}));
var committeesRelations = (0, import_drizzle_orm.relations)(committees, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [committees.tenantId],
    references: [tenants.id]
  }),
  members: many(committeeMembers),
  projects: many(projects)
}));
var committeeMembersRelations = (0, import_drizzle_orm.relations)(committeeMembers, ({ one }) => ({
  committee: one(committees, {
    fields: [committeeMembers.committeeId],
    references: [committees.id]
  }),
  user: one(users, {
    fields: [committeeMembers.userId],
    references: [users.id]
  })
}));
var ibansRelations = (0, import_drizzle_orm.relations)(ibans, ({ many }) => ({
  dues: many(dues)
}));
var duesRelations = (0, import_drizzle_orm.relations)(dues, ({ one, many }) => ({
  iban: one(ibans, {
    fields: [dues.ibanId],
    references: [ibans.id]
  }),
  duePayments: many(duePayments),
  tenant: one(tenants, {
    fields: [dues.tenantId],
    references: [tenants.id]
  })
}));
var duePaymentsRelations = (0, import_drizzle_orm.relations)(duePayments, ({ one }) => ({
  due: one(dues, {
    fields: [duePayments.dueId],
    references: [dues.id]
  }),
  user: one(users, {
    fields: [duePayments.userId],
    references: [users.id]
  })
}));
var projectsRelations = (0, import_drizzle_orm.relations)(projects, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [projects.tenantId],
    references: [tenants.id]
  }),
  committee: one(committees, {
    fields: [projects.committeeId],
    references: [committees.id]
  }),
  manager: one(users, {
    fields: [projects.managerId],
    references: [users.id],
    relationName: "projectManager"
  }),
  tasks: many(executiveTasks)
}));
var executiveTasksRelations = (0, import_drizzle_orm.relations)(executiveTasks, ({ one }) => ({
  tenant: one(tenants, {
    fields: [executiveTasks.tenantId],
    references: [tenants.id]
  }),
  project: one(projects, {
    fields: [executiveTasks.projectId],
    references: [projects.id]
  }),
  assignedTo: one(users, {
    fields: [executiveTasks.assignedToId],
    references: [users.id],
    relationName: "taskAssignee"
  }),
  assignedBy: one(users, {
    fields: [executiveTasks.assignedById],
    references: [users.id],
    relationName: "taskCreator"
  })
}));
var chatsRelations = (0, import_drizzle_orm.relations)(chats, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [chats.tenantId],
    references: [tenants.id]
  }),
  creator: one(users, {
    fields: [chats.createdBy],
    references: [users.id]
  }),
  participants: many(chatParticipants),
  messages: many(messages)
}));
var chatParticipantsRelations = (0, import_drizzle_orm.relations)(chatParticipants, ({ one }) => ({
  chat: one(chats, {
    fields: [chatParticipants.chatId],
    references: [chats.id]
  }),
  user: one(users, {
    fields: [chatParticipants.userId],
    references: [users.id]
  })
}));
var messagesRelations = (0, import_drizzle_orm.relations)(messages, ({ one, many }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  }),
  reactions: many(messageReactions)
}));
var messageReactionsRelations = (0, import_drizzle_orm.relations)(messageReactions, ({ one }) => ({
  message: one(messages, {
    fields: [messageReactions.messageId],
    references: [messages.id]
  }),
  user: one(users, {
    fields: [messageReactions.userId],
    references: [users.id]
  })
}));
var postsRelations = (0, import_drizzle_orm.relations)(posts, ({ one, many }) => ({
  attachments: many(postAttachments)
}));
var postAttachmentsRelations = (0, import_drizzle_orm.relations)(postAttachments, ({ one }) => ({
  post: one(posts, {
    fields: [postAttachments.postId],
    references: [posts.id]
  })
}));
var contractTypeEnum = (0, import_pg_core.pgEnum)("contract_type", ["KVKK", "USER_AGREEMENT", "ASSOCIATION_AGREEMENT"]);
var contracts = (0, import_pg_core.pgTable)("contracts", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  type: contractTypeEnum("type").notNull(),
  version: (0, import_pg_core.text)("version").notNull(),
  // e.g. "1.0", "2024-02-19"
  title: (0, import_pg_core.text)("title").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  // HTML or Markdown
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var userContracts = (0, import_pg_core.pgTable)("user_contracts", {
  id: (0, import_pg_core.uuid)("id").defaultRandom().primaryKey(),
  userId: (0, import_pg_core.uuid)("user_id").references(() => users.id).notNull(),
  contractId: (0, import_pg_core.uuid)("contract_id").references(() => contracts.id).notNull(),
  acceptedAt: (0, import_pg_core.timestamp)("accepted_at").defaultNow().notNull()
});
var contractsRelations = (0, import_drizzle_orm.relations)(contracts, ({ many }) => ({
  acceptances: many(userContracts)
}));
var userContractsRelations = (0, import_drizzle_orm.relations)(userContracts, ({ one }) => ({
  user: one(users, {
    fields: [userContracts.userId],
    references: [users.id]
  }),
  contract: one(contracts, {
    fields: [userContracts.contractId],
    references: [contracts.id]
  })
}));

// lib/db/index.ts
var globalForDb = globalThis;
var pool = globalForDb.conn ?? new import_pg.Pool({
  connectionString: process.env.DATABASE_URL
});
if (process.env.NODE_ENV !== "production") globalForDb.conn = pool;
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// scripts/seed-contracts.ts
async function main() {
  console.log("Seeding contracts...");
  console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing!");
    process.exit(1);
  }
  const initialContracts = [
    {
      type: "KVKK",
      version: "1.0",
      title: "Ki\u015Fisel Verilerin Korunmas\u0131 Ayd\u0131nlatma Metni",
      content: `
<h1>Ki\u015Fisel Verilerin Korunmas\u0131</h1>
<p>Bu metin, DernekteBug\xFCn uygulamas\u0131 kapsam\u0131nda ki\u015Fisel verilerinizin nas\u0131l i\u015Flendi\u011Fini a\xE7\u0131klar...</p>
<p><strong>1. Veri Sorumlusu:</strong> Şirket Y\xF6netimi...</p>
<p><strong>2. \u0130\u015Flenen Veriler:</strong> Ad, soyad, telefon, e-posta...</p>
            `,
      isActive: true
    },
    {
      type: "USER_AGREEMENT",
      version: "1.0",
      title: "Kullan\u0131c\u0131 S\xF6zle\u015Fmesi",
      content: `
<h1>Kullan\u0131c\u0131 S\xF6zle\u015Fmesi</h1>
<p>L\xFCtfen uygulamay\u0131 kullanmadan \xF6nce bu s\xF6zle\u015Fmeyi dikkatlice okuyunuz.</p>
<p><strong>1. Taraflar:</strong>...</p>
<p><strong>2. Kullan\u0131m Ko\u015Fullar\u0131:</strong>...</p>
            `,
      isActive: true
    },
    {
      type: "ASSOCIATION_AGREEMENT",
      version: "1.0",
      title: "Şirket T\xFCz\xFC\u011F\xFC ve \xDCyelik \u015Eartlar\u0131",
      content: `
<h1>Şirket T\xFCz\xFC\u011F\xFC</h1>
<p>Derne\u011Fimizin t\xFCz\xFC\u011F\xFCne ve \xFCyelik \u015Fartlar\u0131na uyaca\u011F\u0131n\u0131z\u0131 taahh\xFCt edersiniz.</p>
<p><strong>Madde 1:</strong>...</p>
            `,
      isActive: true
    }
  ];
  for (const contract of initialContracts) {
    await db.insert(contracts).values(contract);
    console.log(`Inserted contract: ${contract.title}`);
  }
  console.log("Seeding completed.");
  process.exit(0);
}
main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
