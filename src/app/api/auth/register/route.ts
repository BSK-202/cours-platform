import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { registerUser } from "@/lib/auth/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const user = await registerUser(body);

    return NextResponse.json(
      {
        success: true,
        message: "Compte créé avec succès.",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Cette adresse email est déjà utilisée.",
        },
        { status: 409 }
      );
    }

    if (error instanceof Error &&
        error.message === "Données d'inscription invalides.") {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Une erreur interne est survenue.",
      },
      { status: 500 }
    );
  }
}