
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createLiveSession,
  getLiveSessions,
} from "@/lib/live-sessions/live-session.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/courses/:id/live-sessions
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentification requise." },
        { status: 401 }
      );
    }

    const { id: courseId } = await params;

    const sessions = await getLiveSessions(
      courseId,
      user.id,
      user.role
    );

    if (sessions === null) {
      return NextResponse.json(
        { success: false, message: "Cours introuvable ou accès refusé." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Sessions Live récupérées avec succès.",
        data: sessions,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

// POST /api/courses/:id/live-sessions
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentification requise." },
        { status: 401 }
      );
    }

    if (user.role !== "PROFESSOR") {
      return NextResponse.json(
        { success: false, message: "Accès réservé aux professeurs." },
        { status: 403 }
      );
    }

    const { id: courseId } = await params;
    const body = await request.json();

    const result = await createLiveSession(
      courseId,
      user.id,
      body
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Cours introuvable ou accès refusé." },
        { status: 404 }
      );
    }

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          message: "Données invalides.",
          details: result.details,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Session Live créée avec succès.",
        data: result,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
