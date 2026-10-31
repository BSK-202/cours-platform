import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth.schema";
import { hashPassword } from "@/lib/auth/password";

import { loginSchema } from "@/lib/validations/auth.schema";
import { verifyPassword } from "@/lib/auth/password";

import {
  generateSessionToken,
  hashSessionToken,
  getSessionExpirationDate,
} from "@/lib/auth/session";

export async function registerUser(input: unknown) {
  // 1. Valider les données reçues
  const result = signupSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Données d'inscription invalides.");
  }

  const { name, email, password } = result.data;

  // 2. Vérifier si l'adresse email existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Cette adresse email est déjà utilisée.");
  }

  // 3. Hasher le mot de passe
  const passwordHash = await hashPassword(password);

  // 4. Créer le compte étudiant
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "STUDENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}


// LOGIN
export async function loginUser(input: unknown) {
  const result = loginSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Email ou mot de passe invalide.");
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Email ou mot de passe invalide.");
  }

  const isPasswordValid = await verifyPassword(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new Error("Email ou mot de passe invalide.");
  }

  const session = await createUserSession(user.id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    session,
  };
}


// CREATE SESSION
export async function createUserSession(userId: string) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = getSessionExpirationDate();

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}



export async function logoutUser(token: string) {
  // 1. Calculer le hash du token reçu
  const tokenHash = hashSessionToken(token);

  // 2. Supprimer uniquement la session correspondante
  await prisma.session.deleteMany({
    where: {
      tokenHash,
    },
  });
}
