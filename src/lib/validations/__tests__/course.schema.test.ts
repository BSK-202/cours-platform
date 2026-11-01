import { describe, it, expect } from "vitest";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../course.schema";

describe("createCourseSchema", () => {
  it("accepts valid course data", () => {
    const result = createCourseSchema.safeParse({
      title: "Introduction à Java",
      description: "Apprendre les fondamentaux du langage Java.",
      coverImageUrl: "https://example.com/cover.jpg",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a course without a cover image", () => {
    const result = createCourseSchema.safeParse({
      title: "Introduction à Java",
      description: "Apprendre les fondamentaux du langage Java.",
    });

    expect(result.success).toBe(true);
  });

  it("accepts an empty cover image URL", () => {
    const result = createCourseSchema.safeParse({
      title: "Introduction à Java",
      description: "Apprendre les fondamentaux du langage Java.",
      coverImageUrl: "",
    });

    expect(result.success).toBe(true);
  });

  it("trims title and description", () => {
    const result = createCourseSchema.safeParse({
      title: "  Java  ",
      description: "  Apprendre les fondamentaux de Java.  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.title).toBe("Java");
      expect(result.data.description).toBe("Apprendre les fondamentaux de Java.");
    }
  });

  it("rejects a title shorter than 3 characters", () => {
    const result = createCourseSchema.safeParse({
      title: "JS",
      description: "Apprendre les fondamentaux de Java.",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a description shorter than 10 characters", () => {
    const result = createCourseSchema.safeParse({
      title: "Java",
      description: "Court",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid cover image URL", () => {
    const result = createCourseSchema.safeParse({
      title: "Java",
      description: "Apprendre les fondamentaux de Java.",
      coverImageUrl: "not-a-url",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateCourseSchema", () => {
  it("accepts a partial update", () => {
    const result = updateCourseSchema.safeParse({
      title: "Java avancé",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty update object", () => {
    const result = updateCourseSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("rejects unknown fields such as professorId and status", () => {
    const result = updateCourseSchema.safeParse({
      title: "Java avancé",
      professorId: "another-user-id",
      status: "PUBLISHED",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an update with a title shorter than 3 characters", () => {
    const result = updateCourseSchema.safeParse({
      title: "JS",
    });

    expect(result.success).toBe(false);
  });
});
