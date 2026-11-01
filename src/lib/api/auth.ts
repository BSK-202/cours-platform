
export type UserRole = "PROFESSOR" | "STUDENT";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(endpoint, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Impossible de contacter le serveur. Vérifiez votre connexion."
    );
  }

  let result: ApiResponse<T>;

  try {
    result = await response.json();
  } catch {
    throw new Error("La réponse du serveur est invalide.");
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Une erreur est survenue. Veuillez réessayer."
    );
  }

  return result;
}

/**
 * Inscription d'un nouvel étudiant.
 */
export async function registerUser(
  input: RegisterInput
): Promise<AuthUser> {
  const result = await request<AuthUser>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!result.data) {
    throw new Error("Les données du compte sont absentes.");
  }

  return result.data;
}

/**
 * Connexion d'un utilisateur existant.
 * Le serveur place la session dans un cookie HttpOnly.
 */
export async function loginUser(
  input: LoginInput
): Promise<AuthUser> {
  const result = await request<AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!result.data) {
    throw new Error("Les données utilisateur sont absentes.");
  }

  return result.data;
}

/**
 * Récupération de l'utilisateur associé au cookie de session.
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const result = await request<AuthUser>("/api/auth/me", {
    method: "GET",
    headers: {},
  });

  if (!result.data) {
    throw new Error("Utilisateur introuvable.");
  }

  return result.data;
}

/**
 * Déconnexion et suppression de la session côté serveur.
 */
export async function logoutUser(): Promise<void> {
  await request<null>("/api/auth/logout", {
    method: "POST",
  });
}
