
import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookiesMock, findUniqueMock, hashSessionTokenMock } = vi.hoisted(
  () => ({
    cookiesMock: vi.fn(),
    findUniqueMock: vi.fn(),
    hashSessionTokenMock: vi.fn(),
  })
);

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: {
      findUnique: findUniqueMock,
    },
  },
}));

vi.mock("@/lib/auth/session", () => ({
  hashSessionToken: hashSessionTokenMock,
}));

import { getCurrentUser } from "@/lib/auth/current-user";

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hashSessionTokenMock.mockReturnValue("hashed-token");

    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({
        value: "raw-session-token",
      }),
    });
  });

  it("should return null when the session cookie is missing", async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(hashSessionTokenMock).not.toHaveBeenCalled();
  });

  it("should return null when the session does not exist", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(hashSessionTokenMock).toHaveBeenCalledWith(
      "raw-session-token"
    );
    expect(findUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tokenHash: "hashed-token" },
      })
    );
  });

  it("should return null when the session has expired", async () => {
    findUniqueMock.mockResolvedValue({
      expiresAt: new Date(Date.now() - 60_000),
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        role: "STUDENT",
      },
    });

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });

  it("should return the user when the session is valid", async () => {
    const user = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "STUDENT",
    };

    findUniqueMock.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      user,
    });

    const result = await getCurrentUser();

    expect(result).toEqual(user);
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("token");
  });
});
