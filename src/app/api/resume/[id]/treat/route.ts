/**
 * Route API pour traiter ou détraiter un CV
 * PATCH /api/resume/[id]/treat
 */

import { NextRequest, NextResponse } from "next/server";
import * as resumeService from "@/lib/services/resume-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID du CV requis" }, { status: 400 });
    }

    const body = await request.json();

    // Valider que is_treated est fourni et est un boolean
    if (typeof body.is_treated !== "boolean") {
      return NextResponse.json(
        {
          error:
            "Le champ is_treated doit être un boolean (true pour traiter, false pour détraiter)",
        },
        { status: 400 },
      );
    }

    // Utiliser l'import namespace pour éviter les problèmes de cache
    if (typeof resumeService.updateResumeTreatmentStatus !== "function") {
      console.error(
        "updateResumeTreatmentStatus is not available:",
        Object.keys(resumeService),
      );
      return NextResponse.json(
        { error: "Fonction de mise à jour non disponible" },
        { status: 500 },
      );
    }

    const success = await resumeService.updateResumeTreatmentStatus(
      id,
      body.is_treated,
    );

    if (!success) {
      return NextResponse.json({ error: "CV non trouvé" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: body.is_treated
          ? "CV marqué comme traité"
          : "CV marqué comme non traité",
        is_treated: body.is_treated,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du CV:", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
