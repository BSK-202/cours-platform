
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    course: {
      findFirst: vi.fn(),
    },
    lesson: {
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
  createLesson,
  getLessons,
  updateLesson,
  deleteLesson,
} from "../lesson.service";

describe("lesson.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validLesson = {
    title: "Introduction à Java",
    description: "Découvrir les bases du langage Java.",
    videoUrl: "https://example.com/video",
    order: 1,
  };

  describe("createLesson", () => {
    it("creates a lesson for a course owned by the professor", async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: "course-1" });
      prismaMock.lesson.create.mockResolvedValue({
        id: "lesson-1",
        ...validLesson,
        courseId: "course-1",
      });

      const result = await createLesson(
        "course-1",
        "prof-1",
        validLesson
      );

      expect(result).toMatchObject({
        id: "lesson-1",
        courseId: "course-1",
      });

      expect(prismaMock.course.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "course-1",
            professorId: "prof-1",
          },
        })
      );

      expect(prismaMock.lesson.create).toHaveBeenCalledWith({
        data: {
          ...validLesson,
          courseId: "course-1",
        },
      });
    });

    it("returns null if the professor does not own the course", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      const result = await createLesson(
        "course-1",
        "prof-2",
        validLesson
      );

      expect(result).toBeNull();
      expect(prismaMock.lesson.create).not.toHaveBeenCalled();
    });

    it("returns a validation error for invalid data", async () => {
      const result = await createLesson(
        "course-1",
        "prof-1",
        { title: "AB" }
      );

      expect(result).toMatchObject({
        error: "VALIDATION_ERROR",
      });

      expect(prismaMock.course.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.lesson.create).not.toHaveBeenCalled();
    });
  });

  describe("getLessons", () => {
    it("allows a professor to retrieve lessons from their course", async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: "course-1" });
      prismaMock.lesson.findMany.mockResolvedValue([]);

      await getLessons("course-1", "prof-1", "PROFESSOR");

      expect(prismaMock.course.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "course-1",
            professorId: "prof-1",
          },
        })
      );

      expect(prismaMock.lesson.findMany).toHaveBeenCalledWith({
        where: { courseId: "course-1" },
        orderBy: { order: "asc" },
      });
    });

    it("allows students to retrieve lessons only from published courses", async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: "course-1" });
      prismaMock.lesson.findMany.mockResolvedValue([]);

      await getLessons("course-1", "student-1", "STUDENT");

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

      const result = await getLessons(
        "course-1",
        "student-1",
        "STUDENT"
      );

      expect(result).toBeNull();
      expect(prismaMock.lesson.findMany).not.toHaveBeenCalled();
    });
  });

  describe("updateLesson", () => {
    it("updates a lesson owned by the professor", async () => {
      prismaMock.lesson.findFirst.mockResolvedValue({ id: "lesson-1" });
      prismaMock.lesson.update.mockResolvedValue({
        id: "lesson-1",
        title: "Java avancé",
      });

      const result = await updateLesson(
        "lesson-1",
        "prof-1",
        { title: "Java avancé" }
      );

      expect(result).toMatchObject({
        id: "lesson-1",
        title: "Java avancé",
      });

      expect(prismaMock.lesson.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "lesson-1",
            course: {
              professorId: "prof-1",
            },
          },
        })
      );

      expect(prismaMock.lesson.update).toHaveBeenCalled();
    });

    it("returns null if the professor does not own the lesson", async () => {
      prismaMock.lesson.findFirst.mockResolvedValue(null);

      const result = await updateLesson(
        "lesson-1",
        "prof-2",
        { title: "Java avancé" }
      );

      expect(result).toBeNull();
      expect(prismaMock.lesson.update).not.toHaveBeenCalled();
    });

    it("returns a validation error for invalid update data", async () => {
      const result = await updateLesson(
        "lesson-1",
        "prof-1",
        {}
      );

      expect(result).toMatchObject({
        error: "VALIDATION_ERROR",
      });

      expect(prismaMock.lesson.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.lesson.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteLesson", () => {
    it("deletes a lesson owned by the professor", async () => {
      prismaMock.lesson.findFirst.mockResolvedValue({ id: "lesson-1" });
      prismaMock.lesson.delete.mockResolvedValue({ id: "lesson-1" });

      const result = await deleteLesson("lesson-1", "prof-1");

      expect(result).toEqual({ id: "lesson-1" });

      expect(prismaMock.lesson.delete).toHaveBeenCalledWith({
        where: { id: "lesson-1" },
      });
    });

    it("does not delete a lesson owned by another professor", async () => {
      prismaMock.lesson.findFirst.mockResolvedValue(null);

      const result = await deleteLesson("lesson-1", "prof-2");

      expect(result).toBeNull();
      expect(prismaMock.lesson.delete).not.toHaveBeenCalled();
    });
  });
});
