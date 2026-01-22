import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "scoutify_auth";

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);

  if (authCookie && authCookie.value === "authenticated") {
    return NextResponse.json({ authenticated: true }, { status: 200 });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
