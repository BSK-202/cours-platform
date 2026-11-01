import { prisma } from "@/lib/prisma";
import {
  createLessonSchema,
  updateLessonSchema,
} from "@/lib/validations/lesson.schema";

// 1. Créer une leçon
export async function createLesson(
  courseId: string,
  professorId: string,
  input: unknown
) {
  const parsed = createLessonSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    };
  }

  // Vérifier que le cours appartient au professeur
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      professorId,
    },
    select: {
      id: true,
    },
  });

  if (!course) {
    return null;
  }

  const lesson = await prisma.lesson.create({
    data: {
      ...parsed.data,
      courseId,
    },
  });

  return lesson;
}

// 2. Récupérer les leçons d'un cours
export async function getLessons(
  courseId: string,
  userId: string,
  role: "PROFESSOR" | "STUDENT"
) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      ...(role === "PROFESSOR"
        ? { professorId: userId }
        : { status: "PUBLISHED" }),
    },
    select: {
      id: true,
    },
  });

  if (!course) {
    return null;
  }

  return prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });
}

// 3. Modifier une leçon
export async function updateLesson(
  lessonId: string,
  professorId: string,
  input: unknown
) {
  const parsed = updateLessonSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    };
  }

  const existingLesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      course: {
        professorId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!existingLesson) {
    return null;
  }

  return prisma.lesson.update({
    where: { id: lessonId },
    data: parsed.data,
  });
}

// 4. Supprimer une leçon
export async function deleteLesson(
  lessonId: string,
  professorId: string
) {
  const existingLesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      course: {
        professorId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!existingLesson) {
    return null;
  }

  await prisma.lesson.delete({
    where: { id: lessonId },
  });

  return { id: lessonId };
}