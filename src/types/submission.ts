/**
 * Types pour la soumission complète du formulaire joueur
 */

import type { CreateResumeInput, CreatePlayerInput } from './index';

/**
 * Qualité du joueur (max 6, max 24 caractères chacune)
 * Tableau de strings simples, sans display_order
 */
export type QualityInput = string;

/**
 * Contacts du joueur
 */
export interface ContactInput {
  player_email: string; // Max 255 caractères
  player_phone: string; // Max 20 caractères, format international
  agent_email?: string | null; // Max 255 caractères
  agent_phone?: string | null; // Max 20 caractères
}

/**
 * Club dans une saison de carrière
 */
export interface CareerClubInput {
  id?: string; // Identifiant pour mise à jour partielle
  division_id?: string; // Référence à la division (si division existe déjà)
  division_name?: string; // Nom de la division (si division n'existe pas, sera créée automatiquement)
  division_logo_url?: string | null; // URL du logo de la division (optionnel, met à jour le logo si fourni)
  club_name: string; // Max 200 caractères
  club_logo_url?: string | null; // URL du logo du club (optionnel)
  category: string; // Max 50 caractères (U17, U19, Séniors, etc.)
  start_month?: number | null; // Si multi-club dans saison
  end_month?: number | null; // Si multi-club dans saison
  is_captain?: number; // 0 ou 1
  is_promoted?: number; // 0 ou 1 (surclassé)
  is_champion?: number; // 0 ou 1
  is_cup_winner?: number; // 0 ou 1
  matches_played: number; // Obligatoire
  goals?: number | null; // Joueur de champ
  assists?: number | null; // Joueur de champ
  avg_playtime_minutes?: number | null; // 1-90 min
  clean_sheets?: number | null; // Gardiens uniquement
}

/**
 * Saison de carrière (max 5)
 */
export interface CareerSeasonInput {
  id?: string; // Identifiant pour mise à jour partielle
  start_year: number; // Année de début
  end_year: number; // Année de fin
  display_order: number; // 1-5
  clubs: CareerClubInput[]; // Clubs dans cette saison
}

/**
 * Entrée de formation
 */
export interface TrainingEntryInput {
  id?: string; // Identifiant pour mise à jour partielle
  start_year: number; // Année de début
  end_year?: number | null; // Année de fin (null si en cours)
  location: string; // Max 200 caractères
  title: string; // Max 1000 caractères
  details?: string | null; // Max 1000 caractères
  display_order: number;
}

/**
 * Intérêt pour un club
 */
export interface ClubInterestInput {
  id?: string; // Identifiant pour mise à jour partielle
  club_name: string; // Max 200 caractères
  club_logo_url?: string | null; // URL du logo du club (optionnel)
  year: string; // 4 caractères
  display_order: number;
}

/**
 * Soumission complète du formulaire joueur
 */
export interface PlayerSubmissionInput {
  // CV de base
  resume: {
    color: string; // Format hex (#RRGGBB)
    formation_system: string; // '4-3-3' ou '3-5-2', max 10 caractères
  };
  
  // Profil joueur
  player_profile: Omit<CreatePlayerInput, 'resume_id'>;
  
  // Contacts
  contacts: ContactInput;
  
  // Qualités (max 6)
  qualities: QualityInput[];
  
  // Carrière (max 5 saisons)
  career_seasons: CareerSeasonInput[];
  
  // Formations
  training_entries: TrainingEntryInput[];
  
  // Intérêts clubs
  club_interests: ClubInterestInput[];
}

/**
 * Type pour la réponse complète d'un CV avec toutes ses données
 */
export interface CompleteResumeResponse {
  // CV de base
  resume: {
    id: string;
    created_at: string;
    updated_at: string;
    is_treated: number;
    color: string;
    formation_system: string;
  };
  
  // Profil joueur
  player_profile: {
    id: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    nationalities: string[]; // Parsed from JSON
    strong_foot: string;
    height_cm: number;
    weight_kg: number;
    main_position: string;
    positions: string[]; // Parsed from JSON
    vma?: number | null;
    wingspan_cm?: number | null;
    stats_url?: string | null;
    video_url?: string | null;
    photo_path: string;
    is_international: number;
    international_country?: string | null;
    international_division?: string | null;
  };
  
  // Contacts
  contacts: {
    id: string;
    player_email: string;
    player_phone: string;
    agent_email?: string | null;
    agent_phone?: string | null;
  };
  
  // Qualités (tableau de strings)
  qualities: string[];
  
  // Carrière
  career_seasons: Array<{
    id: string;
    start_year: number;
    end_year: number;
    display_order: number;
    clubs: Array<{
      id: string;
      division_id: string;
      division_name: string;
      division_logo_url?: string | null;
      club_name: string;
      club_logo_url?: string | null;
      category: string;
      start_month?: number | null;
      end_month?: number | null;
      is_captain: number;
      is_promoted: number;
      is_champion: number;
      is_cup_winner: number;
      matches_played: number;
      goals?: number | null;
      assists?: number | null;
      avg_playtime_minutes?: number | null;
      clean_sheets?: number | null;
    }>;
  }>;
  
  // Formations
  training_entries: Array<{
    id: string;
    start_year: number;
    end_year?: number | null;
    location: string;
    title: string;
    details?: string | null;
    display_order: number;
  }>;
  
  // Intérêts clubs
  club_interests: Array<{
    id: string;
    club_name: string;
    club_logo_url?: string | null;
    year: string;
    display_order: number;
  }>;
}

/**
 * Type pour un élément de la liste des CVs
 */
export interface ResumeListItem {
  id: string;
  first_name: string;
  last_name: string;
  main_position: string;
  created_at: string; // Date de soumission
  is_treated: number; // 0 ou 1
}

/**
 * Type pour la mise à jour partielle d'un CV
 * Tous les champs sont optionnels - seuls les champs fournis seront mis à jour
 */
export interface PartialPlayerSubmissionInput {
  // CV de base
  resume?: {
    color?: string; // Format hex (#RRGGBB)
    formation_system?: string; // '4-3-3' ou '3-5-2', max 10 caractères
    is_treated?: number; // 0 ou 1
  };
  
  // Profil joueur (tous les champs optionnels)
  player_profile?: Partial<Omit<CreatePlayerInput, 'resume_id'>>;
  
  // Contacts (tous les champs optionnels)
  contacts?: Partial<ContactInput>;
  
  // Qualités (max 6) - si fourni, remplace complètement la liste
  qualities?: QualityInput[];
  
  // Carrière (max 5 saisons) - si fourni, remplace complètement la liste
  career_seasons?: CareerSeasonInput[];
  
  // Formations - si fourni, remplace complètement la liste
  training_entries?: TrainingEntryInput[];
  
  // Intérêts clubs - si fourni, remplace complètement la liste
  club_interests?: ClubInterestInput[];
}
