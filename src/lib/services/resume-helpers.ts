/**
 * Helpers pour la gestion des CVs
 */

import type { Prisma } from '@prisma/client';
import type { CareerClubInput, TrainingEntryInput, ClubInterestInput } from '@/types/submission';

/**
 * Type pour le client de transaction Prisma
 */
type PrismaTransaction = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Trouve ou crée une division
 */
export async function findOrCreateDivision(
  tx: PrismaTransaction,
  club: { division_id?: string; division_name?: string; division_logo_url?: string | null; club_name: string }
): Promise<string> {
  let divisionId: string;
  let division: any;

  if (club.division_id) {
    division = await tx.division.findUnique({
      where: { id: club.division_id },
    });

    if (!division) {
      throw new Error(`Division avec l'ID "${club.division_id}" non trouvée`);
    }

    divisionId = division.id;

    // Mettre à jour le logo si fourni
    if (club.division_logo_url !== undefined) {
      await tx.division.update({
        where: { id: divisionId },
        data: { logoUrl: club.division_logo_url ?? null },
      });
    }
  } else if (club.division_name) {
    division = await tx.division.findFirst({
      where: { divisionName: club.division_name },
    });

    if (!division) {
      division = await tx.division.create({
        data: {
          divisionName: club.division_name,
          logoUrl: club.division_logo_url ?? null,
          isOfficial: 0,
        },
      });
    } else if (club.division_logo_url !== undefined) {
      division = await tx.division.update({
        where: { id: division.id },
        data: { logoUrl: club.division_logo_url ?? null },
      });
    }

    divisionId = division.id;
  } else {
    throw new Error(`Division manquante pour le club "${club.club_name || 'non spécifié'}"`);
  }

  return divisionId;
}

/**
 * Construit le payload pour un club de carrière
 */
export function buildCareerClubPayload(club: Partial<CareerClubInput>): Record<string, any> {
  const payload: Record<string, any> = {};

  if (club.club_name !== undefined) payload.clubName = club.club_name;
  if (club.club_logo_url !== undefined) payload.clubLogoUrl = club.club_logo_url ?? null;
  if (club.category !== undefined) payload.category = club.category;
  if (club.start_month !== undefined) payload.startMonth = club.start_month ?? null;
  if (club.end_month !== undefined) payload.endMonth = club.end_month ?? null;
  if (club.is_captain !== undefined) payload.isCaptain = club.is_captain ?? 0;
  if (club.is_promoted !== undefined) payload.isPromoted = club.is_promoted ?? 0;
  if (club.is_champion !== undefined) payload.isChampion = club.is_champion ?? 0;
  if (club.is_cup_winner !== undefined) payload.isCupWinner = club.is_cup_winner ?? 0;
  if (club.matches_played !== undefined) payload.matchesPlayed = club.matches_played;
  if (club.goals !== undefined) payload.goals = club.goals ?? null;
  if (club.assists !== undefined) payload.assists = club.assists ?? null;
  if (club.avg_playtime_minutes !== undefined) payload.avgPlaytimeMinutes = club.avg_playtime_minutes ?? null;
  if (club.clean_sheets !== undefined) payload.cleanSheets = club.clean_sheets ?? null;

  return payload;
}

/**
 * Met à jour ou crée un club de carrière
 */
export async function upsertCareerClub(
  tx: PrismaTransaction,
  seasonId: string,
  club: Partial<CareerClubInput>,
  existingClub: { id: string; divisionId?: string } | null
): Promise<void> {
  let divisionId: string;

  // Si le club existe et qu'aucune division n'est fournie, utiliser la division existante
  if (existingClub && !club.division_id && !club.division_name) {
    if (existingClub.divisionId) {
      divisionId = existingClub.divisionId;
    } else {
      // Récupérer la division du club existant si elle n'a pas été fournie
      const existingClubFull = await tx.careerClub.findUnique({
        where: { id: existingClub.id },
        select: { divisionId: true },
      });
      if (!existingClubFull) {
        throw new Error(`Club avec l'ID "${existingClub.id}" non trouvé`);
      }
      divisionId = existingClubFull.divisionId;
    }
  } else {
    // Trouver ou créer la division si elle est fournie, ou si c'est un nouveau club
    if (!club.division_id && !club.division_name) {
      throw new Error(`Division manquante pour le club "${club.club_name || 'nouveau club'}"`);
    }
    divisionId = await findOrCreateDivision(tx, club as CareerClubInput);
  }

  const clubPayload = { ...buildCareerClubPayload(club), divisionId };

  if (existingClub) {
    if (Object.keys(clubPayload).length > 0) {
      await tx.careerClub.update({
        where: { id: existingClub.id },
        data: clubPayload,
      });
    }
  } else {
    await tx.careerClub.create({
      data: {
        seasonId,
        ...clubPayload,
      },
    });
  }
}

/**
 * Met à jour ou crée une entrée de formation
 */
export async function upsertTrainingEntry(
  tx: PrismaTransaction,
  resumeId: string,
  entry: Partial<TrainingEntryInput>,
  existingEntry: { id: string } | null
): Promise<void> {
  const entryPayload: Record<string, any> = {};
  if (entry.start_year !== undefined) entryPayload.startYear = entry.start_year;
  if (entry.end_year !== undefined) entryPayload.endYear = entry.end_year ?? null;
  if (entry.location !== undefined) entryPayload.location = entry.location;
  if (entry.title !== undefined) entryPayload.title = entry.title;
  if (entry.details !== undefined) entryPayload.details = entry.details ?? null;
  if (entry.display_order !== undefined) entryPayload.displayOrder = entry.display_order;

  if (existingEntry) {
    if (Object.keys(entryPayload).length > 0) {
      await tx.trainingEntry.update({
        where: { id: existingEntry.id },
        data: entryPayload,
      });
    }
  } else {
    if (
      entry.start_year === undefined ||
      entry.location === undefined ||
      entry.title === undefined ||
      entry.display_order === undefined
    ) {
      throw new Error('start_year, location, title et display_order sont requis pour créer une formation');
    }

    await tx.trainingEntry.create({
      data: {
        resumeId,
        startYear: entry.start_year,
        endYear: entry.end_year ?? null,
        location: entry.location,
        title: entry.title,
        details: entry.details ?? null,
        displayOrder: entry.display_order,
      },
    });
  }
}

/**
 * Met à jour ou crée un intérêt de club
 */
export async function upsertClubInterest(
  tx: PrismaTransaction,
  resumeId: string,
  interest: Partial<ClubInterestInput>,
  existingInterest: { id: string } | null
): Promise<void> {
  const interestPayload: Record<string, any> = {};
  if (interest.club_name !== undefined) interestPayload.clubName = interest.club_name;
  if (interest.club_logo_url !== undefined) interestPayload.clubLogoUrl = interest.club_logo_url ?? null;
  if (interest.year !== undefined) interestPayload.year = interest.year;
  if (interest.display_order !== undefined) interestPayload.displayOrder = interest.display_order;

  if (existingInterest) {
    if (Object.keys(interestPayload).length > 0) {
      await tx.clubInterest.update({
        where: { id: existingInterest.id },
        data: interestPayload,
      });
    }
  } else {
    if (
      interest.club_name === undefined ||
      interest.year === undefined ||
      interest.display_order === undefined
    ) {
      throw new Error('club_name, year et display_order sont requis pour créer un intérêt club');
    }

    await tx.clubInterest.create({
      data: {
        resumeId,
        clubName: interest.club_name,
        clubLogoUrl: interest.club_logo_url ?? null,
        year: interest.year,
        displayOrder: interest.display_order,
      },
    });
  }
}
