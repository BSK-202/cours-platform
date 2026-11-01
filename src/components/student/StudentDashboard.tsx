
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LogOut,
  Loader2,
  UserRound,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import {
  getCurrentUser,
  logoutUser,
  type AuthUser,
} from "@/lib/api/auth";

import {
  getCourses,
  type Course,
} from "@/lib/api/courses";

export default function StudentDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [coursesError, setCoursesError] = useState("");

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    setCoursesError("");

    try {
      const data = await getCourses();
      setCourses(data.filter((course) => course.status === "PUBLISHED"));
    } catch (err) {
      setCoursesError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les formations.",
      );
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const currentUser = await getCurrentUser();

        if (!active) return;

        if (currentUser.role !== "STUDENT") {
          router.replace(
            currentUser.role === "PROFESSOR" ? "/professor" : "/login",
          );
          return;
        }

        setUser(currentUser);

        const data = await getCourses();

        if (active) {
          setCourses(
            data.filter((course) => course.status === "PUBLISHED"),
          );
        }
      } catch (err) {
        if (!active) return;

        if (!user) {
          router.replace("/login");
          return;
        }

        setCoursesError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les formations.",
        );
      } finally {
        if (active) {
          setLoading(false);
          setCoursesLoading(false);
        }
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      await logoutUser();
      router.replace("/login");
    } catch {
      setError("Impossible de vous déconnecter. Réessayez.");
      setLoggingOut(false);
    }
  }

  function openCourse(courseId: string) {
    router.push(`/student/courses/${courseId}`);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </main>
    );
  }

  if (!user) return null;

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
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white sm:p-10">
          <p className="text-sm font-medium text-indigo-100">
            Espace étudiant
          </p>

          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Bonjour, {user.name} !
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
            Bienvenue sur votre espace d'apprentissage.
            Découvrez les formations et développez vos compétences à votre rythme.
          </p>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Catalogue des formations
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Explorez les formations disponibles.
              </p>
            </div>

            <button
              onClick={loadCourses}
              disabled={coursesLoading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${coursesLoading ? "animate-spin" : ""}`}
              />
              Actualiser
            </button>
          </div>

          {coursesLoading ? (
            <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-16">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : coursesError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm text-red-700">{coursesError}</p>
              <button
                onClick={loadCourses}
                className="mt-4 text-sm font-semibold text-red-700 underline"
              >
                Réessayer
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Aucune formation disponible
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Les nouvelles formations publiées apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <article
                  key={course.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      Publié
                    </span>

                    <h3 className="mt-4 line-clamp-2 text-lg font-bold text-slate-900">
                      {course.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-500">
                      {course.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="flex items-center gap-2 text-sm text-slate-500">
                        <BookOpen className="h-4 w-4" />
                        {course._count.lessons} leçon(s)
                      </span>

                      <button
                        onClick={() => openCourse(course.id)}
                        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Découvrir
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
              <UserRound className="h-6 w-6 text-violet-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Mon profil</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
              <p className="mt-1 text-xs text-slate-500">Rôle : Étudiant</p>
            </div>
          </div>
        </section>

        {error && (
          <p role="alert" className="mt-5 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
