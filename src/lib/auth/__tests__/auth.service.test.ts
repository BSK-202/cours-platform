
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, authMocks } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    session: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
  authMocks: {
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
    generateSessionToken: vi.fn(),
    hashSessionToken: vi.fn(),
    getSessionExpirationDate: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: authMocks.hashPassword,
  verifyPassword: authMocks.verifyPassword,
}));

vi.mock("@/lib/auth/session", () => ({
  generateSessionToken: authMocks.generateSessionToken,
  hashSessionToken: authMocks.hashSessionToken,
  getSessionExpirationDate: authMocks.getSessionExpirationDate,
}));

import {
  registerUser,
  loginUser,
  createUserSession,
  logoutUser,
} from "../auth.service";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    const validInput = {
      name: "Test Student",
      email: "student@test.com",
      password: "Password123!",
    };

    it("creates a student account with a hashed password", async () => {
      authMocks.hashPassword.mockResolvedValue("hashed-password");

      prismaMock.user.findUnique.mockResolvedValue(null);

      prismaMock.user.create.mockResolvedValue({
        id: "user-1",
        name: "Test Student",
        email: "student@test.com",
        role: "STUDENT",
      });

      const result = await registerUser(validInput);

      expect(result).toMatchObject({
        id: "user-1",
        email: "student@test.com",
        role: "STUDENT",
      });

      expect(authMocks.hashPassword).toHaveBeenCalledWith(
        validInput.password
      );

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: "Test Student",
          email: "student@test.com",
          passwordHash: "hashed-password",
          role: "STUDENT",
        },
        select: expect.any(Object),
      });
    });

    it("rejects invalid registration data", async () => {
      await expect(
        registerUser({ email: "invalid" })
      ).rejects.toThrow("Données d'inscription invalides.");

      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("rejects an already registered email", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "existing-user",
        email: validInput.email,
      });

      await expect(
        registerUser(validInput)
      ).rejects.toThrow("Cette adresse email est déjà utilisée.");

      expect(authMocks.hashPassword).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("does not expose passwordHash in the returned user", async () => {
      authMocks.hashPassword.mockResolvedValue("hashed-password");
      prismaMock.user.findUnique.mockResolvedValue(null);

      prismaMock.user.create.mockResolvedValue({
        id: "user-1",
        name: "Test Student",
        email: validInput.email,
        role: "STUDENT",
      });

      const result = await registerUser(validInput);

      expect(result).not.toHaveProperty("passwordHash");
    });
  });

  describe("loginUser", () => {
    const user = {
      id: "user-1",
      name: "Test Student",
      email: "student@test.com",
      passwordHash: "stored-hash",
      role: "STUDENT",
    };

    it("authenticates a user with valid credentials", async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      authMocks.verifyPassword.mockResolvedValue(true);

      authMocks.generateSessionToken.mockReturnValue("raw-token");
      authMocks.hashSessionToken.mockReturnValue("hashed-token");

      const expiresAt = new Date("2026-11-08T12:00:00.000Z");
      authMocks.getSessionExpirationDate.mockReturnValue(expiresAt);

      prismaMock.session.create.mockResolvedValue({});

      const result = await loginUser({
        email: user.email,
        password: "Password123!",
      });

      expect(result).toMatchObject({
        id: user.id,
        email: user.email,
        role: "STUDENT",
        session: {
          token: "raw-token",
          expiresAt,
        },
      });

      expect(authMocks.verifyPassword).toHaveBeenCalledWith(
        "Password123!",
        "stored-hash"
      );

      expect(prismaMock.session.create).toHaveBeenCalledWith({
        data: {
          tokenHash: "hashed-token",
          userId: "user-1",
          expiresAt,
        },
      });
    });

    it("rejects invalid login data", async () => {
      await expect(
        loginUser({ email: "invalid" })
      ).rejects.toThrow("Email ou mot de passe invalide.");

      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it("rejects an unknown email", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        loginUser({
          email: "unknown@test.com",
          password: "Password123!",
        })
      ).rejects.toThrow("Email ou mot de passe invalide.");

      expect(authMocks.verifyPassword).not.toHaveBeenCalled();
    });

    it("rejects an incorrect password", async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      authMocks.verifyPassword.mockResolvedValue(false);

      await expect(
        loginUser({
          email: user.email,
          password: "WrongPassword123!",
        })
      ).rejects.toThrow("Email ou mot de passe invalide.");

      expect(prismaMock.session.create).not.toHaveBeenCalled();
    });

    it("does not expose passwordHash in the login result", async () => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      authMocks.verifyPassword.mockResolvedValue(true);

      authMocks.generateSessionToken.mockReturnValue("raw-token");
      authMocks.hashSessionToken.mockReturnValue("hashed-token");
      authMocks.getSessionExpirationDate.mockReturnValue(new Date());

      prismaMock.session.create.mockResolvedValue({});

      const result = await loginUser({
        email: user.email,
        password: "Password123!",
      });

      expect(result).not.toHaveProperty("passwordHash");
    });
  });

  describe("createUserSession", () => {
    it("generates and stores a hashed session token", async () => {
      const expiresAt = new Date("2026-11-08T12:00:00.000Z");

      authMocks.generateSessionToken.mockReturnValue("raw-token");
      authMocks.hashSessionToken.mockReturnValue("hashed-token");
      authMocks.getSessionExpirationDate.mockReturnValue(expiresAt);

      prismaMock.session.create.mockResolvedValue({});

      const result = await createUserSession("user-1");

      expect(result).toEqual({
        token: "raw-token",
        expiresAt,
      });

      expect(prismaMock.session.create).toHaveBeenCalledWith({
        data: {
          tokenHash: "hashed-token",
          userId: "user-1",
          expiresAt,
        },
      });
    });
  });

  describe("logoutUser", () => {
    it("deletes only the session matching the supplied token", async () => {
      authMocks.hashSessionToken.mockReturnValue("hashed-token");
      prismaMock.session.deleteMany.mockResolvedValue({ count: 1 });

      await logoutUser("raw-token");

      expect(authMocks.hashSessionToken).toHaveBeenCalledWith("raw-token");

      expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
        where: {
          tokenHash: "hashed-token",
        },
      });
    });
  });
});
