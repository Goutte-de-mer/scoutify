/**
 * Service pour la gestion des CVs avec Prisma
 */

import { prisma } from "@/lib/prisma";
import type {
  PlayerSubmissionInput,
  PartialPlayerSubmissionInput,
  CompleteResumeResponse,
  ResumeListItem,
} from "@/types/submission";
import {
  upsertCareerClub,
  upsertTrainingEntry,
  upsertClubInterest,
} from "./resume-helpers";

/**
 * Crée un CV complet avec toutes ses relations
 */
export async function createCompleteResume(
  data: PlayerSubmissionInput,
): Promise<string> {
  // Utiliser une transaction pour garantir la cohérence des données
  return await prisma.$transaction(async (tx) => {
    // 1. Créer le CV de base
    const resume = await tx.resume.create({
      data: {
        color: data.resume.color,
        formationSystem: data.resume.formation_system,
        isTreated: 0,
      },
    });

    const resumeId = resume.id;

    // 2. Créer le profil joueur
    await tx.playerProfile.create({
      data: {
        resumeId,
        firstName: data.player_profile.first_name,
        lastName: data.player_profile.last_name,
        birthDate: data.player_profile.birth_date,
        nationalities: JSON.stringify(data.player_profile.nationalities || []),
        strongFoot: data.player_profile.strong_foot,
        heightCm: data.player_profile.height_cm,
        weightKg: data.player_profile.weight_kg,
        mainPosition: data.player_profile.main_position,
        positions: JSON.stringify(data.player_profile.positions || []),
        qualities: JSON.stringify(data.qualities || []),
        vma: data.player_profile.vma ?? null,
        wingspanCm: data.player_profile.wingspan_cm ?? null,
        statsUrl: data.player_profile.stats_url ?? null,
        videoUrl: data.player_profile.video_url ?? null,
        photoPath: data.player_profile.photo_path,
        isInternational: data.player_profile.is_international ?? 0,
        internationalCountry: data.player_profile.international_country ?? null,
        internationalDivision:
          data.player_profile.international_division ?? null,
      },
    });

    // 3. Créer les contacts
    await tx.contact.create({
      data: {
        resumeId,
        playerEmail: data.contacts.player_email,
        playerPhone: data.contacts.player_phone,
        agentEmail: data.contacts.agent_email ?? null,
        agentPhone: data.contacts.agent_phone ?? null,
      },
    });

    // 5. Créer les saisons de carrière avec leurs clubs
    if (data.career_seasons && data.career_seasons.length > 0) {
      for (const season of data.career_seasons) {
        const createdSeason = await tx.careerSeason.create({
          data: {
            resumeId,
            startYear: season.start_year,
            endYear: season.end_year,
            displayOrder: season.display_order,
          },
        });

        // Créer les clubs de cette saison
        for (const club of season.clubs) {
          // Gérer la division : trouver ou créer
          let divisionId: string;
          let division: any;

          if (club.division_id) {
            // Utiliser la division existante
            division = await tx.division.findUnique({
              where: { id: club.division_id },
            });

            if (!division) {
              throw new Error(
                `Division avec l'ID "${club.division_id}" non trouvée`,
              );
            }

            divisionId = division.id;
          } else if (club.division_name) {
            // Chercher une division existante avec ce nom
            division = await tx.division.findFirst({
              where: {
                divisionName: club.division_name,
              },
            });

            // Si elle n'existe pas, la créer
            if (!division) {
              division = await tx.division.create({
                data: {
                  divisionName: club.division_name,
                  logoUrl: club.division_logo_url ?? null,
                  isOfficial: 0, // Division custom par défaut
                },
              });
            } else if (club.division_logo_url !== undefined) {
              // Mettre à jour le logo si fourni
              division = await tx.division.update({
                where: { id: division.id },
                data: { logoUrl: club.division_logo_url ?? null },
              });
            }

            divisionId = division.id;
          } else {
            throw new Error(
              `Division manquante pour le club "${club.club_name}"`,
            );
          }

          // Si division_logo_url est fourni avec division_id, mettre à jour le logo
          if (club.division_id && club.division_logo_url !== undefined) {
            await tx.division.update({
              where: { id: divisionId },
              data: { logoUrl: club.division_logo_url ?? null },
            });
          }

          // Créer le club de carrière
          await tx.careerClub.create({
            data: {
              seasonId: createdSeason.id,
              divisionId,
              clubName: club.club_name,
              clubLogoUrl: club.club_logo_url ?? null,
              category: club.category,
              startMonth: club.start_month ?? null,
              endMonth: club.end_month ?? null,
              isCaptain: club.is_captain ?? 0,
              isPromoted: club.is_promoted ?? 0,
              isChampion: club.is_champion ?? 0,
              isCupWinner: club.is_cup_winner ?? 0,
              matchesPlayed: club.matches_played,
              goals: club.goals ?? null,
              assists: club.assists ?? null,
              avgPlaytimeMinutes: club.avg_playtime_minutes ?? null,
              cleanSheets: club.clean_sheets ?? null,
            },
          });
        }
      }
    }

    // 6. Créer les entrées de formation
    if (data.training_entries && data.training_entries.length > 0) {
      const validEntries = data.training_entries.filter(
        (entry) =>
          entry.start_year &&
          entry.start_year > 0 &&
          entry.end_year &&
          entry.end_year > 0 &&
          entry.title?.trim() &&
          entry.location?.trim(),
      );
      if (validEntries.length > 0) {
        await tx.trainingEntry.createMany({
          data: validEntries.map((entry) => ({
            resumeId,
            startYear: entry.start_year,
            endYear: entry.end_year ?? null,
            location: entry.location,
            title: entry.title,
            details: entry.details ?? null,
            displayOrder: entry.display_order,
          })),
        });
      }
    }

    // 7. Créer les intérêts pour les clubs
    if (data.club_interests && data.club_interests.length > 0) {
      await tx.clubInterest.createMany({
        data: data.club_interests.map((interest) => ({
          resumeId,
          clubName: interest.club_name,
          clubLogoUrl: interest.club_logo_url ?? null,
          year: interest.year,
          displayOrder: interest.display_order,
        })),
      });
    }

    return resumeId;
  });
}

