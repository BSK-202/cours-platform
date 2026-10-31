
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashSessionToken } from "@/lib/auth/session";

const SESSION_COOKIE_NAME = "skillbridge_session";

export async function getCurrentUser() {
  // 1. Récupérer le cookie de session
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  // 2. Calculer le hash du token
  const tokenHash = hashSessionToken(token);

  // 3. Rechercher une session valide
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  // 4. Vérifier l'existence et l'expiration
  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  // 5. Retourner uniquement les informations nécessaires
  return session.user;
}
