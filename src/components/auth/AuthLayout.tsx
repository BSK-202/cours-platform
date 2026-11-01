
import Link from "next/link";
import { GraduationCap, BookOpen, Users, Video, ArrowRight } from "lucide-react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    mode: "login" | "register";
}

export default function AuthLayout({
    children,
    title,
    subtitle,
    mode,
}: AuthLayoutProps) {
    return (
        <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
            {/* Left presentation panel */}
            <section className="relative hidden overflow-hidden bg-indigo-700 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
                <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl" />

                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-700">
                            <GraduationCap size={27} />
                        </span>
                        <span className="text-2xl font-bold">
                            SkillBridge
                        </span>
                    </Link>
                </div>

                <div className="relative z-10 my-12 max-w-xl">
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
                        Votre avenir commence ici
                    </span>

                    <h1 className="mt-7 text-4xl font-bold leading-tight xl:text-5xl">
                        Apprenez, partagez et progressez ensemble.
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-indigo-100">
                        Rejoignez une communauté où les professeurs partagent leur
                        expertise et où les étudiants développent leurs compétences
                        à leur propre rythme.
                    </p>

                    <div className="mt-10 space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-white/10 p-3">
                                <BookOpen size={23} />
                            </div>
                            <div>
                                <p className="font-semibold">Des cours accessibles</p>
                                <p className="text-sm text-indigo-200">
                                    Apprenez à votre rythme.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-white/10 p-3">
                                <Users size={23} />
                            </div>
                            <div>
                                <p className="font-semibold">Une communauté éducative</p>
                                <p className="text-sm text-indigo-200">
                                    Professeurs et étudiants réunis.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-white/10 p-3">
                                <Video size={23} />
                            </div>
                            <div>
                                <p className="font-semibold">Des sessions Live</p>
                                <p className="text-sm text-indigo-200">
                                    Échangez en direct avec vos professeurs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-6 text-sm text-indigo-200">
                    <span>© 2026 SkillBridge</span>
                    <span>Apprendre sans limites.</span>
                </div>
            </section>

            {/* Right form panel */}
            <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:justify-center lg:px-12 xl:px-20">
                {/* Mobile logo */}
                <div className="mb-10 flex items-center justify-between lg:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                            <GraduationCap size={24} />
                        </span>
                        <span className="text-xl font-bold text-slate-900">
                            Skill<span className="text-indigo-600">Bridge</span>
                        </span>
                    </Link>

                    <Link
                        href="/"
                        className="text-sm font-medium text-slate-500 hover:text-indigo-600"
                    >
                        Accueil
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-md flex-1 lg:flex-none">
                    <div className="mb-8">
                        <p className="text-sm font-semibold text-indigo-600">
                            {mode === "login" ? "BON RETOUR !" : "REJOIGNEZ-NOUS"}
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            {title}
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                            {subtitle}
                        </p>
                    </div>

                    {children}

                    <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
                        {mode === "login" ? (
                            <p>
                                Vous n'avez pas encore de compte ?{" "}
                                <Link
                                    href="/register"
                                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                                >
                                    Créer un compte
                                </Link>
                            </p>
                        ) : (
                            <p>
                                Vous avez déjà un compte ?{" "}
                                <Link
                                    href="/login"
                                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                                >
                                    Se connecter
                                </Link>
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-10 text-center text-xs text-slate-400">
                    En continuant, vous acceptez nos conditions d'utilisation.
                </div>
            </section>
        </main>
    );
}
