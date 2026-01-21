/**
 * Type pour une division
 */
export interface Division {
  id: string;
  division_name: string;
  logo_url?: string | null;
  is_official: number; // 0 ou 1
  created_at: string;
  updated_at: string;
}

/**
 * Type pour créer une division
 */
export interface CreateDivisionInput {
  id?: string;
  division_name: string;
  logo_url?: string | null;
}
