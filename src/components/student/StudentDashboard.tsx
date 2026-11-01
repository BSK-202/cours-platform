
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LogOut,
  Loader2,
  UserRound,
} from "lucide-react";

import {
  getCurrentUser,
  logoutUser,
  type AuthUser,
} from "@/lib/api/auth";

export default function StudentDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
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
      } catch {
        if (active) router.replace("/login");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();

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

    setLoggingOut(false);
    router.replace("/login");
  } catch {
    setError("Impossible de vous déconnecter. Réessayez.");
    setLoggingOut(false);
  }
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
              SkillBridge
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
            Bienvenue sur SkillBridge. Retrouvez vos apprentissages et
            développez vos compétences à votre rythme.
          </p>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Catalogue des cours
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Découvrez les cours publiés par nos professeurs et explorez
              de nouvelles compétences.
            </p>

            <span className="mt-5 inline-flex text-sm font-semibold text-indigo-600">
              Bientôt disponible
            </span>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
              <UserRound className="h-6 w-6 text-violet-600" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Mon profil
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {user.email}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Rôle : Étudiant
            </p>
          </article>
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
