"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Video,
  Plus,
  LayoutDashboard,
  Loader2,
  ArrowRight,
} from "lucide-react";

import { getCourses, type Course } from "@/lib/api/courses";

import CourseModal from "@/components/professor/CourseModal";
import Toast, { type ToastType } from "@/components/ui/Toast";
import { useProfessorUser } from "@/components/professor/ProfessorShell";

interface ToastState {
  type: ToastType;
  message: string;
}

export default function ProfessorDashboard() {
  const router = useRouter();
  const user = useProfessorUser();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [courseModalOpen, setCourseModalOpen] = useState(false);

  function showToast(type: ToastType, message: string) {
    setToast({ type, message });
  }

  async function loadDashboard() {
    setLoading(true);
    try {
      setCourses(await getCourses());
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

  function handleCourseCreated(savedCourse: Course) {
    setCourses((current) => [savedCourse, ...current]);
    showToast("success", "Votre formation a été créée avec succès.");
    setCourseModalOpen(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">
            Chargement de votre espace professeur...
          </p>
        </div>
      </div>
    );
  }

  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED");
  const draftCourses = courses.filter((c) => c.status === "DRAFT");
  const totalLessons = courses.reduce(
    (total, c) => total + (c._count?.lessons ?? 0),
    0,
  );

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TITRE + ACTION */}
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
            onClick={() => setCourseModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Nouvelle formation
          </button>
        </div>

        {/* STATS */}
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

        {/* MES FORMATIONS - GRILLE DE CARDS */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Mes formations</h2>
            <p className="mt-1 text-sm text-slate-500">
              Cliquez sur une formation pour gérer son contenu et ses sessions
              Live.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Aucune formation pour le moment
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Créez votre première formation pour commencer à partager vos
                connaissances.
              </p>
              <button
                onClick={() => setCourseModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={18} />
                Créer une formation
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <article
                  key={course.id}
                  onClick={() =>
                    router.push(`/professor/courses/${course.id}`)
                  }
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {course.coverImageUrl ? (
                    <img
                      src={course.coverImageUrl}
                      alt={course.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100">
                      <BookOpen className="h-16 w-16 text-indigo-400" />
                    </div>
                  )}

                  <div className="p-5">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        course.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {course.status === "PUBLISHED" ? "Publiée" : "Brouillon"}
                    </span>

                    <h3 className="mt-4 line-clamp-2 text-lg font-bold text-slate-900">
                      {course.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-500">
                      {course.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="flex items-center gap-2 text-sm text-slate-500">
                        <Video size={15} />
                        {course._count?.lessons ?? 0} leçon(s)
                      </span>
                      <span className="flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:text-indigo-800">
                        Gérer
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {courseModalOpen && (
        <CourseModal
          onSuccess={(c) => handleCourseCreated(c)}
          onClose={() => setCourseModalOpen(false)}
        />
      )}
    </>
  );
}