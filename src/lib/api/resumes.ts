/**
 * Fonctions pour les appels API côté client concernant les CVs
 */

export interface ResumesResponse {
  count: number;
  resumes: Array<{
    id: string;
    first_name: string;
    last_name: string;
    main_position: string;
    created_at: string;
    is_treated: number;
  }>;
}

/**
 * Récupère la liste des CVs avec le paramètre status
 * @param status - 'all' | 'treated' | 'untreated'
 * @returns Promise avec le count et la liste des resumes
 */
export async function fetchResumes(
  status: "all" | "treated" | "untreated" = "all",
): Promise<ResumesResponse> {
  const response = await fetch(`/api/resumes?status=${status}`);

  if (!response.ok) {
    throw new Error(
      `Erreur lors de la récupération des CVs: ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Récupère uniquement le total des CVs
 * @param status - 'all' | 'treated' | 'untreated'
 * @returns Promise avec le nombre total de CVs
 */
export async function fetchResumeCount(
  status: "all" | "treated" | "untreated" = "all",
): Promise<number> {
  const data = await fetchResumes(status);
  return data.count;
}

/**
 * Type pour un CV complet (réutilisé depuis les types)
 */
export type { CompleteResumeResponse } from "@/types/submission";

/**
 * Récupère un CV complet par son ID
 * @param id - ID du CV à récupérer
 * @returns Promise avec le CV complet
 * @throws Error si le CV n'est pas trouvé ou en cas d'erreur
 */
export async function fetchResumeById(
  id: string,
): Promise<import("@/types/submission").CompleteResumeResponse> {
  const response = await fetch(`/api/resume/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("CV non trouvé");
    }
    throw new Error(
      `Erreur lors de la récupération du CV: ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Type pour la mise à jour partielle d'un CV
 */
export type { PartialPlayerSubmissionInput } from "@/types/submission";

/**
 * Met à jour un CV complet
 * @param id - ID du CV à mettre à jour
 * @param data - Données partielles à mettre à jour
 * @returns Promise avec le CV mis à jour
 * @throws Error en cas d'erreur
 */
export async function updateResume(
  id: string,
  data: import("@/types/submission").PartialPlayerSubmissionInput,
): Promise<import("@/types/submission").CompleteResumeResponse> {
  const response = await fetch(`/api/resume/${id}`, {
    method: "PUT",
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
        `Erreur lors de la mise à jour du CV: ${response.statusText}`,
    );
  }

  return response.json();
}
