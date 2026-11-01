
import { prisma } from "@/lib/prisma";
import {
  createLiveSessionSchema,
  updateLiveSessionSchema,
} from "@/lib/validations/live-session.schema";
import type {
  CreateLiveSessionInput,
  UpdateLiveSessionInput,
} from "@/lib/validations/live-session.schema";

export async function createLiveSession(
  courseId: string,
  professorId: string,
  input: unknown
) {
  const parsed = createLiveSessionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "VALIDATION_ERROR" as const,
      details: parsed.error.flatten(),
    };
  }

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      professorId,
    },
    select: { id: true },
  });

  if (!course) return null;

  const data: CreateLiveSessionInput = parsed.data;

  return prisma.liveSession.create({
    data: {
      ...data,
      startsAt: new Date(data.startsAt),
      courseId,
    },
  });
}

export async function getLiveSessions(
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
    select: { id: true },
  });

  if (!course) return null;

  return prisma.liveSession.findMany({
    where: { courseId },
    orderBy: { startsAt: "asc" },
  });
}

export async function updateLiveSession(
  liveSessionId: string,
  professorId: string,
  input: unknown
) {
  const parsed = updateLiveSessionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "VALIDATION_ERROR" as const,
      details: parsed.error.flatten(),
    };
  }

  const liveSession = await prisma.liveSession.findFirst({
    where: {
      id: liveSessionId,
      course: { professorId },
    },
    select: { id: true },
  });

  if (!liveSession) return null;

  const data: UpdateLiveSessionInput = parsed.data;

  return prisma.liveSession.update({
    where: { id: liveSessionId },
    data: {
      ...data,
      ...(data.startsAt !== undefined
        ? { startsAt: new Date(data.startsAt) }
        : {}),
    },
  });
}

export async function deleteLiveSession(
  liveSessionId: string,
  professorId: string
) {
  const liveSession = await prisma.liveSession.findFirst({
    where: {
      id: liveSessionId,
      course: { professorId },
    },
    select: { id: true },
  });

  if (!liveSession) return null;

  return prisma.liveSession.delete({
    where: { id: liveSessionId },
    select: { id: true },
  });
}
