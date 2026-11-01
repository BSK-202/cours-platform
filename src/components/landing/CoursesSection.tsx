
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Loader2,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  professorId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    lessons: number;
  };
}

interface CoursesResponse {
  success: boolean;
  message: string;
  data?: Course[];
}

export default function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/courses", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      const result: CoursesResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Impossible de récupérer les formations."
        );
      }

      setCourses(result.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors du chargement."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  return (
    <section id="courses" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
            <GraduationCap size={17} />
            Espace de formation
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Découvrez les formations
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Explorez les formations disponibles, consultez leur contenu
            et développez vos compétences à votre rythme.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex min-h-48 items-center justify-center gap-3 text-slate-500">
            <Loader2 className="animate-spin" size={24} />
            <span>Chargement des formations...</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="font-medium text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => void loadCourses()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
            >
              <RefreshCw size={16} />
              Réessayer
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && courses.length === 0 && (
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <BookOpen size={30} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">
              Les formations arrivent bientôt
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              Aucune formation n'est publiée pour le moment.
              Revenez bientôt pour découvrir les prochains contenus.
            </p>

            <Link
              href="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Créer mon compte
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* Courses grid */}
        {!loading && !error && courses.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
              >
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 via-violet-50 to-slate-100">
                  {course.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.coverImageUrl}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <BookOpen
                      size={54}
                      className="text-indigo-300 transition duration-300 group-hover:scale-110"
                    />
                  )}

                  <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-indigo-700 backdrop-blur">
                    Formation
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    {course.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">
                    {course.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <PlayCircle size={17} />
                      {course._count.lessons} leçon(s)
                    </span>

                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
                    >
                      Accéder
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
