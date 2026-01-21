/**
 * Type pour un club
 */
export interface Club {
  id: string;
  club_name: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

/**
 * Type pour créer un club
 */
export interface CreateClubInput {
  id?: string;
  club_name: string;
  logo_url: string;
}
