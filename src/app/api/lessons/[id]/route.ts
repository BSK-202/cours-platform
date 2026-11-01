
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  updateLesson,
  deleteLesson,
} from "@/lib/lessons/lesson.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/lessons/:id
export async function PATCH(
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

    const { id } = await params;
    const body = await request.json();

    const result = await updateLesson(id, user.id, body);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Leçon introuvable ou accès refusé." },
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
        message: "Leçon modifiée avec succès.",
        data: result,
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

// DELETE /api/lessons/:id
export async function DELETE(
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

    if (user.role !== "PROFESSOR") {
      return NextResponse.json(
        { success: false, message: "Accès réservé aux professeurs." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = await deleteLesson(id, user.id);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Leçon introuvable ou accès refusé." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Leçon supprimée avec succès.",
        data: result,
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
