import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const PASSWORD_COOKIE_NAME = "scoutify_auth";

export default async function StaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(PASSWORD_COOKIE_NAME);

  // Vérifier si le cookie existe et est valide
  if (!authCookie || authCookie.value !== "authenticated") {
    // Rediriger vers la page de login
    redirect("/login?redirect=/staff");
  }

  return <>{children}</>;
}
