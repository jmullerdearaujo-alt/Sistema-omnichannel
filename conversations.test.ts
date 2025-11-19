import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createManagerContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "manager-test",
    email: "manager@test.com",
    name: "Test Manager",
    loginMethod: "manus",
    role: "manager",
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAttendantContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "attendant-test",
    email: "attendant@test.com",
    name: "Test Attendant",
    loginMethod: "manus",
    role: "attendant",
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createPatientContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 3,
    openId: "patient-test",
    email: "patient@test.com",
    name: "Test Patient",
    loginMethod: "manus",
    role: "patient",
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Conversations API", () => {
  it("should allow manager to get all conversations", async () => {
    const ctx = createManagerContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.conversations.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow attendant to get open conversations", async () => {
    const ctx = createAttendantContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.conversations.getOpen();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny patient access to all conversations", async () => {
    const ctx = createPatientContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.conversations.getAll()).rejects.toThrow("Acesso restrito a atendentes");
  });
});

describe("Channels API", () => {
  it("should allow attendant to get all channels", async () => {
    const ctx = createAttendantContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.channels.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should deny patient access to channels", async () => {
    const ctx = createPatientContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.channels.getAll()).rejects.toThrow("Acesso restrito a atendentes");
  });
});

describe("Quick Replies API", () => {
  it("should allow attendant to get quick replies", async () => {
    const ctx = createAttendantContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quickReplies.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should deny patient access to quick replies", async () => {
    const ctx = createPatientContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.quickReplies.getAll()).rejects.toThrow("Acesso restrito a atendentes");
  });
});

describe("Metrics API", () => {
  it("should allow manager to get dashboard stats", async () => {
    const ctx = createManagerContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.metrics.getDashboardStats();
    expect(result).toHaveProperty("totalConversations");
    expect(result).toHaveProperty("openConversations");
    expect(result).toHaveProperty("totalAttendants");
    expect(typeof result.totalConversations).toBe("number");
  });

  it("should deny attendant access to dashboard stats", async () => {
    const ctx = createAttendantContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.metrics.getDashboardStats()).rejects.toThrow("Acesso restrito a gerentes");
  });

  it("should deny patient access to metrics", async () => {
    const ctx = createPatientContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.metrics.getDashboardStats()).rejects.toThrow("Acesso restrito a gerentes");
  });
});

describe("Users API", () => {
  it("should allow manager to get all users", async () => {
    const ctx = createManagerContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.users.getAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny attendant access to all users", async () => {
    const ctx = createAttendantContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.users.getAll()).rejects.toThrow("Acesso restrito a gerentes");
  });
});
