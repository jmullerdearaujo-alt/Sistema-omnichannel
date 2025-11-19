import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role system for patient/attendant/manager access control.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["patient", "attendant", "manager", "admin"]).default("patient").notNull(),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Patients table - stores patient-specific information
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cpf: varchar("cpf", { length: 14 }),
  birthDate: timestamp("birthDate"),
  address: text("address"),
  preferredChannel: varchar("preferredChannel", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Attendants table - stores attendant-specific information and metrics
 */
export const attendants = mysqlTable("attendants", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["available", "busy", "offline"]).default("offline").notNull(),
  currentLoad: int("currentLoad").default(0).notNull(),
  maxLoad: int("maxLoad").default(5).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Attendant = typeof attendants.$inferSelect;
export type InsertAttendant = typeof attendants.$inferInsert;

/**
 * Communication channels (WhatsApp, Instagram, Facebook, Email, Website Chat)
 */
export const channels = mysqlTable("channels", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["whatsapp", "instagram", "facebook", "email", "webchat"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  config: text("config"), // JSON configuration for channel integration
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Channel = typeof channels.$inferSelect;
export type InsertChannel = typeof channels.$inferInsert;

/**
 * Conversations - unified conversation thread across all channels
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  attendantId: int("attendantId"),
  channelId: int("channelId").notNull(),
  status: mysqlEnum("status", ["open", "waiting", "closed", "escalated"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  subject: varchar("subject", { length: 255 }),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  closedAt: timestamp("closedAt"),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages - individual messages within conversations
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  senderType: mysqlEnum("senderType", ["patient", "attendant", "system"]).notNull(),
  content: text("content").notNull(),
  messageType: mysqlEnum("messageType", ["text", "image", "file", "audio", "video"]).default("text").notNull(),
  attachmentUrl: text("attachmentUrl"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Quick replies - template messages for attendants
 */
export const quickReplies = mysqlTable("quickReplies", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuickReply = typeof quickReplies.$inferSelect;
export type InsertQuickReply = typeof quickReplies.$inferInsert;

/**
 * Appointments - medical appointments scheduling
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  doctorName: varchar("doctorName", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 100 }),
  scheduledAt: timestamp("scheduledAt").notNull(),
  status: mysqlEnum("status", ["scheduled", "confirmed", "cancelled", "completed"]).default("scheduled").notNull(),
  notes: text("notes"),
  reminderSent: boolean("reminderSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Attendant metrics - performance tracking
 */
export const attendantMetrics = mysqlTable("attendantMetrics", {
  id: int("id").autoincrement().primaryKey(),
  attendantId: int("attendantId").notNull(),
  date: timestamp("date").notNull(),
  totalConversations: int("totalConversations").default(0).notNull(),
  closedConversations: int("closedConversations").default(0).notNull(),
  avgResponseTime: int("avgResponseTime").default(0).notNull(), // in seconds
  avgResolutionTime: int("avgResolutionTime").default(0).notNull(), // in seconds
  satisfactionScore: int("satisfactionScore").default(0).notNull(), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AttendantMetric = typeof attendantMetrics.$inferSelect;
export type InsertAttendantMetric = typeof attendantMetrics.$inferInsert;

/**
 * Conversation notes - internal notes for conversations
 */
export const conversationNotes = mysqlTable("conversationNotes", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  attendantId: int("attendantId").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConversationNote = typeof conversationNotes.$inferSelect;
export type InsertConversationNote = typeof conversationNotes.$inferInsert;
