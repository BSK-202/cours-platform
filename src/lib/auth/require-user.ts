
import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { Role } from "@prisma/client";

export async function requireUser(requiredRole: Role) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== requiredRole) {
    redirect(user.role === "PROFESSOR" ? "/professor" : "/student");
  }

  return user;
}
