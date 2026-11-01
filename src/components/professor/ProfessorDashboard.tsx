
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Video,
  Plus,
  LogOut,
  LayoutDashboard,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

import {
  getCurrentUser,
  logoutUser,
  type AuthUser,
} from "@/lib/api/auth";

import {
  getCourses,
  updateCourse,
  deleteCourse,
  type Course,
} from "@/lib/api/courses";

import CourseModal from "@/components/professor/CourseModal";
import Toast, { type ToastType } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ToastState {
  type: ToastType;
  message: string;
}

export default function ProfessorDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [processingCourseId, setProcessingCourseId] = useState<string | null>(
    null,
  );

  function showToast(type: ToastType, message: string) {
    setToast({ type, message });
  }

  function closeToast() {
    setToast(null);
  }

  async function loadDashboard() {
    setLoading(true);

    try {
      const currentUser = await getCurrentUser();

      if (currentUser.role !== "PROFESSOR") {
        router.replace("/student");
        return;
      }

      setUser(currentUser);

      const professorCourses = await getCourses();
      setCourses(professorCourses);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error
          ? err.message
          : "Impossible de charger le tableau de bord.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function openCreateModal() {
    setEditingCourse(null);
    setCourseModalOpen(true);
    closeToast();
  }

  function openEditModal(course: Course) {
    setEditingCourse(course);
    setCourseModalOpen(true);
    closeToast();
  }

  function closeCourseModal() {
    setCourseModalOpen(false);
    setEditingCourse(null);
  }

  function handleCourseSaved(
    savedCourse: Course,
    mode: "create" | "edit",
  ) {
    if (mode === "create") {
      setCourses((current) => [savedCourse, ...current]);
      showToast("success", "Votre formation a été créée avec succès.");
    } else {
      setCourses((current) =>
        current.map((course) =>
          course.id === savedCourse.id
            ? { ...course, ...savedCourse }
            : course,
        ),
      );

      showToast("success", "Votre formation a été modifiée avec succès.");
    }

    closeCourseModal();
  }

  async function handleTogglePublication(course: Course) {
    if (processingCourseId) return;

    const nextStatus =
      course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    if (nextStatus === "PUBLISHED" && course._count.lessons === 0) {
      showToast(
        "error",
        "Ajoutez au moins une leçon avant de publier cette formation.",
      );
      return;
    }

    setProcessingCourseId(course.id);
    closeToast();

    try {
      const updatedCourse = await updateCourse(course.id, {
        status: nextStatus,
      });

      setCourses((current) =>
        current.map((item) =>
          item.id === updatedCourse.id
            ? { ...item, ...updatedCourse }
            : item,
        ),
      );

      showToast(
        "success",
        nextStatus === "PUBLISHED"
          ? "Votre formation a été publiée avec succès."
          : "Votre formation a été dépubliée avec succès.",
      );
    } catch (err) {
      showToast(
        "error",
        err instanceof Error
          ? err.message
          : "Impossible de modifier le statut de la formation.",
      );
    } finally {
      setProcessingCourseId(null);
    }
  }

  function openDeleteDialog(course: Course) {
    setCourseToDelete(course);
    closeToast();
  }

  function closeDeleteDialog() {
    if (processingCourseId) return;
    setCourseToDelete(null);
  }

  async function handleDeleteCourse() {
    if (!courseToDelete || processingCourseId) return;

    const course = courseToDelete;

    setProcessingCourseId(course.id);
    closeToast();

    try {
      await deleteCourse(course.id);

      setCourses((current) =>
        current.filter((item) => item.id !== course.id),
      );

      setCourseToDelete(null);

      showToast("success", "Votre formation a été supprimée avec succès.");
    } catch (err) {
      setCourseToDelete(null);

      showToast(
        "error",
        err instanceof Error
          ? err.message
          : "Impossible de supprimer cette formation.",
      );
    } finally {
      setProcessingCourseId(null);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    closeToast();

    try {
      await logoutUser();
      router.replace("/login");
    } catch {
      showToast(
        "error",
        "Impossible de vous déconnecter. Réessayez.",
      );
      setLoggingOut(false);
    }
  }

  const publishedCourses = courses.filter(
    (course) => course.status === "PUBLISHED",
  );

  const draftCourses = courses.filter(
    (course) => course.status === "DRAFT",
  );

  const totalLessons = courses.reduce(
    (total, course) => total + (course._count?.lessons ?? 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">
            Chargement de votre espace professeur...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={closeToast}
        />
      )}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <GraduationCap size={23} />
            </div>

            <div>
              <p className="font-bold text-slate-900">Ikrame BASKANE</p>
              <p className="text-xs text-slate-500">Espace professeur</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500">Professeur</p>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogOut size={16} />
              )}
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-sm font-medium text-indigo-600">
              Tableau de bord
            </p>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Bonjour, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Gérez vos formations, vos leçons et vos sessions Live.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Nouvelle formation
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total formations",
              value: courses.length,
              icon: BookOpen,
              color: "bg-indigo-50 text-indigo-600",
            },
            {
              label: "Publiées",
              value: publishedCourses.length,
              icon: GraduationCap,
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Brouillons",
              value: draftCourses.length,
              icon: LayoutDashboard,
              color: "bg-amber-50 text-amber-600",
            },
            {
              label: "Total leçons",
              value: totalLessons,
              icon: Video,
              color: "bg-sky-50 text-sky-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-900">Mes formations</h2>
              <p className="mt-1 text-sm text-slate-500">
                Consultez et gérez vos formations.
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {courses.length} formation(s)
            </span>
          </div>

          {courses.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <BookOpen size={30} />
              </div>

              <h3 className="font-semibold text-slate-900">
                Aucune formation pour le moment
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Créez votre première formation pour commencer à partager vos
                connaissances avec vos étudiants.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus size={18} />
                Créer une formation
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {courses.map((course) => {
                const isProcessing = processingCourseId === course.id;

                return (
                  <div
                    key={course.id}
                    className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {course.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            course.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {course.status === "PUBLISHED"
                            ? "Publiée"
                            : "Brouillon"}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {course.description}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {course._count?.lessons ?? 0} leçon(s)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openEditModal(course)}
                        disabled={isProcessing}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                      >
                        Modifier
                      </button>

                      <button
                        onClick={() => handleTogglePublication(course)}
                        disabled={isProcessing}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                          course.status === "PUBLISHED"
                            ? "border border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {isProcessing ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : course.status === "PUBLISHED" ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}

                        {course.status === "PUBLISHED"
                          ? "Dépublier"
                          : "Publier"}
                      </button>

                      <button
                        onClick={() => openDeleteDialog(course)}
                        disabled={isProcessing}
                        title="Supprimer la formation"
                        className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        <span className="lg:hidden">Supprimer</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {courseModalOpen && (
        <CourseModal
          key={editingCourse?.id ?? "new-course"}
          course={editingCourse}
          onSuccess={handleCourseSaved}
          onClose={closeCourseModal}
        />
      )}

      {courseToDelete && (
        <ConfirmDialog
          title="Confirmer la suppression"
          message="Cette action est définitive. La formation ainsi que ses leçons et ses sessions Live associées seront supprimées."
          itemName={courseToDelete.title}
          confirmLabel="Supprimer définitivement"
          cancelLabel="Annuler"
          loading={processingCourseId === courseToDelete.id}
          onConfirm={handleDeleteCourse}
          onCancel={closeDeleteDialog}
        />
      )}
    </div>
  );
}
