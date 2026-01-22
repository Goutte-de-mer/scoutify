/**
 * Route API pour générer un PDF à partir d'un CV
 * POST /api/resume/[id]/generate-pdf
 */

import { NextRequest, NextResponse } from "next/server";
import { getCompleteResume } from "@/lib/services/resume-service";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID du CV requis" }, { status: 400 });
    }

    // Récupérer les données du CV
    const resumeData = await getCompleteResume(id);

    if (!resumeData) {
      return NextResponse.json({ error: "CV non trouvé" }, { status: 404 });
    }

    // Générer le nom du fichier : CV_PRENOM_NOM.pdf
    const firstName = resumeData.player_profile.first_name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_");
    const lastName = resumeData.player_profile.last_name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_");
    const fileName = `CV_${firstName}_${lastName}.pdf`;

    // Chemin du fichier PDF
    const pdfPath = path.join(process.cwd(), "public", "CVs", fileName);

    // S'assurer que le dossier CVs existe
    const cvDir = path.join(process.cwd(), "public", "CVs");
    if (!fs.existsSync(cvDir)) {
      fs.mkdirSync(cvDir, { recursive: true });
    }

    // Obtenir l'URL de base
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    if (!baseUrl) {
      // En développement, utiliser localhost
      if (process.env.NODE_ENV === "development") {
        baseUrl = "http://localhost:3000";
      } else {
        // En production, utiliser VERCEL_URL ou construire depuis la requête
        baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : request.nextUrl.origin;
      }
    }

    // URL de la page PDF (publique, sans authentification)
    const url = `${baseUrl}/api/resume/${id}/pdf`;

    // Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();

      // Naviguer vers la page PDF
      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Attendre que le contenu soit chargé
      await page.waitForSelector("body", { timeout: 10000 });

      // Générer le PDF
      await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
        margin: {
          top: "0mm",
          right: "0mm",
          bottom: "0mm",
          left: "0mm",
        },
      });

      await browser.close();

      // Retourner le chemin relatif du fichier
      const relativePath = `/CVs/${fileName}`;

      return NextResponse.json(
        {
          success: true,
          message: "PDF généré avec succès",
          file_path: relativePath,
          file_name: fileName,
        },
        { status: 200 },
      );
    } catch (pdfError) {
      await browser.close();
      throw pdfError;
    }
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Erreur lors de la génération du PDF: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
