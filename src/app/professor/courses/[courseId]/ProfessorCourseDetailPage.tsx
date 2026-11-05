"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Video,
} from "lucide-react";

import {
  deleteCourse,
  deleteLesson,
  deleteLiveSession,
  getCourses,
  getLessons,
  getLiveSessions,
  updateCourse,
  type Course,
  type Lesson,
  type LiveSession,
} from "@/lib/api/courses";

import CourseModal from "@/components/professor/CourseModal";
import LessonModal from "@/components/professor/LessonModal";
import LiveSessionModal from "@/components/professor/LiveSessionModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Toast, { type ToastType } from "@/components/ui/Toast";

type Tab = "content" | "sessions";

interface ToastState {
  type: ToastType;
  message: string;
}

export default function ProfessorCourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params.courseId;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  // Modals
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);

  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<LiveSession | null>(
    null,
  );
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  function showToast(type: ToastType, message: string) {
    setToast({ type, message });
  }

  // CHARGEMENT
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const [allCourses, lessonsData, sessionsData] = await Promise.all([
          getCourses(),
          getLessons(courseId),
          getLiveSessions(courseId),
        ]);

        if (!active) return;

        const found = allCourses.find((c) => c.id === courseId);
        if (!found) {
          router.replace("/professor");
          return;
        }
        setCourse(found);

        const sortedLessons = [...lessonsData].sort(
          (a, b) => a.order - b.order,
        );
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
        if (active) {
          showToast(
            "error",
            err instanceof Error
              ? err.message
              : "Impossible de charger la formation.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [courseId, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!course) return null;

  const selectedLesson =
    lessons.find((l) => l.id === selectedLessonId) ?? null;
  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) ?? null;
  const nextLessonOrder =
    lessons.length > 0 ? Math.max(...lessons.map((l) => l.order)) + 1 : 1;

  // ---- HANDLERS FORMATION ----
  async function handleTogglePublication() {
    if (updatingStatus || !course) return;
    const nextStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    if (nextStatus === "PUBLISHED" && lessons.length === 0) {
      showToast("error", "Ajoutez au moins une leçon avant de publier.");
      return;
    }

    setUpdatingStatus(true);
    try {
      const updated = await updateCourse(course.id, { status: nextStatus });
      setCourse((c) => (c ? { ...c, ...updated } : c));
      showToast(
        "success",
        nextStatus === "PUBLISHED"
          ? "Formation publiée."
          : "Formation dépubliée.",
      );
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Erreur.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleDeleteCourse() {
    if (!course) return;
    setProcessingId(course.id);
    try {
      await deleteCourse(course.id);
      router.replace("/professor");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Impossible de supprimer.",
      );
      setProcessingId(null);
      setConfirmDeleteCourse(false);
    }
  }

  // ---- HANDLERS LEÇONS ----
  function openCreateLesson() {
    setEditingLesson(null);
    setLessonModalOpen(true);
  }
  function openEditLesson(lesson: Lesson) {
    setEditingLesson(lesson);
    setLessonModalOpen(true);
  }

  function handleLessonSaved(saved: Lesson, mode: "create" | "edit") {
    if (mode === "create") {
      const updated = [...lessons, saved].sort((a, b) => a.order - b.order);
      setLessons(updated);
      setSelectedLessonId(saved.id);
      setCourse((c) =>
        c
          ? {
              ...c,
              _count: { ...c._count, lessons: c._count.lessons + 1 },
            }
          : c,
      );
      showToast("success", "Leçon ajoutée.");
    } else {
      setLessons((current) =>
        current
          .map((l) => (l.id === saved.id ? saved : l))
          .sort((a, b) => a.order - b.order),
      );
      showToast("success", "Leçon modifiée.");
    }
    setLessonModalOpen(false);
    setEditingLesson(null);
  }

  async function handleDeleteLesson() {
    if (!lessonToDelete) return;
    const target = lessonToDelete;
    setProcessingId(target.id);
    try {
      await deleteLesson(target.id);
      setLessons((current) => current.filter((l) => l.id !== target.id));
      if (selectedLessonId === target.id) setSelectedLessonId(null);
      setCourse((c) =>
        c
          ? {
              ...c,
              _count: {
                ...c._count,
                lessons: Math.max(0, c._count.lessons - 1),
              },
            }
          : c,
      );
      showToast("success", "Leçon supprimée.");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Impossible de supprimer.",
      );
    } finally {
      setLessonToDelete(null);
      setProcessingId(null);
    }
  }

  // ---- HANDLERS SESSIONS ----
  function openCreateSession() {
    setEditingSession(null);
    setSessionModalOpen(true);
  }
  function openEditSession(session: LiveSession) {
    setEditingSession(session);
    setSessionModalOpen(true);
  }

  function handleSessionSaved(saved: LiveSession, mode: "create" | "edit") {
    if (mode === "create") {
      const updated = [...sessions, saved].sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
      setSessions(updated);
      setSelectedSessionId(saved.id);
      showToast("success", "Session programmée.");
    } else {
      setSessions((current) =>
        current
          .map((s) => (s.id === saved.id ? saved : s))
          .sort(
            (a, b) =>
              new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
          ),
      );
      showToast("success", "Session modifiée.");
    }
    setSessionModalOpen(false);
    setEditingSession(null);
  }

  async function handleDeleteSession() {
    if (!sessionToDelete) return;
    const target = sessionToDelete;
    setProcessingId(target.id);
    try {
      await deleteLiveSession(target.id);
      setSessions((current) => current.filter((s) => s.id !== target.id));
      if (selectedSessionId === target.id) setSelectedSessionId(null);
      showToast("success", "Session supprimée.");
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Impossible de supprimer.",
      );
    } finally {
      setSessionToDelete(null);
      setProcessingId(null);
    }
  }

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* BANDEAU FORMATION */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.push("/professor")}
              className="mt-1 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Retour au tableau de bord"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {course.title}
                </h1>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    course.status === "PUBLISHED"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {course.status === "PUBLISHED" ? "Publiée" : "Brouillon"}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-slate-500">
                {course.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCourseModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil size={15} />
              Modifier
            </button>

            <button
              onClick={handleTogglePublication}
              disabled={updatingStatus}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                course.status === "PUBLISHED"
                  ? "border border-amber-200 text-amber-700 hover:bg-amber-50"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {updatingStatus ? (
                <Loader2 size={15} className="animate-spin" />
              ) : course.status === "PUBLISHED" ? (
                <EyeOff size={15} />
              ) : (
                <Eye size={15} />
              )}
              {course.status === "PUBLISHED" ? "Dépublier" : "Publier"}
            </button>

            <button
              onClick={() => setConfirmDeleteCourse(true)}
              className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={15} />
              <span className="hidden sm:inline">Supprimer</span>
            </button>
          </div>
        </div>

        {/* TABS */}
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

        {/* ONGLET CONTENU */}
        {activeTab === "content" && (
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* SIDEBAR LEÇONS */}
            <aside className="rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24 lg:self-start">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Leçons ({lessons.length})
                </h2>
                <button
                  onClick={openCreateLesson}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>

              {lessons.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                  Aucune leçon. Cliquez sur « Ajouter ».
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

            {/* CONTENU LEÇON SÉLECTIONNÉE */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              {selectedLesson ? (
                <div>
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedLesson.title}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Leçon {selectedLesson.order}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditLesson(selectedLesson)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setLessonToDelete(selectedLesson)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {selectedLesson.description}
                  </p>

                  <a
                    href={selectedLesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <Video size={16} />
                    Ouvrir la vidéo
                    <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <EmptyState
                  icon={<Video size={40} className="text-slate-300" />}
                  title="Aucune leçon sélectionnée"
                  description="Ajoutez une leçon pour commencer à construire votre formation."
                  action={openCreateLesson}
                  actionLabel="Ajouter une leçon"
                />
              )}
            </section>
          </div>
        )}

        {/* ONGLET SESSIONS LIVE */}
        {activeTab === "sessions" && (
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <aside className="rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24 lg:self-start">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Sessions ({sessions.length})
                </h2>
                <button
                  onClick={openCreateSession}
                  className="flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>

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
                            {new Date(session.startsAt).toLocaleString(
                              "fr-FR",
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              },
                            )}
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
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedSession.title}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-violet-700">
                        <CalendarDays size={14} />
                        {new Date(selectedSession.startsAt).toLocaleString(
                          "fr-FR",
                          { dateStyle: "long", timeStyle: "short" },
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditSession(selectedSession)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setSessionToDelete(selectedSession)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {selectedSession.description && (
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {selectedSession.description}
                    </p>
                  )}

                  <a
                    href={selectedSession.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    <Video size={16} />
                    Rejoindre la visioconférence
                    <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <EmptyState
                  icon={<CalendarDays size={40} className="text-slate-300" />}
                  title="Aucune session sélectionnée"
                  description="Programmez une session Live pour interagir avec vos étudiants."
                  action={openCreateSession}
                  actionLabel="Programmer une session"
                />
              )}
            </section>
          </div>
        )}
      </main>

      {/* MODALS */}
      {courseModalOpen && (
        <CourseModal
          course={course}
          onSuccess={(updated) => {
            setCourse((c) => (c ? { ...c, ...updated } : c));
            setCourseModalOpen(false);
            showToast("success", "Formation mise à jour.");
          }}
          onClose={() => setCourseModalOpen(false)}
        />
      )}

      {lessonModalOpen && (
        <LessonModal
          key={editingLesson?.id ?? "new-lesson"}
          course={course}
          lesson={editingLesson}
          nextOrder={nextLessonOrder}
          onSuccess={handleLessonSaved}
          onClose={() => {
            setLessonModalOpen(false);
            setEditingLesson(null);
          }}
        />
      )}

      {sessionModalOpen && (
        <LiveSessionModal
          key={editingSession?.id ?? "new-session"}
          course={course}
          session={editingSession}
          onSuccess={handleSessionSaved}
          onClose={() => {
            setSessionModalOpen(false);
            setEditingSession(null);
          }}
        />
      )}

      {lessonToDelete && (
        <ConfirmDialog
          title="Supprimer cette leçon ?"
          message="Cette action est définitive."
          itemName={lessonToDelete.title}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          loading={processingId === lessonToDelete.id}
          onConfirm={handleDeleteLesson}
          onCancel={() => setLessonToDelete(null)}
        />
      )}

      {sessionToDelete && (
        <ConfirmDialog
          title="Supprimer cette session Live ?"
          message="Cette action est définitive."
          itemName={sessionToDelete.title}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          loading={processingId === sessionToDelete.id}
          onConfirm={handleDeleteSession}
          onCancel={() => setSessionToDelete(null)}
        />
      )}

      {confirmDeleteCourse && (
        <ConfirmDialog
          title="Supprimer cette formation ?"
          message="La formation, ses leçons et ses sessions Live seront définitivement supprimées."
          itemName={course.title}
          confirmLabel="Supprimer définitivement"
          cancelLabel="Annuler"
          loading={processingId === course.id}
          onConfirm={handleDeleteCourse}
          onCancel={() => setConfirmDeleteCourse(false)}
        />
      )}
    </>
  );
}

/* ---------- Composant utilitaire ---------- */
function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      <button
        onClick={action}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <Plus size={16} />
        {actionLabel}
      </button>
    </div>
  );
}