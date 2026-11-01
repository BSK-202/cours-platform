import { prisma } from "@/lib/prisma";
import { createCourseSchema } from "@/lib/validations/course.schema";
import { updateCourseSchema } from "@/lib/validations/course.schema";

export async function createCourse(
  input: unknown,
  professorId: string
) {
  const validation = createCourseSchema.safeParse(input);

  if (!validation.success) {
    throw new Error("Données du cours invalides.");
  }

  const { title, description, coverImageUrl } = validation.data;

  const course = await prisma.course.create({
    data: {
      title,
      description,
      coverImageUrl: coverImageUrl || null,
      professorId,
      status: "DRAFT",
    },
    select: {
      id: true,
      title: true,
      description: true,
      coverImageUrl: true,
      status: true,
      professorId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return course;
}

export async function getCourses(
  userId: string,
  role: "PROFESSOR" | "STUDENT"
) {
  const where =
    role === "PROFESSOR"
      ? { professorId: userId }
      : { status: "PUBLISHED" as const };

  const courses = await prisma.course.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      coverImageUrl: true,
      status: true,
      professorId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return courses;
}


export async function getCourseById(
  courseId: string,
  userId: string,
  role: "PROFESSOR" | "STUDENT"
) {
  const where = {
    id: courseId,
    ...(role === "PROFESSOR"
      ? { professorId: userId }
      : { status: "PUBLISHED" as const }),
  };

  const course = await prisma.course.findFirst({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      coverImageUrl: true,
      status: true,
      professorId: true,
      createdAt: true,
      updatedAt: true,
      lessons: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          videoUrl: true,
          order: true,
        },
      },
    },
  });

  return course;
}

export async function updateCourse(
  courseId: string,
  professorId: string,
  input: unknown
) {
  // 1. Valider les données reçues
  const validation = updateCourseSchema.safeParse(input);

  if (!validation.success) {
    throw new Error("Données du cours invalides.");
  }

  // 2. Vérifier que le cours appartient au professeur
  const existingCourse = await prisma.course.findFirst({
    where: {
      id: courseId,
      professorId,
    },
    select: {
      id: true,
    },
  });

  if (!existingCourse) {
    return null;
  }

  // 3. Préparer les données modifiables
  const { coverImageUrl, ...data } = validation.data;

  const updatedCourse = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      ...data,
      ...(coverImageUrl !== undefined && {
        coverImageUrl: coverImageUrl || null,
      }),
    },
    select: {
      id: true,
      title: true,
      description: true,
      coverImageUrl: true,
      status: true,
      professorId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedCourse;
}

export async function deleteCourse(
  courseId: string,
  professorId: string
) {
  // 1. Vérifier que le cours appartient au professeur
  const existingCourse = await prisma.course.findFirst({
    where: {
      id: courseId,
      professorId,
    },
    select: {
      id: true,
    },
  });

  if (!existingCourse) {
    return null;
  }

  // 2. Supprimer le cours
  await prisma.course.delete({
    where: {
      id: courseId,
    },
  });

  return {
    id: courseId,
  };
}