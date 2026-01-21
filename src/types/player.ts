/**
 * Type pour un profil de joueur
 */
export interface PlayerProfile {
  id: string;
  resume_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  nationalities: string; // JSON Array string
  strong_foot: string; // 'Droit', 'Gauche', 'Ambidextre'
  height_cm: number;
  weight_kg: number;
  main_position: string; // Position principale (max 100 caractères)
  positions: string; // JSON Array string
  vma?: number | null;
  wingspan_cm?: number | null;
  stats_url?: string | null;
  video_url?: string | null;
  photo_path: string;
  is_international: number; // 0 ou 1
  international_country?: string | null;
  international_division?: string | null;
}

/**
 * Type pour créer un profil de joueur
 */
export interface CreatePlayerInput {
  id?: string;
  resume_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  nationalities: string | string[]; // JSON Array string ou array
  strong_foot: string;
  height_cm: number;
  weight_kg: number;
  main_position: string; // Position principale (max 100 caractères)
  positions: string | string[]; // JSON Array string ou array
  vma?: number | null;
  wingspan_cm?: number | null;
  stats_url?: string | null;
  video_url?: string | null;
  photo_path: string;
  is_international?: number;
  international_country?: string | null;
  international_division?: string | null;
}

/**
 * Type pour mettre à jour un profil de joueur
 */
export interface UpdatePlayerInput {
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  nationalities?: string | string[];
  strong_foot?: string;
  height_cm?: number;
  weight_kg?: number;
  main_position?: string;
  positions?: string | string[];
  vma?: number | null;
  wingspan_cm?: number | null;
  stats_url?: string | null;
  video_url?: string | null;
  photo_path?: string;
  is_international?: number;
  international_country?: string | null;
  international_division?: string | null;
}
