import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createCourse,
  getCourses,
} from "@/lib/courses/course.service";

export async function POST(request: NextRequest) {
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

    // 3. Lire les données envoyées
    const body = await request.json();

    // 4. Créer le cours
    const course = await createCourse(body, user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Cours créé avec succès.",
        data: course,
      },
      { status: 201 }
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
      error.message === "Données du cours invalides."
    ) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    console.error("Create course error:", error);

    return NextResponse.json(
      { success: false, message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    // 1. Vérifier l'authentification
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentification requise.",
        },
        { status: 401 }
      );
    }

    // 2. Récupérer les cours selon le rôle
    const courses = await getCourses(user.id, user.role);

    return NextResponse.json(
      {
        success: true,
        message: "Liste des cours récupérée avec succès.",
        data: courses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get courses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Une erreur interne est survenue.",
      },
      { status: 500 }
    );
  }
}