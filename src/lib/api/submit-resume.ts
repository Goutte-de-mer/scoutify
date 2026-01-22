/**
 * Fonction pour soumettre un CV depuis le formulaire joueur
 */

import type { PlayerSubmissionInput } from "@/types/submission";

export async function submitResume(
  data: PlayerSubmissionInput,
): Promise<{ id: string }> {
  const response = await fetch("/api/submit-resume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Erreur inconnue" }));
    throw new Error(
      errorData.error ||
        `Erreur lors de la soumission du CV: ${response.statusText}`,
    );
  }

  return response.json();
}
