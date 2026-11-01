
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Play,
  Video,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* Background decorations */}
      <div className="absolute -left-32 top-20 -z-10 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />
      <div className="absolute -right-32 bottom-0 -z-10 h-80 w-80 rounded-full bg-violet-100/60 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">

        {/* Main content */}
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
            <GraduationCap size={17} />
            Formations en ligne avec Ikrame BASKANE
          </div>

          <h1 className="max-w-2xl text-4xl leading-tight font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Apprenez avec méthode.
            <span className="mt-2 block text-indigo-600">
              Progressez avec confiance.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Découvrez un espace d'apprentissage conçu pour vous accompagner
            dans le développement de vos compétences. Suivez des formations
            structurées, avancez à votre rythme et participez à des sessions
            interactives en direct.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
            <Link
              href="#courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 sm:text-base"
            >
              Découvrir les formations
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:text-base"
            >
              Créer mon compte
            </Link>
          </div>

          {/* Benefits */}
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-emerald-600" />
              Cours structurés
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-emerald-600" />
              Vidéos accessibles en ligne
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-emerald-600" />
              Sessions Live
            </span>
          </div>
        </div>

        {/* Learning platform preview */}
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-4 rounded-[2rem] bg-indigo-100/70 blur-2xl" />

          <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70 sm:p-7">

            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Votre espace de formation
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Apprenez à votre rythme
                </h2>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <BookOpen size={24} />
              </div>
            </div>

            {/* Course preview */}
            <div className="mt-7 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  Votre formation
                </span>
                <Play size={20} />
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Apprendre et développer ses compétences
              </h3>

              <p className="mt-2 text-sm leading-6 text-indigo-100">
                Des contenus pédagogiques organisés pour faciliter votre
                progression.
              </p>
            </div>

            {/* Features */}
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <BookOpen size={23} className="text-indigo-600" />
                <p className="mt-3 font-bold text-slate-900">
                  Leçons
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Des contenus organisés par cours
                </p>
              </div>

              <div className="rounded-2xl bg-violet-50 p-4">
                <Video size={23} className="text-violet-600" />
                <p className="mt-3 font-bold text-slate-900">
                  Sessions Live
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Des rendez-vous en direct
                </p>
              </div>
            </div>

            {/* Instructor identity */}
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                IB
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Ikrame BASKANE
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Votre formatrice
                </p>
              </div>

              <CheckCircle2
                size={20}
                className="ml-auto shrink-0 text-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