/**
 * Récupère un CV complet avec toutes ses relations par son ID
 */
export async function getCompleteResume(
  resumeId: string,
): Promise<CompleteResumeResponse | null> {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: {
      playerProfile: true,
      contact: true,
      careerSeasons: {
        orderBy: { displayOrder: "asc" },
        include: {
          careerClubs: {
            include: {
              division: true,
            },
            orderBy: [{ startMonth: "asc" }, { endMonth: "asc" }],
          },
        },
      },
      trainingEntries: {
        orderBy: { displayOrder: "asc" },
      },
      clubInterests: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!resume) {
    return null;
  }

  // Vérifier que les relations obligatoires existent
  if (!resume.playerProfile) {
    throw new Error(`CV ${resumeId} incomplet: profil joueur manquant`);
  }
  if (!resume.contact) {
    throw new Error(`CV ${resumeId} incomplet: contacts manquants`);
  }

  // Transformer les données Prisma en format CompleteResumeResponse
  const response: CompleteResumeResponse = {
    resume: {
      id: resume.id,
      created_at: resume.createdAt.toISOString(),
      updated_at: resume.updatedAt.toISOString(),
      is_treated: resume.isTreated,
      color: resume.color,
      formation_system: resume.formationSystem,
    },
    player_profile: {
      id: resume.playerProfile.id,
      first_name: resume.playerProfile.firstName,
      last_name: resume.playerProfile.lastName,
      birth_date: resume.playerProfile.birthDate,
      nationalities: JSON.parse(resume.playerProfile.nationalities || "[]"),
      strong_foot: resume.playerProfile.strongFoot,
      height_cm: resume.playerProfile.heightCm,
      weight_kg: resume.playerProfile.weightKg,
      main_position: resume.playerProfile.mainPosition,
      positions: JSON.parse(resume.playerProfile.positions || "[]"),
      vma: resume.playerProfile.vma,
      wingspan_cm: resume.playerProfile.wingspanCm,
      stats_url: resume.playerProfile.statsUrl,
      video_url: resume.playerProfile.videoUrl,
      photo_path: resume.playerProfile.photoPath,
      is_international: resume.playerProfile.isInternational,
      international_country: resume.playerProfile.internationalCountry,
      international_division: resume.playerProfile.internationalDivision,
    },
    contacts: {
      id: resume.contact.id,
      player_email: resume.contact.playerEmail,
      player_phone: resume.contact.playerPhone,
      agent_email: resume.contact.agentEmail,
      agent_phone: resume.contact.agentPhone,
    },
    qualities: JSON.parse(resume.playerProfile.qualities || "[]"),
    career_seasons: resume.careerSeasons.map((season) => ({
      id: season.id,
      start_year: season.startYear,
      end_year: season.endYear,
      display_order: season.displayOrder,
      clubs: season.careerClubs.map((club) => ({
        id: club.id,
        division_id: club.divisionId,
        division_name: club.division.divisionName,
        division_logo_url: club.division.logoUrl,
        club_name: club.clubName,
        club_logo_url: club.clubLogoUrl,
        category: club.category,
        start_month: club.startMonth,
        end_month: club.endMonth,
        is_captain: club.isCaptain,
        is_promoted: club.isPromoted,
        is_champion: club.isChampion,
        is_cup_winner: club.isCupWinner,
        matches_played: club.matchesPlayed,
        goals: club.goals,
        assists: club.assists,
        avg_playtime_minutes: club.avgPlaytimeMinutes,
        clean_sheets: club.cleanSheets,
      })),
    })),
    training_entries: resume.trainingEntries
      .filter(
        (entry) =>
          entry.startYear &&
          entry.startYear > 0 &&
          entry.endYear &&
          entry.endYear > 0 &&
          entry.title?.trim() &&
          entry.location?.trim(),
      )
      .map((entry) => ({
        id: entry.id,
        start_year: entry.startYear,
        end_year: entry.endYear,
        location: entry.location,
        title: entry.title,
        details: entry.details,
        display_order: entry.displayOrder,
      })),
    club_interests: resume.clubInterests.map((interest) => ({
      id: interest.id,
      club_name: interest.clubName,
      club_logo_url: interest.clubLogoUrl,
      year: interest.year,
      display_order: interest.displayOrder,
    })),
  };

  return response;
}

