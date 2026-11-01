
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  MonitorPlay,
  Video,
} from "lucide-react";

const learningFeatures = [
  {
    icon: BookOpen,
    title: "Contenus structurés",
    description:
      "Des formations organisées en cours et en leçons pour faciliter l'apprentissage.",
  },
  {
    icon: MonitorPlay,
    title: "Apprentissage vidéo",
    description:
      "Des ressources vidéo accessibles en ligne pour apprendre à son rythme.",
  },
  {
    icon: Video,
    title: "Sessions en direct",
    description:
      "Des rendez-vous Live pour échanger et approfondir les notions abordées.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-24 bg-slate-50 py-20 sm:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">

        {/* Presentation */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
            <GraduationCap size={17} />
            À propos
          </span>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Un espace dédié à votre apprentissage
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-600">
            Bienvenue sur l'espace de formation d'Ikrame BASKANE.
            Cette plateforme a pour objectif de proposer un environnement
            d'apprentissage en ligne organisé, accessible et adapté
            à une progression à votre rythme.
          </p>

          <p className="mt-4 text-base leading-8 text-slate-600">
            Chaque formation rassemble des leçons et des ressources vidéo.
            Des sessions en direct permettent également de compléter
            l'apprentissage et de favoriser les échanges.
          </p>

          <Link
            href="#courses"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Découvrir les formations
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Learning features */}
        <div className="space-y-5">
          {learningFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon size={24} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
