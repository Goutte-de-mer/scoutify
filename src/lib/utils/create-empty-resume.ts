import type { CompleteResumeResponse } from "@/types/submission";

/**
 * Crée une structure de données vide pour un nouveau CV
 */
export function createEmptyResume(): CompleteResumeResponse {
  return {
    resume: {
      id: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_treated: 0,
      color: "",
      formation_system: "4-3-3",
    },
    player_profile: {
      id: "",
      first_name: "",
      last_name: "",
      birth_date: "",
      nationalities: [],
      strong_foot: "",
      height_cm: 0,
      weight_kg: 0,
      main_position: "",
      positions: [],
      vma: null,
      wingspan_cm: null,
      stats_url: null,
      video_url: null,
      photo_path: "",
      is_international: 0,
      international_country: null,
      international_division: null,
    },
    contacts: {
      id: "",
      player_email: "",
      player_phone: "",
      agent_email: null,
      agent_phone: null,
    },
    qualities: [],
    career_seasons: [],
    training_entries: [],
    club_interests: [],
  };
}
