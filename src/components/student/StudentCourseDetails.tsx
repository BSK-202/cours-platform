
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock,
  ExternalLink,
  GraduationCap,
  Loader2,
  PlayCircle,
  RefreshCw,
  Video,
} from "lucide-react";

import {
  getCourseById,
  getLessons,
  getLiveSessions,
  type Course,
  type Lesson,
  type LiveSession,
} from "@/lib/api/courses";

interface StudentCourseDetailsProps {
  courseId: string;
}

function getSafeUrl(value: string): URL | null {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function getVideoEmbedUrl(value: string): string | null {
  const url = getSafeUrl(value);

  if (!url) return null;

  const host = url.hostname.toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.slice(1);

    return id
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`
      : null;
  }

  if (
    host === "youtube.com" ||
    host === "www.youtube.com" ||
    host === "m.youtube.com"
  ) {
    const id = url.searchParams.get("v");

    return id
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`
      : null;
  }

  if (host === "vimeo.com" || host === "www.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];

    return id && /^\d+$/.test(id)
      ? `https://player.vimeo.com/video/${id}`
      : null;
  }

  return null;
}

function isDirectVideo(value: string): boolean {
  const url = getSafeUrl(value);

  if (!url) return false;

  return /\.(mp4|webm|ogg|mov)$/i.test(url.pathname);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date non disponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export default function StudentCourseDetails({
  courseId,
}: StudentCourseDetailsProps) {
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourseDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [courseData, lessonsData, liveData] = await Promise.all([
        getCourseById(courseId),
        getLessons(courseId),
        getLiveSessions(courseId),
      ]);

      setCourse(courseData);

      setLessons(
        [...lessonsData].sort((a, b) => a.order - b.order),
      );

      setLiveSessions(
        [...liveData].sort(
          (a, b) =>
            new Date(a.startsAt).getTime() -
            new Date(b.startsAt).getTime(),
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger cette formation.",
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourseDetails();
  }, [loadCourseDetails]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Chargement de la formation...
          </p>
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Formation indisponible
          </h1>

          <p role="alert" className="mt-2 text-sm text-red-600">
            {error || "Cette formation n'existe pas ou n'est plus disponible."}
          </p>

          <button
            onClick={loadCourseDetails}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>

          <button
            onClick={() => router.push("/student")}
            className="mt-4 block w-full text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Retour au catalogue
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-slate-900">
              Ikrame BASKANE
            </span>
          </div>

          <button
            onClick={() => router.push("/student")}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Mon espace
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/student")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux formations
        </button>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {course.coverImageUrl ? (
            <img
              src={course.coverImageUrl}
              alt={course.title}
              className="h-56 w-full object-cover sm:h-72"
            />
          ) : (
            <div className="flex h-56 items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 sm:h-72">
              <BookOpen className="h-20 w-20 text-indigo-400" />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Formation publiée
            </span>

            <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              {course.title}
            </h1>

            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
              {course.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-5 border-t border-slate-100 pt-5 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                {lessons.length} leçon(s)
              </span>

              <span className="flex items-center gap-2">
                <Video className="h-4 w-4 text-indigo-600" />
                {liveSessions.length} session(s) Live
              </span>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Contenu de la formation
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Retrouvez les leçons et leurs supports vidéo.
            </p>
          </div>

          {lessons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-medium text-slate-700">
                Aucune leçon disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {lessons.map((lesson, index) => {
                const embedUrl = getVideoEmbedUrl(lesson.videoUrl);
                const safeUrl = getSafeUrl(lesson.videoUrl);
                const directVideo = isDirectVideo(lesson.videoUrl);

                return (
                  <article
                    key={lesson.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-slate-900">
                            {lesson.title}
                          </h3>

                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">
                            {lesson.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {embedUrl ? (
                      <div className="aspect-video bg-slate-950">
                        <iframe
                          src={embedUrl}
                          title={lesson.title}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      </div>
                    ) : directVideo && safeUrl ? (
                      <div className="bg-slate-950 p-3">
                        <video
                          controls
                          preload="metadata"
                          className="mx-auto max-h-[480px] w-full"
                        >
                          <source src={safeUrl.href} />
                          Votre navigateur ne prend pas en charge la lecture vidéo.
                        </video>
                      </div>
                    ) : (
                      <div className="border-t border-slate-100 bg-slate-50 p-5">
                        {safeUrl ? (
                          <a
                            href={safeUrl.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                          >
                            <PlayCircle className="h-4 w-4" />
                            Accéder à la vidéo
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <p className="text-sm text-amber-700">
                            Le lien vidéo de cette leçon n'est pas valide.
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Sessions Live
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consultez les prochaines séances et rejoignez-les à l'heure prévue.
            </p>
          </div>

          {liveSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-medium text-slate-700">
                Aucune session Live programmée.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {liveSessions.map((session) => {
                const meetingUrl = getSafeUrl(session.meetingUrl);

                return (
                  <article
                    key={session.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                        <Video className="h-6 w-6 text-violet-600" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900">
                          {session.title}
                        </h3>

                        {session.description && (
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {session.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays className="h-4 w-4 text-indigo-600" />
                      {formatDate(session.startsAt)}
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      {meetingUrl ? (
                        <a
                          href={meetingUrl.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Rejoindre le Live
                        </a>
                      ) : (
                        <p className="text-sm text-amber-700">
                          Le lien de cette session n'est pas valide.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-10 flex justify-end">
          <button
            onClick={loadCourseDetails}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser le contenu
          </button>
        </div>
      </div>
    </main>
  );
}
