/**
 * Route API pour récupérer la liste des CVs
 * GET /api/resumes?status=all|treated|untreated
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllResumes } from "@/lib/services/resume-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";

    // Valider le paramètre status
    if (status !== "all" && status !== "treated" && status !== "untreated") {
      return NextResponse.json(
        {
          error:
            'Le paramètre status doit être "all", "treated" ou "untreated"',
        },
        { status: 400 },
      );
    }

    const resumes = await getAllResumes(
      status as "all" | "treated" | "untreated",
    );

    return NextResponse.json(
      {
        count: resumes.length,
        resumes,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des CVs:", error);

    // Gérer les erreurs Prisma
    if (error instanceof Error) {
      if (
        error.message.includes("prisma") ||
        error.message.includes("Prisma")
      ) {
        return NextResponse.json(
          { error: "Erreur de base de données" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
