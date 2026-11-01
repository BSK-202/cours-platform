import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema } from "../auth.schema";

describe("signupSchema", () => {
  it("accepts valid registration data", () => {
    const result = signupSchema.safeParse({
      name: "Ikrame",
      email: "ikrame@example.com",
      password: "SecurePass123",
    });

    expect(result.success).toBe(true);
  });

  it("trims name and email", () => {
    const result = signupSchema.safeParse({
      name: "  Ikrame  ",
      email: "  ikrame@example.com  ",
      password: "SecurePass123",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Ikrame");
      expect(result.data.email).toBe("ikrame@example.com");
    }
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = signupSchema.safeParse({
      name: "A",
      email: "ikrame@example.com",
      password: "SecurePass123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signupSchema.safeParse({
      name: "Ikrame",
      email: "invalid-email",
      password: "SecurePass123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({
      name: "Ikrame",
      email: "ikrame@example.com",
      password: "1234567",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password longer than 72 characters", () => {
    const result = signupSchema.safeParse({
      name: "Ikrame",
      email: "ikrame@example.com",
      password: "a".repeat(73),
    });

    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "ikrame@example.com",
      password: "12345678",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "ikrame@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});
