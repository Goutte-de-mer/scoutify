/**
 * Interfaces pour la génération de PDF avec Puppeteer
 */

import type { CompleteResumeResponse } from "@/types/submission";
import {
  CircleUserRound,
  CalendarDays,
  Weight,
  Ruler,
  RulerDimensionLine,
  CircleCheckBig,
  Dot,
  Mail,
  ChevronRight,
  Crown,
  Star,
  Medal,
  Trophy,
} from "lucide-react";

/**
 * Options de configuration pour la génération PDF avec Puppeteer
 */
export interface PuppeteerPDFOptions {
  format?: "A4" | "Letter" | "Legal" | "Tabloid" | "Ledger" | string;
  width?: string;
  height?: string;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  preferCSSPageSize?: boolean;
  scale?: number;
  landscape?: boolean;
  pageRanges?: string;
  path?: string;
  omitBackground?: boolean;
  timeout?: number;
}

/**
 * Données formatées pour le rendu du CV dans le PDF
 * Basé sur CompleteResumeResponse mais avec des données prêtes pour l'affichage
 */
export interface PDFResumeData {
  // Informations de base du CV
  resume: {
    id: string;
    color: string;
    formation_system: string;
    created_at: string;
  };

  // Profil joueur
  player: {
    full_name: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    age?: number; // Calculé à partir de birth_date
    nationalities: string[];
    strong_foot: string;
    height_cm: number;
    weight_kg: number;
    main_position: string;
    positions: string[];
    vma?: number | null;
    wingspan_cm?: number | null;
    stats_url?: string | null;
    video_url?: string | null;
    photo_url: string; // URL complète de la photo
    is_international: boolean;
    international_country?: string | null;
    international_division?: string | null;
  };

  // Contacts
  contacts: {
    player_email: string;
    player_phone: string;
    agent_email?: string | null;
    agent_phone?: string | null;
  };

  // Qualités
  qualities: string[];

  // Carrière formatée pour l'affichage
  career: Array<{
    id: string;
    season: string; // Format: "2020-2021" ou "2020"
    start_year: number;
    end_year: number;
    display_order: number;
    clubs: Array<{
      id: string;
      division_name: string;
      club_name: string;
      club_logo_url?: string | null;
      category: string;
      period?: string; // Format: "Jan - Mar" si start_month/end_month
      start_month?: number | null;
      end_month?: number | null;
      badges: {
        is_captain: boolean;
        is_promoted: boolean;
        is_champion: boolean;
        is_cup_winner: boolean;
      };
      stats: {
        matches_played: number;
        goals?: number | null;
        assists?: number | null;
        avg_playtime_minutes?: number | null;
        clean_sheets?: number | null;
      };
    }>;
  }>;

