import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { deleteCourse, getCourseById } from "@/lib/courses/course.service";
import { updateCourse } from "@/lib/courses/course.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    // 1. Vérifier l'authentification
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentification requise." },
        { status: 401 }
      );
    }

    // 2. Récupérer l'identifiant de l'URL
    const { id } = await params;

    // 3. Chercher le cours selon les droits de l'utilisateur
    const course = await getCourseById(id, user.id, user.role);

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Cours introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cours récupéré avec succès.",
        data: course,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get course by id error:", error);

    return NextResponse.json(
      { success: false, message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    // 1. Vérifier l'authentification
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentification requise." },
        { status: 401 }
      );
    }

    // 2. Vérifier le rôle
    if (user.role !== "PROFESSOR") {
      return NextResponse.json(
        { success: false, message: "Accès réservé aux professeurs." },
        { status: 403 }
      );
    }

    // 3. Récupérer l'identifiant du cours
    const { id } = await params;

    // 4. Lire les données
    const body = await request.json();

    // 5. Modifier le cours
    const course = await updateCourse(id, user.id, body);

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Cours introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cours modifié avec succès.",
        data: course,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Format JSON invalide." },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      [
        "Données du cours invalides.",
        "Impossible de publier une formation sans au moins une leçon.",
      ].includes(error.message)
    ) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    console.error("Update course error:", error);

    return NextResponse.json(
      { success: false, message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Non authentifié." },
        { status: 401 }
      );
    }

    if (user.role !== "PROFESSOR") {
      return Response.json(
        { success: false, message: "Accès réservé aux professeurs." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const deletedCourse = await deleteCourse(id, user.id);

    if (!deletedCourse) {
      return Response.json(
        { success: false, message: "Cours introuvable." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Cours supprimé avec succès.",
      data: deletedCourse,
    });
  } catch (error) {
    console.error("Erreur DELETE course:", error);

    return Response.json(
      { success: false, message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}