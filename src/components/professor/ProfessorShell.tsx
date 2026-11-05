"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, type AuthUser } from "@/lib/api/auth";
import ProfessorHeader from "./ProfessorHeader";

const UserContext = createContext<AuthUser | null>(null);

export function useProfessorUser() {
  return useContext(UserContext);
}

export default function ProfessorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((u) => {
        if (!active) return;
        if (u.role !== "PROFESSOR") {
          router.replace(u.role === "STUDENT" ? "/student" : "/login");
          return;
        }
        setUser(u);
      })
      .catch(() => {
        if (active) router.replace("/login");
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen bg-slate-50">
        <ProfessorHeader user={user} />
        {children}
      </div>
    </UserContext.Provider>
  );
}