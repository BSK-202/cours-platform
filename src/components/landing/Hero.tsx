
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Play,
  Users,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background decorations */}
      <div className="absolute -left-32 top-20 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl sm:h-72 sm:w-72" />
      <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-violet-100/60 blur-3xl sm:h-96 sm:w-96" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:gap-14 sm:px-5 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
        {/* Left content */}
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 sm:mb-7 sm:px-4 sm:text-sm">
            <GraduationCap size={17} />
            Votre avenir commence ici
          </div>

          <h1 className="max-w-2xl text-3xl leading-tight font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Apprenez.
            <span className="block text-indigo-600">Progressez.</span>
            <span className="block">Réussissez ensemble.</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600 sm:mt-7 sm:text-lg sm:leading-8">
            SkillBridge connecte les étudiants et les professeurs dans un
            environnement d'apprentissage simple, accessible et interactif.
            Découvrez des cours, développez vos compétences et apprenez à votre
            rythme.
          </p>

          {/* CTA buttons */}
          <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row sm:mt-9">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 sm:px-7 sm:py-4 sm:text-base"
            >
              Commencer gratuitement
              <ArrowRight size={18} />
            </Link>

            <Link
              href="#courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:px-7 sm:py-4 sm:text-base"
            >
              <Play size={17} />
              Découvrir les cours
            </Link>
          </div>

          {/* Benefits */}
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-600 sm:mt-10 sm:gap-x-6 sm:text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              Accès simple
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              Apprentissage flexible
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              Sessions Live
            </span>
          </div>
        </div>

        {/* Right visual card */}
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-3 rounded-[2rem] bg-indigo-100/70 blur-2xl sm:-inset-5" />

          <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/70 sm:rounded-3xl sm:p-7">
            {/* Card header */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Votre espace d'apprentissage
                </p>
                <h2 className="mt-1 text-base font-bold text-slate-900 sm:text-xl">
                  Bienvenue sur SkillBridge
                </h2>
              </div>

              <div className="shrink-0 rounded-xl bg-indigo-50 p-2.5 text-indigo-600 sm:p-3">
                <BookOpen size={22} />
              </div>
            </div>

            {/* Feature cards */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-4">
              <div className="rounded-xl bg-indigo-50 p-3 sm:rounded-2xl sm:p-4">
                <BookOpen className="text-indigo-600" size={22} />
                <p className="mt-2 text-lg font-bold text-slate-900 sm:mt-3 sm:text-2xl">
                  Cours
                </p>
                <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                  Explorez les formations
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3 sm:rounded-2xl sm:p-4">
                <Users className="text-violet-600" size={22} />
                <p className="mt-2 text-lg font-bold text-slate-900 sm:mt-3 sm:text-2xl">
                  Communauté
                </p>
                <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                  Apprenez ensemble
                </p>
              </div>
            </div>

            {/* Interactive learning block */}
            <div className="mt-4 rounded-xl border border-slate-100 p-4 sm:mt-5 sm:rounded-2xl sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900 sm:text-base">
                  Apprentissage interactif
                </span>

                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 sm:px-3 sm:text-xs">
                  En ligne
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3 sm:mt-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 sm:h-12 sm:w-12">
                  <GraduationCap size={23} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 sm:text-base">
                    Professeurs et étudiants
                  </p>
                  <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                    Un espace pour apprendre et enseigner
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom information */}
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 sm:mt-5 sm:p-4">
              <CheckCircle2
                className="shrink-0 text-emerald-600"
                size={19}
              />

              <p className="text-xs leading-5 text-slate-600 sm:text-sm">
                Accédez à vos contenus depuis vos appareils.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