/**
 * Récupère la liste des CVs avec filtrage par statut
 */
export async function getAllResumes(
  status: "all" | "treated" | "untreated" = "all",
): Promise<ResumeListItem[]> {
  // Construire le filtre selon le status
  const where: { isTreated?: number } = {};

  if (status === "treated") {
    where.isTreated = 1;
  } else if (status === "untreated") {
    where.isTreated = 0;
  }
  // Si status === 'all', pas de filtre (where reste vide)

  const resumes = await prisma.resume.findMany({
    where,
    include: {
      playerProfile: true,
    },
    orderBy: {
      createdAt: "desc", // Plus récents en premier
    },
  });

  // Transformer les données Prisma en format ResumeListItem
  return resumes
    .filter((resume) => resume.playerProfile !== null) // Filtrer les CVs sans profil
    .map((resume) => ({
      id: resume.id,
      first_name: resume.playerProfile!.firstName,
      last_name: resume.playerProfile!.lastName,
      main_position: resume.playerProfile!.mainPosition,
      created_at: resume.createdAt.toISOString(),
      is_treated: resume.isTreated,
    }));
}

/**
 * Met à jour le statut de traitement d'un CV
 */
export async function updateResumeTreatmentStatus(
  resumeId: string,
  isTreated: boolean,
): Promise<boolean> {
  try {
    await prisma.resume.update({
      where: { id: resumeId },
      data: { isTreated: isTreated ? 1 : 0 },
    });
    return true;
  } catch (error: any) {
    // P2025 = record not found
    if (error?.code === "P2025") {
      return false;
    }
    throw error;
  }
}

/**
 * Met à jour un CV complet ou partiel avec toutes ses relations
 */
