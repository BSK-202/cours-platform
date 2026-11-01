
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    course: {
      findFirst: vi.fn(),
    },
    liveSession: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  createLiveSession,
  getLiveSessions,
  updateLiveSession,
  deleteLiveSession,
} from "../live-session.service";

describe("live-session.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validSession = {
    title: "Session Java",
    description: "Introduction aux concepts Java.",
    startsAt: "2026-11-05T18:00:00.000Z",
    meetingUrl: "https://meet.google.com/abc-defg-hij",
  };

  describe("createLiveSession", () => {
    it("creates a live session for the course owner", async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: "course-1" });
      prismaMock.liveSession.create.mockImplementation(
        async ({ data }) => ({ id: "live-1", ...data })
      );

      const result = await createLiveSession(
        "course-1",
        "prof-1",
        validSession
      );

      expect(result).toMatchObject({
        id: "live-1",
        title: "Session Java",
        courseId: "course-1",
      });

      expect(prismaMock.liveSession.create).toHaveBeenCalledWith({
        data: {
          ...validSession,
          startsAt: new Date(validSession.startsAt),
          courseId: "course-1",
        },
      });
    });

    it("returns null if the professor does not own the course", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      const result = await createLiveSession(
        "course-1",
        "prof-2",
        validSession
      );

      expect(result).toBeNull();
      expect(prismaMock.liveSession.create).not.toHaveBeenCalled();
    });

    it("returns a validation error for invalid data", async () => {
      const result = await createLiveSession(
        "course-1",
        "prof-1",
        { title: "AB" }
      );

      expect(result).toMatchObject({
        error: "VALIDATION_ERROR",
      });

      expect(prismaMock.course.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.liveSession.create).not.toHaveBeenCalled();
    });
  });

  describe("getLiveSessions", () => {
    it("allows a professor to retrieve sessions from their course", async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: "course-1" });
      prismaMock.liveSession.findMany.mockResolvedValue([]);

      await getLiveSessions("course-1", "prof-1", "PROFESSOR");

      expect(prismaMock.course.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "course-1",
            professorId: "prof-1",
          },
        })
      );

      expect(prismaMock.liveSession.findMany).toHaveBeenCalledWith({
        where: { courseId: "course-1" },
        orderBy: { startsAt: "asc" },
      });
    });

    it("allows students to retrieve sessions only from published courses", async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: "course-1" });
      prismaMock.liveSession.findMany.mockResolvedValue([]);

      await getLiveSessions("course-1", "student-1", "STUDENT");

      expect(prismaMock.course.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "course-1",
            status: "PUBLISHED",
          },
        })
      );
    });

    it("returns null if the course is not accessible", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      const result = await getLiveSessions(
        "course-1",
        "student-1",
        "STUDENT"
      );

      expect(result).toBeNull();
      expect(prismaMock.liveSession.findMany).not.toHaveBeenCalled();
    });
  });

  describe("updateLiveSession", () => {
    it("updates a session owned by the professor", async () => {
      prismaMock.liveSession.findFirst.mockResolvedValue({
        id: "live-1",
      });

      prismaMock.liveSession.update.mockImplementation(
        async ({ data }) => ({ id: "live-1", ...data })
      );

      const result = await updateLiveSession(
        "live-1",
        "prof-1",
        {
          title: "Session Java avancé",
          startsAt: "2026-11-06T18:00:00.000Z",
        }
      );

      expect(result).toMatchObject({
        id: "live-1",
        title: "Session Java avancé",
      });

      expect(prismaMock.liveSession.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "live-1",
            course: { professorId: "prof-1" },
          },
        })
      );

      expect(prismaMock.liveSession.update).toHaveBeenCalledWith({
        where: { id: "live-1" },
        data: {
          title: "Session Java avancé",
          startsAt: new Date("2026-11-06T18:00:00.000Z"),
        },
      });
    });

    it("returns null if the professor does not own the session", async () => {
      prismaMock.liveSession.findFirst.mockResolvedValue(null);

      const result = await updateLiveSession(
        "live-1",
        "prof-2",
        { title: "Nouvelle session" }
      );

      expect(result).toBeNull();
      expect(prismaMock.liveSession.update).not.toHaveBeenCalled();
    });

    it("returns a validation error for invalid update data", async () => {
      const result = await updateLiveSession(
        "live-1",
        "prof-1",
        {}
      );

      expect(result).toMatchObject({
        error: "VALIDATION_ERROR",
      });

      expect(prismaMock.liveSession.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.liveSession.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteLiveSession", () => {
    it("deletes a session owned by the professor", async () => {
      prismaMock.liveSession.findFirst.mockResolvedValue({
        id: "live-1",
      });

      prismaMock.liveSession.delete.mockResolvedValue({
        id: "live-1",
      });

      const result = await deleteLiveSession("live-1", "prof-1");

      expect(result).toEqual({ id: "live-1" });

      expect(prismaMock.liveSession.delete).toHaveBeenCalledWith({
        where: { id: "live-1" },
        select: { id: true },
      });
    });

    it("does not delete a session owned by another professor", async () => {
      prismaMock.liveSession.findFirst.mockResolvedValue(null);

      const result = await deleteLiveSession("live-1", "prof-2");

      expect(result).toBeNull();
      expect(prismaMock.liveSession.delete).not.toHaveBeenCalled();
    });
  });
});
