import { describe, it, expect } from "vitest";
import {
  createLessonSchema,
  updateLessonSchema,
} from "../lesson.schema";

describe("createLessonSchema", () => {
  const validLesson = {
    title: "Introduction à Java",
    description: "Présentation des fondamentaux du langage Java.",
    videoUrl: "https://example.com/java-intro.mp4",
    order: 1,
  };

  it("accepts valid lesson data", () => {
    expect(createLessonSchema.safeParse(validLesson).success).toBe(true);
  });

  it("trims title, description and videoUrl", () => {
    const result = createLessonSchema.safeParse({
      ...validLesson,
      title: "  Java  ",
      description: "  Présentation des fondamentaux de Java.  ",
      videoUrl: "  https://example.com/java.mp4  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.title).toBe("Java");
      expect(result.data.description).toBe("Présentation des fondamentaux de Java.");
      expect(result.data.videoUrl).toBe("https://example.com/java.mp4");
    }
  });

  it("rejects a title shorter than 3 characters", () => {
    expect(
      createLessonSchema.safeParse({ ...validLesson, title: "JS" }).success
    ).toBe(false);
  });

  it("rejects a description shorter than 10 characters", () => {
    expect(
      createLessonSchema.safeParse({ ...validLesson, description: "Court" }).success
    ).toBe(false);
  });

  it("rejects an invalid video URL", () => {
    expect(
      createLessonSchema.safeParse({ ...validLesson, videoUrl: "not-a-url" }).success
    ).toBe(false);
  });

  it("rejects an order equal to zero", () => {
    expect(
      createLessonSchema.safeParse({ ...validLesson, order: 0 }).success
    ).toBe(false);
  });

  it("rejects a decimal order", () => {
    expect(
      createLessonSchema.safeParse({ ...validLesson, order: 1.5 }).success
    ).toBe(false);
  });
});

describe("updateLessonSchema", () => {
  it("accepts a partial update", () => {
    expect(
      updateLessonSchema.safeParse({ title: "Java avancé" }).success
    ).toBe(true);
  });

  it("rejects an empty update object", () => {
    expect(updateLessonSchema.safeParse({}).success).toBe(false);
  });

  it("rejects unknown fields such as courseId", () => {
    expect(
      updateLessonSchema.safeParse({
        title: "Java avancé",
        courseId: "another-course-id",
      }).success
    ).toBe(false);
  });

  it("rejects an invalid order", () => {
    expect(updateLessonSchema.safeParse({ order: 0 }).success).toBe(false);
  });

  it("rejects an invalid video URL", () => {
    expect(updateLessonSchema.safeParse({ videoUrl: "invalid-url" }).success).toBe(false);
  });
});

