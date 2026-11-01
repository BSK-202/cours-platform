
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    course: {
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
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../course.service";

describe("course.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCourse", () => {
    const validInput = {
      title: "Introduction à Java",
      description: "Découvrir les bases du langage Java.",
      coverImageUrl: "https://example.com/cover.jpg",
    };

    it("creates a course with DRAFT status and the professor ID", async () => {
      prismaMock.course.create.mockResolvedValue({
        id: "course-1",
        ...validInput,
        status: "DRAFT",
        professorId: "prof-1",
      });

      await createCourse(validInput, "prof-1");

      expect(prismaMock.course.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: validInput.title,
            professorId: "prof-1",
            status: "DRAFT",
          }),
        })
      );
    });

    it("rejects invalid course data", async () => {
      await expect(
        createCourse({ title: "AB" }, "prof-1")
      ).rejects.toThrow("Données du cours invalides.");

      expect(prismaMock.course.create).not.toHaveBeenCalled();
    });

    it("stores an empty cover image as null", async () => {
      prismaMock.course.create.mockResolvedValue({ id: "course-1" });

      await createCourse(
        {
          title: "Introduction à Java",
          description: "Découvrir les bases du langage Java.",
          coverImageUrl: "",
        },
        "prof-1"
      );

      expect(prismaMock.course.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            coverImageUrl: null,
          }),
        })
      );
    });
  });

  describe("getCourses", () => {
    it("returns only the professor's courses", async () => {
      prismaMock.course.findMany.mockResolvedValue([]);

      await getCourses("prof-1", "PROFESSOR");

      expect(prismaMock.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { professorId: "prof-1" },
        })
      );
    });

    it("returns only published courses for students", async () => {
      prismaMock.course.findMany.mockResolvedValue([]);

      await getCourses("student-1", "STUDENT");

      expect(prismaMock.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "PUBLISHED" },
        })
      );
    });
  });

  describe("getCourseById", () => {
    it("allows a professor to retrieve their own course", async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: "course-1" });

      await getCourseById("course-1", "prof-1", "PROFESSOR");

      expect(prismaMock.course.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "course-1",
            professorId: "prof-1",
          },
        })
      );
    });

    it("allows students to retrieve published courses only", async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: "course-1" });

      await getCourseById("course-1", "student-1", "STUDENT");

      expect(prismaMock.course.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "course-1",
            status: "PUBLISHED",
          },
        })
      );
    });

    it("returns null when the course is not accessible", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      const result = await getCourseById(
        "course-1",
        "student-1",
        "STUDENT"
      );

      expect(result).toBeNull();
    });
  });

  describe("updateCourse", () => {
    it("updates a course belonging to the professor", async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: "course-1" });
      prismaMock.course.update.mockResolvedValue({
        id: "course-1",
        title: "Java avancé",
      });

      await updateCourse(
        "course-1",
        "prof-1",
        { title: "Java avancé" }
      );

      expect(prismaMock.course.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "course-1",
            professorId: "prof-1",
          },
        })
      );

      expect(prismaMock.course.update).toHaveBeenCalled();
    });

    it("returns null if the professor does not own the course", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      const result = await updateCourse(
        "course-1",
        "prof-2",
        { title: "Java avancé" }
      );

      expect(result).toBeNull();
      expect(prismaMock.course.update).not.toHaveBeenCalled();
    });

    it("rejects invalid update data", async () => {
      await expect(
        updateCourse("course-1", "prof-1", {})
      ).rejects.toThrow("Données du cours invalides.");

      expect(prismaMock.course.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.course.update).not.toHaveBeenCalled();
    });

    it("converts an empty cover image to null", async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: "course-1" });
      prismaMock.course.update.mockResolvedValue({ id: "course-1" });

      await updateCourse(
        "course-1",
        "prof-1",
        { coverImageUrl: "" }
      );

      expect(prismaMock.course.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { coverImageUrl: null },
        })
      );
    });
  });

  describe("deleteCourse", () => {
    it("deletes a course belonging to the professor", async () => {
      prismaMock.course.findFirst.mockResolvedValue({ id: "course-1" });
      prismaMock.course.delete.mockResolvedValue({ id: "course-1" });

      const result = await deleteCourse("course-1", "prof-1");

      expect(result).toEqual({ id: "course-1" });
      expect(prismaMock.course.delete).toHaveBeenCalledWith({
        where: { id: "course-1" },
      });
    });

    it("does not delete a course owned by another professor", async () => {
      prismaMock.course.findFirst.mockResolvedValue(null);

      const result = await deleteCourse("course-1", "prof-2");

      expect(result).toBeNull();
      expect(prismaMock.course.delete).not.toHaveBeenCalled();
    });
  });
});
