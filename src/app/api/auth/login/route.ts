import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CORRECT_PASSWORD = "SCOUTIFY2024";
const COOKIE_NAME = "scoutify_auth";
const COOKIE_MAX_AGE = 20 * 60; // 20 minutes en secondes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === CORRECT_PASSWORD) {
      const cookieStore = await cookies();

      // Définir le cookie d'authentification
      cookieStore.set(COOKIE_NAME, "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });

      return NextResponse.json(
        { success: true, message: "Authentification réussie" },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { success: false, error: "Mot de passe incorrect" },
        { status: 401 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'authentification" },
      { status: 500 },
    );
  }
}
