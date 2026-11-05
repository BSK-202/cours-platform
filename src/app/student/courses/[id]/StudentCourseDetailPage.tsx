"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ExternalLink,
  Loader2,
  PlayCircle,
  RefreshCw,
  Video,
} from "lucide-react";

import {
  getCourses,
  getLessons,
  getLiveSessions,
  type Course,
  type Lesson,
  type LiveSession,
} from "@/lib/api/courses";

type Tab = "content" | "sessions";

interface Props {
  courseId: string;
}

/* ---------- Helpers vidéo ---------- */
function getSafeUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
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
  return url ? /\.(mp4|webm|ogg|mov)$/i.test(url.pathname) : false;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date non disponible";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function LessonVideo({ url }: { url: string }) {
  const embed = getVideoEmbedUrl(url);
  const direct = isDirectVideo(url);
  const safe = getSafeUrl(url);

  if (embed) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl bg-slate-950">
        <iframe
          src={embed}
          title="Vidéo de la leçon"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }
  if (direct && safe) {
    return (
      <div className="overflow-hidden rounded-xl bg-slate-950 p-3">
        <video
          controls
          preload="metadata"
          className="mx-auto max-h-[480px] w-full"
        >
          <source src={safe.href} />
          Votre navigateur ne prend pas en charge la lecture vidéo.
        </video>
      </div>
    );
  }
  if (safe) {
    return (
      <a
        href={safe.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        <PlayCircle size={16} />
        Accéder à la vidéo
        <ExternalLink size={16} />
      </a>
    );
  }
  return (
    <p className="text-sm text-amber-700">
      Le lien vidéo de cette leçon n'est pas valide.
    </p>
  );
}

/* ---------- Composant principal ---------- */
export default function StudentCourseDetailPage({ courseId }: Props) {
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // ✅ getCourses() au lieu de getCourseById() — même endpoint que les
      // dashboards, fonctionne pour PROFESSOR et STUDENT.
      const [allCourses, lessonsData, sessionsData] = await Promise.all([
        getCourses(),
        getLessons(courseId),
        getLiveSessions(courseId),
      ]);

      const found = allCourses.find((c) => c.id === courseId);
      if (!found) {
        setError("Cette formation n'existe pas ou n'est plus disponible.");
        return;
      }
      if (found.status !== "PUBLISHED") {
        setError("Cette formation n'est pas encore publiée.");
        return;
      }

      setCourse(found);

      const sortedLessons = [...lessonsData].sort((a, b) => a.order - b.order);
      setLessons(sortedLessons);
      if (sortedLessons.length > 0) setSelectedLessonId(sortedLessons[0].id);

      const sortedSessions = [...sessionsData].sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
      setSessions(sortedSessions);
      if (sortedSessions.length > 0)
        setSelectedSessionId(sortedSessions[0].id);
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
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Chargement de la formation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Formation indisponible
          </h1>
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error || "Cette formation n'existe pas ou n'est plus disponible."}
          </p>
          <button
            onClick={load}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
          <button
            onClick={() => router.push("/student")}
            className="mt-4 block w-full text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  const selectedLesson =
    lessons.find((l) => l.id === selectedLessonId) ?? null;
  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) ?? null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Bandeau formation */}
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.push("/student")}
            className="mt-1 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Retour au catalogue"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {course.title}
              </h1>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Publiée
              </span>
            </div>
            <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-slate-500">
              {course.description}
            </p>
          </div>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={15} />
          Actualiser
        </button>
      </div>

      {/* Tabs */}
      <nav className="mb-6 flex gap-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-semibold transition ${
            activeTab === "content"
              ? "border-b-2 border-indigo-600 text-indigo-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <BookOpen size={16} />
          Contenu
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-semibold transition ${
            activeTab === "sessions"
              ? "border-b-2 border-violet-600 text-violet-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Video size={16} />
          Sessions Live
        </button>
      </nav>

      {/* Contenu */}
      {activeTab === "content" && (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-3 text-sm font-bold text-slate-900">
              Leçons ({lessons.length})
            </h2>
            {lessons.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                Aucune leçon disponible.
              </p>
            ) : (
              <ul className="space-y-1">
                {lessons.map((lesson, index) => {
                  const isActive = lesson.id === selectedLessonId;
                  return (
                    <li key={lesson.id}>
                      <button
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${
                            isActive
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="line-clamp-2 font-medium">
                          {lesson.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            {selectedLesson ? (
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedLesson.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Leçon {selectedLesson.order}
                </p>
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {selectedLesson.description}
                </p>
                <div className="mt-5">
                  <LessonVideo url={selectedLesson.videoUrl} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Video size={40} className="text-slate-300" />
                <h3 className="mt-4 font-semibold text-slate-900">
                  Aucune leçon sélectionnée
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Choisissez une leçon dans la liste de gauche.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Sessions */}
      {activeTab === "sessions" && (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-3 text-sm font-bold text-slate-900">
              Sessions ({sessions.length})
            </h2>
            {sessions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                Aucune session programmée.
              </p>
            ) : (
              <ul className="space-y-1">
                {sessions.map((session) => {
                  const isActive = session.id === selectedSessionId;
                  return (
                    <li key={session.id}>
                      <button
                        onClick={() => setSelectedSessionId(session.id)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                          isActive
                            ? "bg-violet-50 text-violet-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <p className="line-clamp-1 font-medium">
                          {session.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {new Date(session.startsAt).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            {selectedSession ? (
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedSession.title}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-violet-700">
                  <CalendarDays size={14} />
                  {formatDate(selectedSession.startsAt)}
                </p>
                {selectedSession.description && (
                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {selectedSession.description}
                  </p>
                )}
                {(() => {
                  const meetingUrl = getSafeUrl(selectedSession.meetingUrl);
                  return meetingUrl ? (
                    <a
                      href={meetingUrl.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      <ExternalLink size={16} />
                      Rejoindre le Live
                    </a>
                  ) : (
                    <p className="mt-4 text-sm text-amber-700">
                      Le lien de cette session n'est pas valide.
                    </p>
                  );
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays size={40} className="text-slate-300" />
                <h3 className="mt-4 font-semibold text-slate-900">
                  Aucune session sélectionnée
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Choisissez une session dans la liste de gauche.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}