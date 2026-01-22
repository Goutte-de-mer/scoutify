"use client";

import { useState, useRef } from "react";
import { Briefcase, Plus, Trash2, Upload, Star, Trophy, Crown, Medal } from "lucide-react";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { DistinctionBadge } from "./DistinctionBadge";
import type { CompleteResumeResponse } from "@/types/submission";

interface CareerSectionProps {
  data: CompleteResumeResponse;
  onChange: (data: CompleteResumeResponse) => void;
  mode?: "staff" | "player";
  darkMode?: boolean;
}

const MAX_SEASONS = 5;
const MAX_CLUBS_PER_SEASON = 2;
const tempId = () =>
  `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

type Season = CompleteResumeResponse["career_seasons"][number];
type Club = Season["clubs"][number];

export function CareerSection({ data, onChange, mode = "staff", darkMode = false }: CareerSectionProps) {
  const seasons = data.career_seasons ?? [];
  const isGardien = data.player_profile.wingspan_cm != null;
  const [uploading, setUploading] = useState<{
    seasonIdx: number;
    clubIdx: number;
  } | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const setSeasons = (next: Season[]) => {
    onChange({ ...data, career_seasons: next });
  };

  const updateSeason = (idx: number, updates: Partial<Season>) => {
    const next = [...seasons];
    next[idx] = { ...next[idx], ...updates };
    setSeasons(next);
  };

  const updateClub = (
    seasonIdx: number,
    clubIdx: number,
    updates: Partial<Club>,
  ) => {
    const next = [...seasons];
    const clubs = [...(next[seasonIdx].clubs ?? [])];
    clubs[clubIdx] = { ...clubs[clubIdx], ...updates };
    next[seasonIdx] = { ...next[seasonIdx], clubs };
    setSeasons(next);
  };

  const addSeason = () => {
    if (seasons.length >= MAX_SEASONS) return;
    setSeasons([
      ...seasons,
      {
        id: tempId(),
        start_year: 0,
        end_year: 0,
        display_order: seasons.length + 1,
        clubs: [],
      },
    ]);
  };

  const removeSeason = (idx: number) => {
    const next = seasons
      .filter((_, i) => i !== idx)
      .map((s, i) => ({ ...s, display_order: i + 1 }));
    setSeasons(next);
  };

  const addClub = (seasonIdx: number) => {
    const season = seasons[seasonIdx];
    const currentClubs = season.clubs ?? [];
    if (currentClubs.length >= MAX_CLUBS_PER_SEASON) return;

    const next = [...seasons];
    const clubs = [...currentClubs];
    const newClub: Club = {
      id: tempId(),
      division_id: "",
      division_name: "",
      club_name: "",
      category: "",
      matches_played: 0,
      is_captain: 0,
      is_promoted: 0,
      is_champion: 0,
      is_cup_winner: 0,
    };
    clubs.push(newClub);
    next[seasonIdx] = { ...next[seasonIdx], clubs };
    setSeasons(next);
  };

  const handleFileSelect = (seasonIdx: number, clubIdx: number) => {
    const key = `${seasonIdx}-${clubIdx}`;
    fileInputRefs.current[key]?.click();
  };

  const handleFileUpload = async (
    seasonIdx: number,
    clubIdx: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading({ seasonIdx, clubIdx });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/club-logo/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'upload");
      }

      const result = await response.json();
      updateClub(seasonIdx, clubIdx, {
        club_logo_url: result.logo_url,
      });
    } catch (error) {
      console.error("Erreur upload:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de l'upload");
    } finally {
      setUploading(null);
      // Réinitialiser l'input
      const key = `${seasonIdx}-${clubIdx}`;
      if (fileInputRefs.current[key]) {
        fileInputRefs.current[key]!.value = "";
      }
    }
  };

  const removeClub = (seasonIdx: number, clubIdx: number) => {
    const next = [...seasons];
    const clubs = (next[seasonIdx].clubs ?? []).filter((_, i) => i !== clubIdx);
    next[seasonIdx] = { ...next[seasonIdx], clubs };
    setSeasons(next);
  };

  const hasMultipleClubs = (s: Season) => (s.clubs?.length ?? 0) >= 2;

  const inputClass =
    darkMode
      ? "w-full h-9 rounded-lg border-2 border-gray-600 bg-zinc-800 px-3 py-1.5 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:border-transparent text-sm"
      : "w-full h-9 rounded-lg border-2 border-gray-300 bg-white px-3 py-1.5 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:border-transparent text-sm";

  return (
    <FormSection darkMode={darkMode}
      icon={Briefcase}
      title="Carrière & Statistiques"
      subtitle={
        seasons.length ? `(${seasons.length}/${MAX_SEASONS})` : undefined
      }
      action={
        seasons.length < MAX_SEASONS ? (
          <button
            type="button"
            onClick={addSeason}
            className={darkMode ? "inline-flex items-center gap-2 rounded-md border border-gray-600 bg-zinc-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-600" : "inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50"}
          >
            <Plus className="h-4 w-4" />
            Saison
          </button>
        ) : null
      }
    >
      {seasons.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <p className={darkMode ? "text-sm text-gray-400" : "text-sm text-gray-500"}>Aucune saison renseignée.</p>
          <button
            type="button"
            onClick={addSeason}
            className={darkMode ? "hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-md border-2 border-dashed border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 transition-colors" : "hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors"}
          >
            <Plus className="h-4 w-4" />
            Ajouter une saison
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {seasons.map((season, seasonIdx) => (
            <div
              key={season.id}
              className={darkMode ? "space-y-4 rounded-lg border border-gray-700 bg-zinc-800 p-4" : "space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4"}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-primary flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white">
                    {seasonIdx + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={season.start_year || ""}
                      onChange={(e) =>
                        updateSeason(seasonIdx, {
                          start_year: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      placeholder="Début"
                      className={`${inputClass} w-24`}
                      min={1990}
                      max={2100}
                    />
                    <span className="text-gray-500">/</span>
                    <input
                      type="number"
                      value={season.end_year || ""}
                      onChange={(e) =>
                        updateSeason(seasonIdx, {
                          end_year: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      placeholder="Fin"
                      className={`${inputClass} w-24`}
                      min={1990}
                      max={2100}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeSeason(seasonIdx)}
                  className={darkMode ? "shrink-0 rounded-lg p-2 text-red-400 transition-colors hover:bg-red-900/20" : "shrink-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"}
                  aria-label="Supprimer la saison"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 pl-4">
                <div className="flex items-center justify-between">
                  <span className={darkMode ? "text-sm font-medium text-white" : "text-sm font-medium text-gray-700"}>
                    Clubs
                    {(season.clubs ?? []).length > 0 && (
                      <span className={darkMode ? "ml-1 text-gray-400" : "ml-1 text-gray-500"}>
                        ({(season.clubs ?? []).length}/{MAX_CLUBS_PER_SEASON})
                      </span>
                    )}
                  </span>
                  {(season.clubs ?? []).length < MAX_CLUBS_PER_SEASON && (
                    <button
                      type="button"
                      onClick={() => addClub(seasonIdx)}
                      className={darkMode ? "inline-flex items-center gap-1 rounded-md border border-gray-600 bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-600" : "inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"}
                    >
                      <Plus className="h-3 w-3" />
                      Club
                    </button>
                  )}
                </div>

                {(season.clubs ?? []).length === 0 ? (
                  <p className={darkMode ? "text-sm text-gray-400" : "text-sm text-gray-500"}>
                    Aucun club. Cliquez sur « Club » pour en ajouter.
                  </p>
                ) : (
                  (season.clubs ?? []).map((club, clubIdx) => {
                    const uploadKey = `${seasonIdx}-${clubIdx}`;
                    const isUploading =
                      uploading?.seasonIdx === seasonIdx &&
                      uploading?.clubIdx === clubIdx;
                    return (
                      <div
                        key={club.id}
                        className={darkMode ? "space-y-3 rounded-lg border border-gray-700 bg-zinc-800 p-4" : "space-y-3 rounded-lg border border-gray-200 bg-white p-4"}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Logo + Nom du club côte à côte */}
                            <div className="flex items-start gap-3">
                              {mode === "staff" && (
                                <div className="group relative shrink-0">
                                  {club.club_logo_url ? (
                                    <img
                                      src={club.club_logo_url}
                                      alt=""
                                      className={darkMode ? "h-16 w-16 rounded border border-gray-600 object-cover" : "h-16 w-16 rounded border border-gray-200 object-cover"}
                                    />
                                  ) : (
                                    <div className={darkMode ? "flex h-16 w-16 items-center justify-center rounded border-2 border-dashed border-gray-600 text-xs text-gray-500" : "flex h-16 w-16 items-center justify-center rounded border-2 border-dashed border-gray-300 text-xs text-gray-400"}>
                                      Logo
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleFileSelect(seasonIdx, clubIdx)
                                    }
                                    disabled={isUploading}
                                    className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <Upload className="h-5 w-5 text-white" />
                                  </button>
                                  <input
                                    ref={(el) => {
                                      fileInputRefs.current[uploadKey] = el;
                                    }}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={(e) =>
                                      handleFileUpload(seasonIdx, clubIdx, e)
                                    }
                                    className="hidden"
                                    id={`club-logo-upload-${uploadKey}`}
                                  />
                                </div>
                              )}
                              {mode === "player" && club.club_logo_url && (
                                <img
                                  src={club.club_logo_url}
                                  alt=""
                                  className={darkMode ? "h-16 w-16 rounded border border-gray-600 object-cover" : "h-16 w-16 rounded border border-gray-200 object-cover"}
                                />
                              )}
                              <div className="flex-1">
                                <FormField
                                  label="Nom du club"
                                  value={club.club_name}
                                  placeholder="Nom du club"
                                  required
                                  onChange={(v) =>
                                    updateClub(seasonIdx, clubIdx, {
                                      club_name: v,
                                    })
                                  }
                                  darkMode={darkMode}
                                />
                              </div>
                            </div>
                            
                            {/* Reste des champs en dessous */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <FormField
                                label="Catégorie"
                                value={club.category}
                                placeholder="U19, Séniors..."
                                required
                                onChange={(v) =>
                                  updateClub(seasonIdx, clubIdx, {
                                    category: v,
                                  })
                                }
                                darkMode={darkMode}
                              />
                              <FormField
                                label="Division"
                                value={club.division_name}
                                placeholder="N2, D1..."
                                required
                                onChange={(v) =>
                                  updateClub(seasonIdx, clubIdx, {
                                    division_name: v,
                                  })
                                }
                                darkMode={darkMode}
                              />
                            </div>
                            
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                              <DistinctionBadge
                                label="Capitaine"
                                icon={Crown}
                                active={club.is_captain === 1}
                                onClick={() =>
                                  updateClub(seasonIdx, clubIdx, {
                                    is_captain: club.is_captain === 1 ? 0 : 1,
                                  })
                                }
                              />
                              <DistinctionBadge
                                label="Surclassé"
                                icon={Star}
                                active={club.is_promoted === 1}
                                onClick={() =>
                                  updateClub(seasonIdx, clubIdx, {
                                    is_promoted: club.is_promoted === 1 ? 0 : 1,
                                  })
                                }
                              />
                              <DistinctionBadge
                                label="Champion"
                                icon={Medal}
                                active={club.is_champion === 1}
                                onClick={() =>
                                  updateClub(seasonIdx, clubIdx, {
                                    is_champion: club.is_champion === 1 ? 0 : 1,
                                  })
                                }
                              />
                              <DistinctionBadge
                                label="Coupe"
                                icon={Trophy}
                                active={club.is_cup_winner === 1}
                                onClick={() =>
                                  updateClub(seasonIdx, clubIdx, {
                                    is_cup_winner: club.is_cup_winner === 1 ? 0 : 1,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeClub(seasonIdx, clubIdx)}
                            className={darkMode ? "shrink-0 rounded-lg p-2 text-red-400 transition-colors hover:bg-red-900/20" : "shrink-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"}
                            aria-label="Supprimer le club"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {hasMultipleClubs(season) && (
                          <div className={darkMode ? "grid grid-cols-2 gap-2 border-t border-gray-700 pt-2" : "grid grid-cols-2 gap-2 border-t border-gray-200 pt-2"}>
                            <FormField
                              label="Mois début"
                              type="number"
                              value={club.start_month ?? ""}
                              placeholder="1–12"
                              min={1}
                              max={12}
                              onChange={(v) =>
                                updateClub(seasonIdx, clubIdx, {
                                  start_month:
                                    v === "" ? null : parseInt(v, 10) || null,
                                })
                              }
                              darkMode={darkMode}
                            />
                            <FormField
                              label="Mois fin"
                              type="number"
                              value={club.end_month ?? ""}
                              placeholder="1–12"
                              min={1}
                              max={12}
                              onChange={(v) =>
                                updateClub(seasonIdx, clubIdx, {
                                  end_month:
                                    v === "" ? null : parseInt(v, 10) || null,
                                })
                              }
                              darkMode={darkMode}
                            />
                          </div>
                        )}

                        <div className={darkMode ? "grid grid-cols-2 gap-2 border-t border-gray-700 pt-2 sm:grid-cols-3" : "grid grid-cols-2 gap-2 border-t border-gray-200 pt-2 sm:grid-cols-3"}>
                          <FormField
                            label="Matchs"
                            type="number"
                            value={club.matches_played ?? ""}
                            min={0}
                            onChange={(v) =>
                              updateClub(seasonIdx, clubIdx, {
                                matches_played: parseInt(v, 10) || 0,
                              })
                            }
                            darkMode={darkMode}
                          />
                          {isGardien ? (
                            <FormField
                              label="Clean sheets"
                              type="number"
                              value={club.clean_sheets ?? ""}
                              min={0}
                              onChange={(v) =>
                                updateClub(seasonIdx, clubIdx, {
                                  clean_sheets:
                                    v === "" ? null : parseInt(v, 10) || null,
                                })
                              }
                              darkMode={darkMode}
                            />
                          ) : (
                            <>
                              <FormField
                                label="Buts"
                                type="number"
                                value={club.goals ?? ""}
                                min={0}
                                onChange={(v) =>
                                  updateClub(seasonIdx, clubIdx, {
                                    goals:
                                      v === "" ? null : (isNaN(parseInt(v, 10)) ? null : parseInt(v, 10)),
                                  })
                                }
                                darkMode={darkMode}
                              />
                              <FormField
                                label="Passes décisives"
                                type="number"
                                value={club.assists ?? ""}
                                min={0}
                                onChange={(v) =>
                                  updateClub(seasonIdx, clubIdx, {
                                    assists:
                                      v === "" ? null : (isNaN(parseInt(v, 10)) ? null : parseInt(v, 10)),
                                  })
                                }
                                darkMode={darkMode}
                              />
                              <FormField
                                label="Temps de jeu moyen (min/match)"
                                type="number"
                                value={club.avg_playtime_minutes ?? ""}
                                min={0}
                                max={90}
                                onChange={(v) =>
                                  updateClub(seasonIdx, clubIdx, {
                                    avg_playtime_minutes:
                                      v === "" ? null : parseFloat(v) || null,
                                  })
                                }
                                darkMode={darkMode}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}

          {seasons.length < MAX_SEASONS && (
            <button
              type="button"
              onClick={addSeason}
              className={darkMode ? "hover:border-primary hover:text-primary inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 transition-colors" : "hover:border-primary hover:text-primary inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition-colors"}
            >
              <Plus className="h-4 w-4" />
              Ajouter une saison
            </button>
          )}
        </div>
      )}
    </FormSection>
  );
}
