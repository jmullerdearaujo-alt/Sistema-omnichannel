import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  patients,
  attendants,
  conversations,
  messages,
  channels,
  quickReplies,
  appointments,
  attendantMetrics,
  conversationNotes,
  type Patient,
  type Attendant,
  type Conversation,
  type Message,
  type Channel,
  type QuickReply,
  type Appointment,
  type AttendantMetric,
  type ConversationNote
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== User Management =====

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

// ===== Patient Management =====

export async function getPatientByUserId(userId: number): Promise<Patient | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(patients).where(eq(patients.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPatients(): Promise<Patient[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(patients).orderBy(desc(patients.createdAt));
}

// ===== Attendant Management =====

export async function getAttendantByUserId(userId: number): Promise<Attendant | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(attendants).where(eq(attendants.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllAttendants(): Promise<Attendant[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(attendants);
}

export async function updateAttendantStatus(attendantId: number, status: "available" | "busy" | "offline") {
  const db = await getDb();
  if (!db) return;
  
  await db.update(attendants).set({ status }).where(eq(attendants.id, attendantId));
}

// ===== Channel Management =====

export async function getAllChannels(): Promise<Channel[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(channels).where(eq(channels.isActive, true));
}

export async function getChannelById(id: number): Promise<Channel | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(channels).where(eq(channels.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== Conversation Management =====

export async function getConversationById(id: number): Promise<Conversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getConversationsByPatient(patientId: number): Promise<Conversation[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(conversations)
    .where(eq(conversations.patientId, patientId))
    .orderBy(desc(conversations.lastMessageAt));
}

export async function getConversationsByAttendant(attendantId: number): Promise<Conversation[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(conversations)
    .where(eq(conversations.attendantId, attendantId))
    .orderBy(desc(conversations.lastMessageAt));
}

export async function getOpenConversations(): Promise<Conversation[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(conversations)
    .where(eq(conversations.status, "open"))
    .orderBy(desc(conversations.priority), desc(conversations.createdAt));
}

export async function getAllConversations(): Promise<Conversation[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(conversations)
    .orderBy(desc(conversations.lastMessageAt));
}

export async function updateConversationStatus(
  conversationId: number, 
  status: "open" | "waiting" | "closed" | "escalated"
) {
  const db = await getDb();
  if (!db) return;
  
  const updates: any = { status };
  if (status === "closed") {
    updates.closedAt = new Date();
  }
  
  await db.update(conversations).set(updates).where(eq(conversations.id, conversationId));
}

export async function assignConversation(conversationId: number, attendantId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(conversations).set({ attendantId }).where(eq(conversations.id, conversationId));
}

// ===== Message Management =====

export async function getMessagesByConversation(conversationId: number): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function markMessagesAsRead(conversationId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(messages)
    .set({ isRead: true })
    .where(and(
      eq(messages.conversationId, conversationId),
      eq(messages.isRead, false)
    ));
}

export async function getUnreadMessageCount(conversationId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(
      eq(messages.conversationId, conversationId),
      eq(messages.isRead, false)
    ));
  
  return result[0]?.count || 0;
}

// ===== Quick Replies =====

export async function getAllQuickReplies(): Promise<QuickReply[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(quickReplies)
    .where(eq(quickReplies.isActive, true))
    .orderBy(quickReplies.category, quickReplies.title);
}

export async function getQuickRepliesByCategory(category: string): Promise<QuickReply[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(quickReplies)
    .where(and(
      eq(quickReplies.isActive, true),
      eq(quickReplies.category, category)
    ))
    .orderBy(quickReplies.title);
}

// ===== Appointments =====

export async function getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(appointments)
    .where(eq(appointments.patientId, patientId))
    .orderBy(desc(appointments.scheduledAt));
}

export async function getUpcomingAppointments(): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  return await db.select().from(appointments)
    .where(and(
      gte(appointments.scheduledAt, now),
      eq(appointments.status, "scheduled")
    ))
    .orderBy(appointments.scheduledAt);
}

// ===== Attendant Metrics =====

export async function getAttendantMetrics(attendantId: number, startDate: Date, endDate: Date): Promise<AttendantMetric[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(attendantMetrics)
    .where(and(
      eq(attendantMetrics.attendantId, attendantId),
      gte(attendantMetrics.date, startDate),
      lte(attendantMetrics.date, endDate)
    ))
    .orderBy(desc(attendantMetrics.date));
}

export async function getAllAttendantMetrics(startDate: Date, endDate: Date): Promise<AttendantMetric[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(attendantMetrics)
    .where(and(
      gte(attendantMetrics.date, startDate),
      lte(attendantMetrics.date, endDate)
    ))
    .orderBy(desc(attendantMetrics.date));
}

// ===== Conversation Notes =====

export async function getNotesByConversation(conversationId: number): Promise<ConversationNote[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(conversationNotes)
    .where(eq(conversationNotes.conversationId, conversationId))
    .orderBy(desc(conversationNotes.createdAt));
}
