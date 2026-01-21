/**
 * Type pour un CV
 */
export interface Resume {
  id: string;
  created_at: string;
  updated_at: string;
  is_treated: number; // 0 ou 1 (boolean en SQLite)
  color: string; // Format hex (#RRGGBB)
  formation_system: string; // '4-3-3' ou '3-5-2'
}

/**
 * Type pour créer un CV
 */
export interface CreateResumeInput {
  id?: string;
  is_treated?: number;
  color: string;
  formation_system: string;
}

/**
 * Type pour mettre à jour un CV
 */
export interface UpdateResumeInput {
  is_treated?: number;
  color?: string;
  formation_system?: string;
}
