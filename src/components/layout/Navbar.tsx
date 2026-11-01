
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  GraduationCap,
  ArrowRight,
  Home,
  BookOpen,
  Info,
  LogIn,
} from "lucide-react";

const navigation = [
  { label: "Accueil", href: "/", icon: Home },
  { label: "Formations", href: "#courses", icon: BookOpen },
  { label: "À propos", href: "#about", icon: Info },
];

function Brand({ mobile = false }: { mobile?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 ${mobile ? "" : "shrink-0"}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
        <GraduationCap size={23} />
      </span>

      <span className="flex flex-col">
        <span className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
          Ikrame <span className="text-indigo-600">BASKANE</span>
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Formations en ligne
        </span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">

          {/* Desktop brand */}
          <div className="hidden md:flex">
            <Brand />
          </div>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Se connecter
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              S'inscrire
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mobile header */}
          <div className="flex w-full items-center justify-between md:hidden">

            {/* Hamburger left */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={isOpen}
              aria-controls="mobile-drawer"
              className="rounded-xl p-2.5 text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Menu size={25} />
            </button>

            {/* Brand right */}
            <Brand mobile />
          </div>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-slate-950/50 transition-opacity duration-300 md:hidden ${
          isOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile drawer */}
      <aside
        id="mobile-drawer"
        aria-label="Navigation mobile"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed inset-y-0 left-0 z-[60] flex w-[85%] max-w-80 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <div onClick={() => setIsOpen(false)}>
            <Brand mobile />
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le menu"
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={23} />
          </button>
        </div>

        {/* Drawer navigation */}
        <div className="flex-1 overflow-y-auto px-5 py-7">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </p>

          <nav className="flex flex-col gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Icon size={19} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer footer */}
        <div className="border-t border-slate-100 p-5">
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <LogIn size={18} />
            Se connecter
          </Link>

          <Link
            href="/register"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            S'inscrire
            <ArrowRight size={17} />
          </Link>
        </div>
      </aside>
    </>
  );
}
