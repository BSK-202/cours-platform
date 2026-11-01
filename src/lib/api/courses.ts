
export type CourseStatus = "DRAFT" | "PUBLISHED";

export interface Course {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  status: CourseStatus;
  professorId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    lessons: number;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  order: number;
}

export interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  meetingUrl: string;
  courseId: string;
}

export interface CourseInput {
  title: string;
  description: string;
  coverImageUrl?: string;
}

export interface LessonInput {
  title: string;
  description: string;
  videoUrl: string;
  order: number;
}

export interface LiveSessionInput {
  title: string;
  description?: string;
  startsAt: string;
  meetingUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  details?: unknown;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(endpoint, {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Impossible de contacter le serveur.");
  }

  let result: ApiResponse<T>;

  try {
    result = await response.json();
  } catch {
    throw new Error("La réponse du serveur est invalide.");
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Une erreur est survenue. Réessayez.",
    );
  }

  return result.data as T;
}

// FORMATIONS

export async function getCourses(): Promise<Course[]> {
  return apiRequest<Course[]>("/api/courses");
}

export async function getCourseById(courseId: string): Promise<Course> {
  return apiRequest<Course>(`/api/courses/${courseId}`);
}

export async function createCourse(input: CourseInput): Promise<Course> {
  return apiRequest<Course>("/api/courses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCourse(
  id: string,
  input: Partial<CourseInput> & { status?: CourseStatus },
): Promise<Course> {
  return apiRequest<Course>(`/api/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteCourse(id: string): Promise<void> {
  await apiRequest(`/api/courses/${id}`, {
    method: "DELETE",
  });
}

// LEÇONS

export async function getLessons(courseId: string): Promise<Lesson[]> {
  return apiRequest<Lesson[]>(`/api/courses/${courseId}/lessons`);
}

export async function createLesson(
  courseId: string,
  input: LessonInput,
): Promise<Lesson> {
  return apiRequest<Lesson>(`/api/courses/${courseId}/lessons`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateLesson(
  id: string,
  input: Partial<LessonInput>,
): Promise<Lesson> {
  return apiRequest<Lesson>(`/api/lessons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteLesson(id: string): Promise<void> {
  await apiRequest(`/api/lessons/${id}`, {
    method: "DELETE",
  });
}

// SESSIONS LIVE

export async function getLiveSessions(
  courseId: string,
): Promise<LiveSession[]> {
  return apiRequest<LiveSession[]>(
    `/api/courses/${courseId}/live-sessions`,
  );
}

export async function createLiveSession(
  courseId: string,
  input: LiveSessionInput,
): Promise<LiveSession> {
  return apiRequest<LiveSession>(
    `/api/courses/${courseId}/live-sessions`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function updateLiveSession(
  id: string,
  input: Partial<LiveSessionInput>,
): Promise<LiveSession> {
  return apiRequest<LiveSession>(`/api/live-sessions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteLiveSession(id: string): Promise<void> {
  await apiRequest(`/api/live-sessions/${id}`, {
    method: "DELETE",
  });
}
