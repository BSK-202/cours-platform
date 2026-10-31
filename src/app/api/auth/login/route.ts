
import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth/auth.service";
import { setSessionCookie } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Vérifier les identifiants et créer la session
    const result = await loginUser(body);

    // 2. Séparer les informations utilisateur du token de session
    const { session, ...user } = result;

    // 3. Construire la réponse HTTP
    const response = NextResponse.json(
      {
        success: true,
        message: "Connexion réussie.",
        data: user,
      },
      { status: 200 }
    );

    // 4. Envoyer le token dans un cookie sécurisé
    setSessionCookie(response, session.token, session.expiresAt);

    return response;

  } catch (error) {
    // JSON mal formé
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Format JSON invalide.",
        },
        { status: 400 }
      );
    }

    // Identifiants invalides ou données de connexion invalides
    if (
      error instanceof Error &&
      error.message === "Email ou mot de passe invalide."
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email ou mot de passe invalide.",
        },
        { status: 401 }
      );
    }

    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Une erreur interne est survenue.",
      },
      { status: 500 }
    );
  }
}