  // Formations
  training: Array<{
    id: string;
    period: string; // Format: "2020-2022" ou "2020 - En cours"
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
 * Options spécifiques pour la génération du PDF de CV
 */
export interface ResumePDFGenerationOptions extends PuppeteerPDFOptions {
  // Options par défaut pour un CV
  format?: "A4";
  printBackground?: true;
  margin?: {
    top?: "20mm";
    right?: "15mm";
    bottom?: "20mm";
    left?: "15mm";
  };
  scale?: 1;
  landscape?: false;
}

/**
 * Configuration complète pour générer un PDF de CV
 */
export interface GenerateResumePDFConfig {
  // Données du CV à convertir
  resumeData: CompleteResumeResponse;

  // Options Puppeteer
  pdfOptions?: ResumePDFGenerationOptions;

  // Options de transformation des données
  transformOptions?: {
    includePhoto?: boolean;
    includeStats?: boolean;
    includeVideo?: boolean;
    includeClubLogos?: boolean;
    photoBaseUrl?: string; // URL de base pour les photos (ex: process.env.NEXT_PUBLIC_BASE_URL)
    logoBaseUrl?: string; // URL de base pour les logos
  };
}

/**
 * Résultat de la génération PDF
 */
export interface PDFGenerationResult {
  success: boolean;
  pdfBuffer?: Buffer;
  pdfPath?: string;
  error?: string;
  metadata?: {
    pages?: number;
    size?: number; // Taille en bytes
  };
}
export default function ResumeContent({
  data,
}: {
  data: CompleteResumeResponse;
}) {
  const fullName = `${data.player_profile.first_name} ${data.player_profile.last_name}`;
  const mainPosition = data.player_profile.main_position;
  console.log(data);

  // Fonction pour convertir le numéro de mois en nom de mois en français (3 premières lettres)
  const getMonthName = (month: number | null | undefined): string => {
    if (!month) return "";
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    const monthName = months[month - 1] || "";
    return monthName.substring(0, 3);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-800 p-4">
      <div
        className="relative overflow-hidden bg-white shadow-lg"
        style={{
          width: "210mm",
          height: "297mm",
          minHeight: "297mm",
        }}
      >
        {/* Contenu principal */}
        <div className="absolute top-0 left-0 mt-3 -ml-[5%] flex w-[110%] -rotate-4 items-center bg-black px-30 py-12 z-10">
          <div className="rotate-4">
            <h1 className="text-4xl font-bold text-white">
              {data.player_profile.first_name.toUpperCase()}{" "}
              {data.player_profile.last_name.toUpperCase()}
            </h1>


            <h2 className="ml-40 text-4xl font-bold text-black">
              .
            </h2>

          </div>
        </div>
        <div className="top-47 ml-6 h-[calc(100%-188px)] absolute flex gap-4 w-[calc(100%-24px)]">

          <div
            className="relative w-fit min-w-55 flex flex-col space-y-10 border-x-8 border-black px-5 pt-35 pb-4 text-white"
            style={{ backgroundColor: data.resume.color }}
          >
            <div className="left-[50%] translate-x-[-50%] absolute -top-15 z-30 h-45 w-35 border-4 flex gap-4 border-white">
              <img
                src={data.player_profile.photo_path}
                alt={fullName}
                className="h-full w-full object-cover"
              />
              <h2 className="text-4xl font-extrabold text-white -mt-3">
                {mainPosition.toUpperCase()}
              </h2>
            </div>
            {/* Profil */}
            <div>
              <h2 className="mb-3.5 flex items-center justify-center gap-4 text-2xl font-bold text-white">
                <CircleUserRound strokeWidth={1} size={40} color="white" /> PROFIL
              </h2>
              <div className="space-y-2">
                <p className="profile-entry">
                  <CalendarDays strokeWidth={1} size={20} color="white" />{" "}
                  <span className="font-semibold">Naissance :</span>{" "}
                  {data.player_profile.birth_date.split("-").reverse().join("/")}
                </p>
                <p className="profile-entry">
                  <Weight strokeWidth={1} size={20} color="white" />{" "}
                  <span className="font-semibold">Poids :</span>{" "}
                  {data.player_profile.weight_kg} kg
                </p>
                <p className="profile-entry">
                  <Ruler strokeWidth={1} size={20} color="white" />{" "}
                  <span className="font-semibold">Taille :</span>{" "}
                  {data.player_profile.height_cm} cm
                </p>
                {data.player_profile.wingspan_cm && (
                  <p className="profile-entry">
                    <RulerDimensionLine strokeWidth={1} size={20} color="white" />{" "}
                    <span className="font-semibold">Envergure :</span>{" "}
                    {data.player_profile.wingspan_cm} cm
                  </p>
                )}
                {data.player_profile.vma && (
                  <p className="profile-entry">
                    {" "}
                    <span className="font-semibold">VMA :</span>{" "}
                    {data.player_profile.vma} km/h
                  </p>
                )}
              </div>
            </div>
            {/* Qualités */}
            <div>
              <h2 className="mb-3.5 flex items-center justify-center gap-4 text-2xl font-extrabold text-white">
                <CircleCheckBig strokeWidth={1.5} size={40} color="white" />{" "}
                QUALITÉS
              </h2>
              <div className="space-y-2">
                <ul>
                  {data.qualities.map((quality, index) => (
                    <li className="flex items-center text-xs" key={index}>
                      <Dot /> {quality}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Contacts */}
            <div>
              <h2 className="mb-3.5 flex items-center justify-center gap-4 text-2xl font-extrabold text-white">
                <Mail strokeWidth={1.5} size={40} color="white" /> CONTACTS
              </h2>
              <div className="space-y-2">
                <p className="profile-entry">
                  <Mail strokeWidth={1.5} size={20} color="white" />{" "}
                  {data.contacts.agent_email || data.contacts.player_email}
                </p>
              </div>
            </div>
          </div>
          <div className="pt-6 flex-1 flex flex-col gap-3 mr-3">
            <h2 className="bg-black text-white text-2xl font-extrabold px-3 py-1 text-center w-fit">CARRIÈRE & STATISTIQUES</h2>
            {data.career_seasons.map((season, i) => {
              const hasMultipleClubs = season.clubs.length > 1;

              return season.clubs.map((club, j) => {
                const isFullSeason = !club.start_month && !club.end_month;
                const textBadges = [];
                if (isFullSeason) textBadges.push("Saison complète");
                if (data.player_profile.is_international && data.player_profile.international_division) {
                  textBadges.push(`Sélection ${data.player_profile.international_division}`);
                }

                // Construire le préfixe de mois si nécessaire
                let monthPrefix = "";
                if (hasMultipleClubs && (club.start_month || club.end_month)) {
                  if (club.start_month && club.end_month) {
                    monthPrefix = `${getMonthName(club.start_month)} - ${getMonthName(club.end_month)} `;
                  } else if (club.start_month) {
                    monthPrefix = `${getMonthName(club.start_month)} `;
                  } else if (club.end_month) {
                    monthPrefix = `${getMonthName(club.end_month)} `;
                  }
                }

                return (
                  <div key={`${i}-${j}`} className="flex items-start gap-4 w-full">
                    <div className="flex-1">
                      {/* Années et nom du club */}
                      <div className="flex items-center w-full relative justify-between pr-2">
                        <div className="flex items-center">
                          {monthPrefix && <span className="text-lg font-bold mr-1">{monthPrefix}</span>}
                          <span className="text-lg font-bold">{season.start_year}</span>
                          <ChevronRight strokeWidth={3} size={20} style={{ color: data.resume.color }} />
                          <span className="text-lg font-bold mr-1">{season.end_year}</span>
                          <span className="text-lg font-bold"> - {club.club_name.toUpperCase()}</span>
                        </div>

                        {club.club_logo_url && (
                          <div className="absolute right-4 top-[50%] translate-y-[-50%]">

                            <img
                              src={club.club_logo_url}
                              alt={club.club_name}
                              className="w-14 h-14 object-contain"
                            />
                          </div>
                        )}
                      </div>

                      {/* Division */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold" style={{ color: data.resume.color }}>
                          {club.category} {club.division_name}
                        </span>
                        {club.division_logo_url && (

                          <img
                            src={club.division_logo_url}
                            alt={club.division_name}
                            className="w-10 h-10 object-contain"
                          />

                        )}
                      </div>

                      {/* Badges de distinction */}
                      {(club.is_captain === 1 || club.is_promoted === 1 || club.is_champion === 1 || club.is_cup_winner === 1) && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {club.is_captain === 1 && (
                            <div
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                              style={{ backgroundColor: '#f5f5f0', color: data.resume.color }}
                            >
                              <Crown size={14} />
                              Capitaine
                            </div>
                          )}
                          {club.is_promoted === 1 && (
                            <div
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                              style={{ backgroundColor: '#f5f5f0', color: data.resume.color }}
                            >
                              <Star size={14} />
                              Surclassé
                            </div>
                          )}
                          {club.is_champion === 1 && (
                            <div
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                              style={{ backgroundColor: '#f5f5f0', color: data.resume.color }}
                            >
                              <Medal size={14} />
                              Champion
                            </div>
                          )}
                          {club.is_cup_winner === 1 && (
                            <div
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                              style={{ backgroundColor: '#f5f5f0', color: data.resume.color }}
                            >
                              <Trophy size={14} />
                              Coupe
                            </div>
                          )}
                        </div>
                      )}

                      {/* Badges texte (Saison complète, Sélection) */}
                      {textBadges.length > 0 && (
                        <ul className="space-y-1 mb-2">
                          {textBadges.map((badge, idx) => (
                            <li key={idx} className="text-sm flex items-start">
                              <span className="mr-2">•</span>
                              <span>{badge}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Statistiques */}
                      <div className="flex items-center gap-2 mt-2">
                        {club.clean_sheets !== null && club.clean_sheets !== undefined && club.clean_sheets > 0 && (
                          <>
                            <div className="bg-gray-200 px-1 rounded-xs shadow-sm">
                              <span className="font-bold text-xs">{club.clean_sheets}</span>
                            </div>
                            <span className="text-sm">clean sheets</span>
                          </>
                        )}
                        {club.goals !== null && club.goals !== undefined && club.goals > 0 && (!club.clean_sheets || club.clean_sheets === 0) && (
                          <>
                            <div className="bg-gray-200 px-1 rounded-xs shadow-sm">
                              <span className="font-bold text-xs">{club.goals}</span>
                            </div>
                            <span className="text-sm">buts</span>
                          </>
                        )}
                        {club.assists !== null && club.assists !== undefined && club.assists > 0 && (!club.clean_sheets || club.clean_sheets === 0) && (!club.goals || club.goals === 0) && (
                          <>
                            <div className="bg-gray-200 px-1 rounded-xs shadow-sm">
                              <span className="font-bold text-xs">{club.assists}</span>
                            </div>
                            <span className="text-sm">passes décisives</span>
                          </>
                        )}
                        {(!club.clean_sheets || club.clean_sheets === 0) && (!club.goals || club.goals === 0) && (!club.assists || club.assists === 0) && club.matches_played > 0 && (
                          <>
                            <div className="bg-gray-200 px-1 rounded-xs shadow-sm">
                              <span className="font-bold text-xs">{club.matches_played}</span>
                            </div>
                            <span className="text-sm">matchs joués</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })}
            <h2 className="text-white mt-3 text-xl font-extrabold px-3 py-1 text-center w-fit" style={{ backgroundColor: data.resume.color }}>FORMATION</h2>
            <ul className="">
              {data.training_entries.map((training, i) => {
                return (
                  <li key={i} className="list-disc list-inside text-sm">
                    <span className="font-bold">{training.start_year}</span> : {training.title}
                  </li>
                )
              })}
            </ul>
            <h2 className="text-white mt-3 text-xl font-extrabold px-3 py-1 text-center w-fit" style={{ backgroundColor: data.resume.color }}>INTÉRÊTS</h2>
            <ul className="">
              {data.club_interests.map((interest, i) => {
                return (
                  <li key={i} className="list-disc list-inside text-sm">
                    <span className="font-bold">{interest.year}</span> : {interest.club_name}
                  </li>
                )
              })}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
