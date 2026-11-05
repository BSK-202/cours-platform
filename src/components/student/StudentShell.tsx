"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, type AuthUser } from "@/lib/api/auth";
import StudentHeader from "./StudentHeader";

const UserContext = createContext<AuthUser | null>(null);

export function useStudentUser() {
  return useContext(UserContext);
}

export default function StudentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((u) => {
        if (active) setUser(u);
      })
      .catch(() => {
        /* le layout parent gère déjà la redirection si non connecté */
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen bg-slate-50">
        <StudentHeader user={user} />
        {children}
      </div>
    </UserContext.Provider>
  );
}