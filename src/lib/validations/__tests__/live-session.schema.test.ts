
import { describe, it, expect } from "vitest";
import {
  createLiveSessionSchema,
  updateLiveSessionSchema,
} from "../live-session.schema";

describe("createLiveSessionSchema", () => {
  const validSession = {
    title: "Session Java",
    description: "Introduction aux concepts Java.",
    startsAt: "2026-11-05T18:00:00.000Z",
    meetingUrl: "https://meet.google.com/abc-defg-hij",
  };

  it("accepts valid live session data", () => {
    expect(createLiveSessionSchema.safeParse(validSession).success).toBe(true);
  });

  it("trims title, description and meetingUrl", () => {
    const result = createLiveSessionSchema.safeParse({
      ...validSession,
      title: "  Session Java  ",
      description: "  Introduction Java  ",
      meetingUrl: "  https://meet.google.com/abc-defg-hij  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.title).toBe("Session Java");
      expect(result.data.description).toBe("Introduction Java");
      expect(result.data.meetingUrl).toBe(
        "https://meet.google.com/abc-defg-hij"
      );
    }
  });

  it("accepts an omitted description", () => {
    const { description, ...data } = validSession;
    expect(createLiveSessionSchema.safeParse(data).success).toBe(true);
  });

  it("rejects a title shorter than 3 characters", () => {
    expect(
      createLiveSessionSchema.safeParse({
        ...validSession,
        title: "AB",
      }).success
    ).toBe(false);
  });

  it("rejects a title longer than 150 characters", () => {
    expect(
      createLiveSessionSchema.safeParse({
        ...validSession,
        title: "A".repeat(151),
      }).success
    ).toBe(false);
  });

  it("rejects a description longer than 5000 characters", () => {
    expect(
      createLiveSessionSchema.safeParse({
        ...validSession,
        description: "A".repeat(5001),
      }).success
    ).toBe(false);
  });

  it("rejects an invalid date", () => {
    expect(
      createLiveSessionSchema.safeParse({
        ...validSession,
        startsAt: "05/11/2026",
      }).success
    ).toBe(false);
  });

  it("rejects an invalid meeting URL", () => {
    expect(
      createLiveSessionSchema.safeParse({
        ...validSession,
        meetingUrl: "not-a-url",
      }).success
    ).toBe(false);
  });
});

describe("updateLiveSessionSchema", () => {
  it("accepts a partial update", () => {
    expect(
      updateLiveSessionSchema.safeParse({
        title: "Nouvelle session Java",
      }).success
    ).toBe(true);
  });

  it("accepts a null description", () => {
    expect(
      updateLiveSessionSchema.safeParse({
        description: null,
      }).success
    ).toBe(true);
  });

  it("accepts a valid date update", () => {
    expect(
      updateLiveSessionSchema.safeParse({
        startsAt: "2026-11-06T10:00:00.000Z",
      }).success
    ).toBe(true);
  });

  it("accepts a valid meeting URL update", () => {
    expect(
      updateLiveSessionSchema.safeParse({
        meetingUrl: "https://meet.google.com/xyz-abcd-efg",
      }).success
    ).toBe(true);
  });

  it("rejects an empty update", () => {
    expect(updateLiveSessionSchema.safeParse({}).success).toBe(false);
  });

  it("rejects unknown properties such as courseId", () => {
    expect(
      updateLiveSessionSchema.safeParse({
        courseId: "123",
      }).success
    ).toBe(false);
  });

  it("rejects an invalid meeting URL", () => {
    expect(
      updateLiveSessionSchema.safeParse({
        meetingUrl: "invalid-url",
      }).success
    ).toBe(false);
  });

  it("rejects an invalid date", () => {
    expect(
      updateLiveSessionSchema.safeParse({
        startsAt: "invalid-date",
      }).success
    ).toBe(false);
  });
});
