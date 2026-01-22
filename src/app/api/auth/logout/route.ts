import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "scoutify_auth";

export async function POST() {
  const cookieStore = await cookies();

  // Supprimer le cookie d'authentification
  cookieStore.delete(COOKIE_NAME);

  return NextResponse.json(
    { success: true, message: "Déconnexion réussie" },
    { status: 200 },
  );
}
