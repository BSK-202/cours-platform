
import { NextRequest, NextResponse } from "next/server";

import { logoutUser } from "@/lib/auth/auth.service";
import {
  clearSessionCookie,
} from "@/lib/auth/cookies";

const SESSION_COOKIE_NAME = "skillbridge_session";

export async function POST(request: NextRequest) {
  try {
    // 1. Récupérer le token depuis le cookie
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    // 2. Révoquer la session si un token existe
    if (token) {
      await logoutUser(token);
    }

    // 3. Créer la réponse HTTP
    const response = NextResponse.json({
      success: true,
      message: "Déconnexion réussie.",
    });

    // 4. Expirer le cookie côté client
    clearSessionCookie(response);

    return response;

  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Une erreur interne est survenue.",
      },
      { status: 500 }
    );
  }
}
