
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createLesson,
  getLessons,
} from "@/lib/lessons/lesson.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/courses/:id/lessons
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

    const lessons = await getLessons(
      courseId,
      user.id,
      user.role
    );

    if (lessons === null) {
      return NextResponse.json(
        { success: false, message: "Cours introuvable ou accès refusé." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Leçons récupérées avec succès.",
        data: lessons,
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

// POST /api/courses/:id/lessons
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

    const result = await createLesson(courseId, user.id, body);

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
        message: "Leçon créée avec succès.",
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