export async function updateCompleteResume(
  resumeId: string,
  data: PlayerSubmissionInput | PartialPlayerSubmissionInput,
): Promise<boolean> {
  return await prisma.$transaction(async (tx) => {
    // Vérifier que le CV existe
    const existingResume = await tx.resume.findUnique({
      where: { id: resumeId },
      include: {
        playerProfile: true,
        contact: true,
      },
    });

    if (!existingResume) {
      throw new Error(`CV ${resumeId} non trouvé`);
    }

    if (!existingResume.playerProfile || !existingResume.contact) {
      throw new Error(
        `CV ${resumeId} incomplet: profil joueur ou contacts manquants`,
      );
    }

    // 1. Mettre à jour le CV de base
    if (data.resume) {
      const resumeUpdateData: { color?: string; formationSystem?: string; isTreated?: number } = {};
      if (data.resume.color !== undefined)
        resumeUpdateData.color = data.resume.color;
      if (data.resume.formation_system !== undefined)
        resumeUpdateData.formationSystem = data.resume.formation_system;
      if (data.resume.is_treated !== undefined)
        resumeUpdateData.isTreated = data.resume.is_treated;

      if (Object.keys(resumeUpdateData).length > 0) {
        await tx.resume.update({
          where: { id: resumeId },
          data: resumeUpdateData,
        });
      }
    }

    // 2. Mettre à jour le profil joueur
    if (data.player_profile || data.qualities !== undefined) {
      const profileUpdateData: any = {};

      if (data.player_profile) {
        if (data.player_profile.first_name !== undefined)
          profileUpdateData.firstName = data.player_profile.first_name;
        if (data.player_profile.last_name !== undefined)
          profileUpdateData.lastName = data.player_profile.last_name;
        if (data.player_profile.birth_date !== undefined)
          profileUpdateData.birthDate = data.player_profile.birth_date;
        if (data.player_profile.nationalities !== undefined)
          profileUpdateData.nationalities = JSON.stringify(
            data.player_profile.nationalities || [],
          );
        if (data.player_profile.strong_foot !== undefined)
          profileUpdateData.strongFoot = data.player_profile.strong_foot;
        if (data.player_profile.height_cm !== undefined)
          profileUpdateData.heightCm = data.player_profile.height_cm;
        if (data.player_profile.weight_kg !== undefined)
          profileUpdateData.weightKg = data.player_profile.weight_kg;
        if (data.player_profile.main_position !== undefined)
          profileUpdateData.mainPosition = data.player_profile.main_position;
        if (data.player_profile.positions !== undefined)
          profileUpdateData.positions = JSON.stringify(
            data.player_profile.positions || [],
          );
        if (data.player_profile.vma !== undefined)
          profileUpdateData.vma = data.player_profile.vma ?? null;
        if (data.player_profile.wingspan_cm !== undefined)
          profileUpdateData.wingspanCm =
            data.player_profile.wingspan_cm ?? null;
        if (data.player_profile.stats_url !== undefined)
          profileUpdateData.statsUrl = data.player_profile.stats_url ?? null;
        if (data.player_profile.video_url !== undefined)
          profileUpdateData.videoUrl = data.player_profile.video_url ?? null;
        if (data.player_profile.photo_path !== undefined)
          profileUpdateData.photoPath = data.player_profile.photo_path;
        if (data.player_profile.is_international !== undefined)
          profileUpdateData.isInternational =
            data.player_profile.is_international ?? 0;
        if (data.player_profile.international_country !== undefined)
          profileUpdateData.internationalCountry =
            data.player_profile.international_country ?? null;
        if (data.player_profile.international_division !== undefined)
          profileUpdateData.internationalDivision =
            data.player_profile.international_division ?? null;
      }

      if (data.qualities !== undefined) {
        profileUpdateData.qualities = JSON.stringify(data.qualities || []);
      }

      if (Object.keys(profileUpdateData).length > 0) {
        await tx.playerProfile.update({
          where: { id: existingResume.playerProfile.id },
          data: profileUpdateData,
        });
      }
    }

    // 3. Mettre à jour les contacts
    if (data.contacts) {
      const contactUpdateData: any = {};
      if (data.contacts.player_email !== undefined)
        contactUpdateData.playerEmail = data.contacts.player_email;
      if (data.contacts.player_phone !== undefined)
        contactUpdateData.playerPhone = data.contacts.player_phone;
      if (data.contacts.agent_email !== undefined)
        contactUpdateData.agentEmail = data.contacts.agent_email ?? null;
      if (data.contacts.agent_phone !== undefined)
        contactUpdateData.agentPhone = data.contacts.agent_phone ?? null;

      if (Object.keys(contactUpdateData).length > 0) {
        await tx.contact.update({
          where: { id: existingResume.contact.id },
          data: contactUpdateData,
        });
      }
    }

    // 4. Mettre à jour les saisons de carrière
    if (data.career_seasons !== undefined) {
      const existingSeasons = await tx.careerSeason.findMany({
        where: { resumeId },
        include: {
          careerClubs: {
            include: { division: true },
          },
        },
      });

      const seasonById = new Map(existingSeasons.map((s) => [s.id, s]));

      for (const season of data.career_seasons) {
        const existingSeason = season.id ? seasonById.get(season.id) : null;

        if (existingSeason) {
          // Mettre à jour la saison existante
          const seasonUpdateData: any = {};
          if (season.start_year !== undefined)
            seasonUpdateData.startYear = season.start_year;
          if (season.end_year !== undefined)
            seasonUpdateData.endYear = season.end_year;
          if (season.display_order !== undefined)
            seasonUpdateData.displayOrder = season.display_order;

          if (Object.keys(seasonUpdateData).length > 0) {
            await tx.careerSeason.update({
              where: { id: existingSeason.id },
              data: seasonUpdateData,
            });
          }

          // Mettre à jour les clubs de la saison
          if (season.clubs !== undefined) {
            const clubById = new Map(
              existingSeason.careerClubs.map((c) => [c.id, c]),
            );

            for (const club of season.clubs) {
              const existingClub = club.id
                ? (clubById.get(club.id) ?? null)
                : null;
              await upsertCareerClub(
                tx,
                existingSeason.id,
                club,
                existingClub
                  ? { id: existingClub.id, divisionId: existingClub.divisionId }
                  : null,
              );
            }
          }
        } else {
          // Créer une nouvelle saison
          if (
            season.start_year === undefined ||
            season.end_year === undefined ||
            season.display_order === undefined
          ) {
            throw new Error(
              "start_year, end_year et display_order sont requis pour créer une saison",
            );
          }

          const createdSeason = await tx.careerSeason.create({
            data: {
              resumeId,
              startYear: season.start_year,
              endYear: season.end_year,
              displayOrder: season.display_order,
            },
          });

          // Créer les clubs de la nouvelle saison
          if (season.clubs && season.clubs.length > 0) {
            for (const club of season.clubs) {
              await upsertCareerClub(tx, createdSeason.id, club, null);
            }
          }
        }
      }
    }

    // 5. Mettre à jour les entrées de formation
    if (data.training_entries !== undefined) {
      // Filtrer les entrées vides avant traitement
      const validEntries = data.training_entries.filter(
        (entry) =>
          entry.start_year &&
          entry.start_year > 0 &&
          entry.end_year &&
          entry.end_year > 0 &&
          entry.title?.trim() &&
          entry.location?.trim(),
      );

      const existingEntries = await tx.trainingEntry.findMany({
        where: { resumeId },
      });
      const entryById = new Map(existingEntries.map((e) => [e.id, e]));
      const processedEntryIds = new Set<string>();

      for (const entry of validEntries) {
        const existingEntry = entry.id
          ? (entryById.get(entry.id) ?? null)
          : null;
        await upsertTrainingEntry(tx, resumeId, entry, existingEntry);
        if (existingEntry) {
          processedEntryIds.add(existingEntry.id);
        }
      }

      // Supprimer les entrées qui ne sont plus dans la liste
      const entriesToDelete = existingEntries.filter(
        (e) => !processedEntryIds.has(e.id),
      );
      if (entriesToDelete.length > 0) {
        await tx.trainingEntry.deleteMany({
          where: {
            id: { in: entriesToDelete.map((e) => e.id) },
          },
        });
      }
    }

    // 6. Mettre à jour les intérêts pour les clubs
    if (data.club_interests !== undefined) {
      const existingInterests = await tx.clubInterest.findMany({
        where: { resumeId },
      });
      const interestById = new Map(existingInterests.map((i) => [i.id, i]));

      for (const interest of data.club_interests) {
        const existingInterest = interest.id
          ? (interestById.get(interest.id) ?? null)
          : null;
        await upsertClubInterest(tx, resumeId, interest, existingInterest);
      }
    }

    return true;
  });
}

/**
 * Supprime un CV et toutes ses relations (cascade automatique)
 */
export async function deleteResume(resumeId: string): Promise<boolean> {
  try {
    // Vérifier que le CV existe
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return false;
    }

    // Supprimer le CV (les relations seront supprimées automatiquement grâce au cascade)
    await prisma.resume.delete({
      where: { id: resumeId },
    });

    return true;
  } catch (error: any) {
    // P2025 = record not found
    if (error?.code === "P2025") {
      return false;
    }
    throw error;
  }
}

/**
 * Met à jour le logo d'une division
 */
export async function updateDivisionLogo(
  divisionId: string,
  logoUrl: string,
): Promise<boolean> {
  try {
    await prisma.division.update({
      where: { id: divisionId },
      data: { logoUrl },
    });
    return true;
  } catch (error: any) {
    // P2025 = record not found
    if (error?.code === "P2025") {
      return false;
    }
    throw error;
  }
}
