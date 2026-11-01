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
      _count: {
        select: {
          lessons: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return courses;
}




export async function getPublishedCourses() {
  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
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
      _count: {
        select: {
          lessons: true,
        },
      },
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
      _count: {
        select: {
          lessons: true,
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
  const validation = updateCourseSchema.safeParse(input);

  if (!validation.success) {
    throw new Error("Données du cours invalides.");
  }

  const existingCourse = await prisma.course.findFirst({
    where: {
      id: courseId,
      professorId,
    },
    select: {
      id: true,
      _count: {
        select: {
          lessons: true,
        },
      },
    },
  });

  if (!existingCourse) {
    return null;
  }

  const { coverImageUrl, ...data } = validation.data;

  if (
    data.status === "PUBLISHED" &&
    existingCourse._count.lessons === 0
  ) {
    throw new Error(
      "Impossible de publier une formation sans au moins une leçon."
    );
  }

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