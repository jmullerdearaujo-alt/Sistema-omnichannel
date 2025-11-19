import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { getDb } from "./db";
import { 
  conversations, 
  messages, 
  channels, 
  quickReplies, 
  appointments,
  conversationNotes,
  patients,
  attendants
} from "../drizzle/schema";

// Helper procedures for role-based access
const attendantProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.user || !["attendant", "manager", "admin"].includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a atendentes" });
  }
  return next({ ctx });
});

const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.user || !["manager", "admin"].includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a gerentes" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // User management
  users: router({
    getAll: managerProcedure.query(async () => {
      return await db.getAllUsers();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserById(input.id);
      }),
  }),

  // Patient operations
  patients: router({
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return await db.getPatientByUserId(ctx.user.id);
    }),

    getAll: attendantProcedure.query(async () => {
      return await db.getAllPatients();
    }),

    getByUserId: attendantProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPatientByUserId(input.userId);
      }),
  }),

  // Attendant operations
  attendants: router({
    getAll: managerProcedure.query(async () => {
      return await db.getAllAttendants();
    }),

    getMyProfile: attendantProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return await db.getAttendantByUserId(ctx.user.id);
    }),

    updateStatus: attendantProcedure
      .input(z.object({
        attendantId: z.number(),
        status: z.enum(["available", "busy", "offline"])
      }))
      .mutation(async ({ input }) => {
        await db.updateAttendantStatus(input.attendantId, input.status);
        return { success: true };
      }),
  }),

  // Channel management
  channels: router({
    getAll: attendantProcedure.query(async () => {
      return await db.getAllChannels();
    }),

    getById: attendantProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getChannelById(input.id);
      }),

    create: managerProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(["whatsapp", "instagram", "facebook", "email", "webchat"]),
        config: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        await database.insert(channels).values(input);
        return { success: true };
      }),
  }),

  // Conversation management
  conversations: router({
    getAll: attendantProcedure.query(async () => {
      return await db.getAllConversations();
    }),

    getOpen: attendantProcedure.query(async () => {
      return await db.getOpenConversations();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getConversationById(input.id);
      }),

    getByPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getConversationsByPatient(input.patientId);
      }),

    getByAttendant: attendantProcedure
      .input(z.object({ attendantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getConversationsByAttendant(input.attendantId);
      }),

    create: protectedProcedure
      .input(z.object({
        patientId: z.number(),
        channelId: z.number(),
        subject: z.string().optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        await database.insert(conversations).values({
          ...input,
          priority: input.priority || "normal",
        });
        
        return { success: true };
      }),

    updateStatus: attendantProcedure
      .input(z.object({
        conversationId: z.number(),
        status: z.enum(["open", "waiting", "closed", "escalated"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateConversationStatus(input.conversationId, input.status);
        return { success: true };
      }),

    assign: managerProcedure
      .input(z.object({
        conversationId: z.number(),
        attendantId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.assignConversation(input.conversationId, input.attendantId);
        return { success: true };
      }),
  }),

  // Message management
  messages: router({
    getByConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMessagesByConversation(input.conversationId);
      }),

    send: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string(),
        messageType: z.enum(["text", "image", "file", "audio", "video"]).optional(),
        attachmentUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Determine sender type based on user role
        let senderType: "patient" | "attendant" | "system" = "patient";
        if (["attendant", "manager", "admin"].includes(ctx.user.role)) {
          senderType = "attendant";
        }

        await database.insert(messages).values({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          senderType,
          content: input.content,
          messageType: input.messageType || "text",
          attachmentUrl: input.attachmentUrl,
        });

        // Update conversation lastMessageAt
        await database.update(conversations)
          .set({ lastMessageAt: new Date() })
          .where({ id: input.conversationId } as any);

        return { success: true };
      }),

    markAsRead: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markMessagesAsRead(input.conversationId);
        return { success: true };
      }),

    getUnreadCount: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUnreadMessageCount(input.conversationId);
      }),
  }),

  // Quick replies
  quickReplies: router({
    getAll: attendantProcedure.query(async () => {
      return await db.getAllQuickReplies();
    }),

    getByCategory: attendantProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return await db.getQuickRepliesByCategory(input.category);
      }),

    create: managerProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await database.insert(quickReplies).values({
          ...input,
          createdBy: ctx.user.id,
        });

        return { success: true };
      }),
  }),

  // Appointments
  appointments: router({
    getByPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAppointmentsByPatient(input.patientId);
      }),

    getUpcoming: attendantProcedure.query(async () => {
      return await db.getUpcomingAppointments();
    }),

    create: attendantProcedure
      .input(z.object({
        patientId: z.number(),
        doctorName: z.string(),
        specialty: z.string().optional(),
        scheduledAt: z.date(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await database.insert(appointments).values(input);
        return { success: true };
      }),

    updateStatus: attendantProcedure
      .input(z.object({
        appointmentId: z.number(),
        status: z.enum(["scheduled", "confirmed", "cancelled", "completed"]),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await database.update(appointments)
          .set({ status: input.status })
          .where({ id: input.appointmentId } as any);

        return { success: true };
      }),
  }),

  // Metrics and reports
  metrics: router({
    getAttendantMetrics: managerProcedure
      .input(z.object({
        attendantId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getAttendantMetrics(input.attendantId, input.startDate, input.endDate);
      }),

    getAllMetrics: managerProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getAllAttendantMetrics(input.startDate, input.endDate);
      }),

    getDashboardStats: managerProcedure.query(async () => {
      const allConversations = await db.getAllConversations();
      const openConversations = await db.getOpenConversations();
      const allAttendants = await db.getAllAttendants();
      
      const availableAttendants = allAttendants.filter(a => a.status === "available");
      const busyAttendants = allAttendants.filter(a => a.status === "busy");

      return {
        totalConversations: allConversations.length,
        openConversations: openConversations.length,
        closedToday: allConversations.filter(c => {
          if (!c.closedAt) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return c.closedAt >= today;
        }).length,
        totalAttendants: allAttendants.length,
        availableAttendants: availableAttendants.length,
        busyAttendants: busyAttendants.length,
      };
    }),
  }),

  // Conversation notes
  notes: router({
    getByConversation: attendantProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotesByConversation(input.conversationId);
      }),

    create: attendantProcedure
      .input(z.object({
        conversationId: z.number(),
        note: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const attendant = await db.getAttendantByUserId(ctx.user.id);
        if (!attendant) throw new TRPCError({ code: "FORBIDDEN" });

        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await database.insert(conversationNotes).values({
          conversationId: input.conversationId,
          attendantId: attendant.id,
          note: input.note,
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
