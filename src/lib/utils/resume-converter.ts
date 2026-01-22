import type {
  CompleteResumeResponse,
  PartialPlayerSubmissionInput,
} from "@/types/submission";

export function convertResumeToUpdateInput(
  data: CompleteResumeResponse,
): PartialPlayerSubmissionInput {
  return {
    resume: {
      color: data.resume.color,
      formation_system: data.resume.formation_system,
      is_treated: data.resume.is_treated,
    },
    player_profile: {
      first_name: data.player_profile.first_name,
      last_name: data.player_profile.last_name,
      birth_date: data.player_profile.birth_date,
      nationalities: data.player_profile.nationalities,
      strong_foot: data.player_profile.strong_foot,
      height_cm: data.player_profile.height_cm,
      weight_kg: data.player_profile.weight_kg,
      main_position: data.player_profile.main_position,
      positions: data.player_profile.positions,
      vma: data.player_profile.vma ?? null,
      wingspan_cm: data.player_profile.wingspan_cm ?? null,
      stats_url: data.player_profile.stats_url ?? null,
      video_url: data.player_profile.video_url ?? null,
      photo_path: data.player_profile.photo_path,
      is_international: data.player_profile.is_international,
      international_country: data.player_profile.international_country ?? null,
      international_division:
        data.player_profile.international_division ?? null,
    },
    contacts: {
      player_email: data.contacts.player_email,
      player_phone: data.contacts.player_phone,
      agent_email: data.contacts.agent_email ?? null,
      agent_phone: data.contacts.agent_phone ?? null,
    },
    qualities: data.qualities,
    career_seasons: data.career_seasons.map((season) => ({
      id: season.id?.startsWith("temp-") ? undefined : season.id,
      start_year: season.start_year,
      end_year: season.end_year,
      display_order: season.display_order,
      clubs: season.clubs
        .filter(
          (club) =>
            club.club_name?.trim() &&
            club.category?.trim() &&
            club.division_name?.trim(),
        )
        .map((club) => ({
          id: club.id?.startsWith("temp-") ? undefined : club.id,
          division_id: club.division_id || undefined,
          division_name: club.division_name || undefined,
          club_name: club.club_name,
          club_logo_url: club.club_logo_url ?? null,
          category: club.category,
          start_month: club.start_month ?? null,
          end_month: club.end_month ?? null,
          is_captain: club.is_captain,
          is_promoted: club.is_promoted,
          is_champion: club.is_champion,
          is_cup_winner: club.is_cup_winner,
          matches_played: club.matches_played,
          goals: club.goals ?? null,
          assists: club.assists ?? null,
          avg_playtime_minutes: club.avg_playtime_minutes ?? null,
          clean_sheets: club.clean_sheets ?? null,
        })),
    })),
    training_entries: data.training_entries
      .filter(
        (entry) =>
          entry.start_year &&
          entry.start_year > 0 &&
          entry.end_year &&
          entry.end_year > 0 &&
          entry.title?.trim() &&
          entry.location?.trim(),
      )
      .map((entry) => ({
        id: entry.id?.startsWith("temp-") ? undefined : entry.id,
        start_year: entry.start_year,
        end_year: entry.end_year ?? null,
        location: entry.location,
        title: entry.title,
        details: entry.details ?? null,
        display_order: entry.display_order,
      })),
    club_interests: data.club_interests.map((interest) => ({
      id: interest.id?.startsWith("temp-") ? undefined : interest.id,
      club_name: interest.club_name,
      club_logo_url: interest.club_logo_url ?? null,
      year: interest.year,
      display_order: interest.display_order,
    })),
  };
}
