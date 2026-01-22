/**
 * Route API pour la soumission du formulaire joueur
 * POST /api/submit-resume
 */

import { NextRequest, NextResponse } from "next/server";
import { createCompleteResume } from "@/lib/services/resume-service";

import type { PlayerSubmissionInput } from "@/types/submission";

export async function POST(request: NextRequest) {
  try {
    // Parser le JSON avec gestion d'erreur
    let body: PlayerSubmissionInput;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Format JSON invalide" },
        { status: 400 },
      );
    }

    // Validation basique des données requises
    if (!body.resume || !body.player_profile || !body.contacts) {
      return NextResponse.json(
        {
          error:
            "Données manquantes: resume, player_profile et contacts sont requis",
        },
        { status: 400 },
      );
    }

    // Validation du CV
    if (!body.resume.color || !body.resume.formation_system) {
      return NextResponse.json(
        { error: "Le CV doit contenir une couleur et un système de formation" },
        { status: 400 },
      );
    }

    // Validation du format de la couleur (hex)
    if (!/^#[0-9A-Fa-f]{6}$/.test(body.resume.color)) {
      return NextResponse.json(
        { error: "La couleur doit être au format hex (#RRGGBB)" },
        { status: 400 },
      );
    }

    // Validation du système de formation
    if (!["4-3-3", "3-5-2"].includes(body.resume.formation_system)) {
      return NextResponse.json(
        { error: 'Le système de formation doit être "4-3-3" ou "3-5-2"' },
        { status: 400 },
      );
    }

    // Validation du profil joueur
    if (
      !body.player_profile.first_name ||
      !body.player_profile.last_name ||
      !body.player_profile.birth_date ||
      !body.player_profile.photo_path ||
      body.player_profile.weight_kg === undefined ||
      body.player_profile.weight_kg === null ||
      !body.player_profile.main_position
    ) {
      return NextResponse.json(
        {
          error:
            "Le profil joueur doit contenir: prénom, nom, date de naissance, photo, poids et position principale",
        },
        { status: 400 },
      );
    }

    // Validation des champs numériques du profil
    if (
      body.player_profile.height_cm === undefined ||
      body.player_profile.height_cm === null
    ) {
      return NextResponse.json(
        { error: "Le profil joueur doit contenir la taille" },
        { status: 400 },
      );
    }

    if (!body.player_profile.strong_foot) {
      return NextResponse.json(
        { error: "Le profil joueur doit contenir le pied fort" },
        { status: 400 },
      );
    }

    // Validation du format de la date de naissance (ISO date)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.player_profile.birth_date)) {
      return NextResponse.json(
        { error: "La date de naissance doit être au format ISO (YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    // Validation des contacts
    if (!body.contacts.player_email || !body.contacts.player_phone) {
      return NextResponse.json(
        {
          error:
            "Les contacts doivent contenir au minimum: l'email du joueur et le téléphone du joueur",
        },
        { status: 400 },
      );
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.contacts.player_email)) {
      return NextResponse.json(
        { error: "Format d'email invalide pour l'email du joueur" },
        { status: 400 },
      );
    }

    if (
      body.contacts.agent_email &&
      !emailRegex.test(body.contacts.agent_email)
    ) {
      return NextResponse.json(
        { error: "Format d'email invalide pour l'email de l'agent" },
        { status: 400 },
      );
    }

    // Validation des limites de longueur
    if (body.resume.formation_system.length > 10) {
      return NextResponse.json(
        { error: "Le système de formation ne peut pas dépasser 10 caractères" },
        { status: 400 },
      );
    }

    if (body.player_profile.first_name.length > 100) {
      return NextResponse.json(
        { error: "Le prénom ne peut pas dépasser 100 caractères" },
        { status: 400 },
      );
    }

    if (body.player_profile.last_name.length > 100) {
      return NextResponse.json(
        { error: "Le nom ne peut pas dépasser 100 caractères" },
        { status: 400 },
      );
    }

    if (body.player_profile.main_position.length > 100) {
      return NextResponse.json(
        { error: "La position principale ne peut pas dépasser 100 caractères" },
        { status: 400 },
      );
    }

    if (body.player_profile.photo_path.length > 255) {
      return NextResponse.json(
        { error: "Le chemin de la photo ne peut pas dépasser 255 caractères" },
        { status: 400 },
      );
    }

    // Validation que les arrays sont bien des arrays
    if (body.qualities && !Array.isArray(body.qualities)) {
      return NextResponse.json(
        { error: "Les qualités doivent être un tableau" },
        { status: 400 },
      );
    }

    if (body.career_seasons && !Array.isArray(body.career_seasons)) {
      return NextResponse.json(
        { error: "Les saisons de carrière doivent être un tableau" },
        { status: 400 },
      );
    }

    if (body.training_entries && !Array.isArray(body.training_entries)) {
      return NextResponse.json(
        { error: "Les formations doivent être un tableau" },
        { status: 400 },
      );
    }

    if (body.club_interests && !Array.isArray(body.club_interests)) {
      return NextResponse.json(
        { error: "Les intérêts de clubs doivent être un tableau" },
        { status: 400 },
      );
    }

    // Validation des qualités (max 6)
    if (body.qualities && body.qualities.length > 6) {
      return NextResponse.json(
        { error: "Maximum 6 qualités autorisées" },
        { status: 400 },
      );
    }

    // Validation des qualités individuelles (tableau de strings)
    if (body.qualities) {
      for (const quality of body.qualities) {
        if (typeof quality !== "string") {
          return NextResponse.json(
            { error: "Les qualités doivent être un tableau de strings" },
            { status: 400 },
          );
        }
        if (quality.length > 24) {
          return NextResponse.json(
            {
              error: `La qualité "${quality}" ne peut pas dépasser 24 caractères`,
            },
            { status: 400 },
          );
        }
        if (quality.trim().length === 0) {
          return NextResponse.json(
            { error: "Les qualités ne peuvent pas être vides" },
            { status: 400 },
          );
        }
      }
    }

    // Validation des saisons (max 5)
    if (body.career_seasons && body.career_seasons.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 saisons de carrière autorisées" },
        { status: 400 },
      );
    }

    // Validation des clubs : chaque club doit avoir division_id ou division_name
    if (body.career_seasons) {
      for (const season of body.career_seasons) {
        if (!season.clubs || !Array.isArray(season.clubs)) {
          return NextResponse.json(
            { error: "Chaque saison doit avoir un tableau de clubs" },
            { status: 400 },
          );
        }

        if (season.clubs.length === 0) {
          return NextResponse.json(
            { error: "Chaque saison doit avoir au moins un club" },
            { status: 400 },
          );
        }
        if (season.display_order < 1 || season.display_order > 5) {
          return NextResponse.json(
            { error: "Le display_order des saisons doit être entre 1 et 5" },
            { status: 400 },
          );
        }

        if (season.start_year > season.end_year) {
          return NextResponse.json(
            {
              error: `L'année de début (${season.start_year}) ne peut pas être supérieure à l'année de fin (${season.end_year})`,
            },
            { status: 400 },
          );
        }

        for (const club of season.clubs) {
          if (!club.division_id && !club.division_name) {
            return NextResponse.json(
              {
                error: `Chaque club doit avoir division_id ou division_name. Club "${club.club_name}" manquant.`,
              },
              { status: 400 },
            );
          }

          if (club.club_name.length > 200) {
            return NextResponse.json(
              {
                error: `Le nom du club "${club.club_name}" ne peut pas dépasser 200 caractères`,
              },
              { status: 400 },
            );
          }

          if (club.category && club.category.length > 50) {
            return NextResponse.json(
              {
                error: `La catégorie du club "${club.club_name}" ne peut pas dépasser 50 caractères`,
              },
              { status: 400 },
            );
          }

          if (
            club.matches_played === undefined ||
            club.matches_played === null
          ) {
            return NextResponse.json(
              {
                error: `Le nombre de matches joués est requis pour le club "${club.club_name}"`,
              },
              { status: 400 },
            );
          }
        }
      }
    }

    // Validation des entrées de formation
    if (body.training_entries) {
      for (const entry of body.training_entries) {
        if (entry.location.length > 200) {
          return NextResponse.json(
            {
              error: `Le lieu de formation "${entry.location}" ne peut pas dépasser 200 caractères`,
            },
            { status: 400 },
          );
        }
        if (entry.title.length > 1000) {
          return NextResponse.json(
            {
              error: `Le titre de formation "${entry.title}" ne peut pas dépasser 1000 caractères`,
            },
            { status: 400 },
          );
        }
        if (entry.details && entry.details.length > 1000) {
          return NextResponse.json(
            {
              error: `Les détails de formation ne peuvent pas dépasser 1000 caractères`,
            },
            { status: 400 },
          );
        }
      }
    }

    // Validation des intérêts clubs
    if (body.club_interests) {
      for (const interest of body.club_interests) {
        if (interest.club_name.length > 200) {
          return NextResponse.json(
            {
              error: `Le nom du club d'intérêt "${interest.club_name}" ne peut pas dépasser 200 caractères`,
            },
            { status: 400 },
          );
        }
        if (!/^\d{4}$/.test(interest.year)) {
          return NextResponse.json(
            {
              error: `L'année d'intérêt doit être au format YYYY (4 chiffres)`,
            },
            { status: 400 },
          );
        }
      }
    }

    // Créer le CV complet
    const resumeId = await createCompleteResume({
      resume: body.resume,
      player_profile: body.player_profile,
      contacts: body.contacts,
      qualities: body.qualities || [],
      career_seasons: body.career_seasons || [],
      training_entries: body.training_entries || [],
      club_interests: body.club_interests || [],
    });

    return NextResponse.json(
      {
        success: true,
        resume_id: resumeId,
        message: "CV créé avec succès",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur lors de la création du CV:", error);

    // Gérer les erreurs de validation métier (du service)
    if (error instanceof Error) {
      // Erreurs de validation métier (400)
      if (
        error.message.includes("manquant") ||
        error.message.includes("Division") ||
        error.message.includes("Club")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Erreurs Prisma (contraintes de base de données)
      if (
        error.message.includes("Unique constraint") ||
        error.message.includes("Foreign key constraint") ||
        error.message.includes("constraint")
      ) {
        return NextResponse.json(
          {
            error: "Erreur de contrainte de base de données: " + error.message,
          },
          { status: 400 },
        );
      }

      // Autres erreurs Prisma
      if (
        error.message.includes("prisma") ||
        error.message.includes("Prisma")
      ) {
        return NextResponse.json(
          { error: "Erreur de base de données" },
          { status: 500 },
        );
      }

      // Erreurs génériques
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
