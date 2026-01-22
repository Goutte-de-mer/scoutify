"use client";

import { useState, useRef } from "react";
import { User, Upload, Check } from "lucide-react";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { Badge } from "./Badge";
import type { CompleteResumeResponse } from "@/types/submission";

interface ProfilSectionProps {
  data: CompleteResumeResponse;
  onChange: (data: CompleteResumeResponse) => void;
  mode?: "staff" | "player";
  darkMode?: boolean;
}

const CV_COLORS = [
  "#1E5EFF",
  "#C46A4A",
  "#5B6B3A",
  "#0F2A43",
  "#D6C6A8",
  "#7A1E3A",
] as const;

const norm = (c: string) => c.toUpperCase().replace(/\s/g, "");

export function ProfilSection({ data, onChange, mode = "staff", darkMode = false }: ProfilSectionProps) {
  const p = data.player_profile;
  const color = data.resume.color;
  const selectedColor = color
    ? CV_COLORS.find((c) => norm(c) === norm(color)) ?? null
    : null;
  const [newNat, setNewNat] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isGardien = p.wingspan_cm != null;

  const updateProfile = (updates: Partial<typeof p>) => {
    onChange({
      ...data,
      player_profile: { ...p, ...updates },
    });
  };

  const updateResume = (updates: Partial<typeof data.resume>) => {
    onChange({
      ...data,
      resume: { ...data.resume, ...updates },
    });
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/player-photo/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'upload");
      }

      const result = await response.json();
      updateProfile({
        photo_path: result.photo_url,
      });
    } catch (error) {
      console.error("Erreur upload:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <FormSection icon={User} title="Profil" darkMode={darkMode}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className={darkMode ? "mb-2 block text-sm font-medium text-white" : "mb-2 block text-sm font-medium text-gray-700"}>
            Photo <span className="text-red-500">*</span>
          </label>
          <div className="flex items-start gap-4">
            {p.photo_path ? (
              <img
                src={p.photo_path}
                alt="Photo joueur"
                className="border-primary h-28 w-28 rounded-lg border-2 object-cover"
              />
            ) : (
              <div className={`flex h-28 w-28 items-center justify-center rounded-lg text-sm ${
                darkMode ? "bg-zinc-800 text-gray-400" : "bg-gray-200 text-gray-500"
              }`}>
                Aucune photo
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
                id="player-photo-upload"
              />
              <button
                type="button"
                onClick={handleFileSelect}
                disabled={uploading}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploading
                  ? "Upload..."
                  : p.photo_path
                    ? "Remplacer"
                    : "Ajouter une photo"}
              </button>
              {p.photo_path && (
                <button
                  type="button"
                  onClick={() => updateProfile({ photo_path: "" })}
                  className="inline-flex w-fit items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          <label className={darkMode ? "mb-2 block text-sm font-semibold text-white" : "mb-2 block text-sm font-semibold text-black"}>
            Couleur CV <span className={darkMode ? "text-red-400" : "text-red-500"}>*</span>
          </label>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
            {CV_COLORS.map((c) => {
              const isSelected = selectedColor === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateResume({ color: c })}
                  className={`relative h-12 w-full rounded-lg transition-all hover:scale-105 ${
                    isSelected
                      ? darkMode
                        ? "scale-105 ring-2 ring-white"
                        : "scale-105 ring-2 ring-gray-800"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-6 w-6 text-white drop-shadow-lg" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="Nom"
          value={p.last_name}
          placeholder="Dupont"
          required
          onChange={(v) => updateProfile({ last_name: v })}
          darkMode={darkMode}
        />
        <FormField
          label="Prénom"
          value={p.first_name}
          placeholder="Jean"
          required
          onChange={(v) => updateProfile({ first_name: v })}
          darkMode={darkMode}
        />
      </div>

      <div>
        <label className={darkMode ? "mb-2 block text-sm font-semibold text-white" : "mb-2 block text-sm font-semibold text-black"}>
          Nationalité(s) <span className={darkMode ? "text-red-400" : "text-red-500"}>*</span>
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          {(p.nationalities ?? []).map((nat, i) => (
            <Badge
              key={i}
              label={nat}
              onRemove={() => {
                const next = (p.nationalities ?? []).filter((_, j) => j !== i);
                updateProfile({ nationalities: next });
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newNat}
            onChange={(e) => setNewNat(e.target.value)}
            placeholder="Ajouter une nationalité"
            className={darkMode 
              ? "input-base-dark h-11 w-full"
              : "input-base h-11 w-full"
            }
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              const v = newNat.trim();
              if (!v) return;
              updateProfile({ nationalities: [...(p.nationalities ?? []), v] });
              setNewNat("");
            }}
          />
          <button
            type="button"
            onClick={() => {
              const v = newNat.trim();
              if (!v) return;
              updateProfile({ nationalities: [...(p.nationalities ?? []), v] });
              setNewNat("");
            }}
            className="bg-primary hover:bg-primary/90 h-11 shrink-0 rounded-lg px-4 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!newNat.trim()}
          >
            Ajouter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="Date de naissance"
          type="date"
          value={p.birth_date}
          id="birth-date"
          required
          onChange={(v) => updateProfile({ birth_date: v })}
          darkMode={darkMode}
        />
        <div>
          <label className={darkMode ? "mb-2 block text-sm font-semibold text-white" : "mb-2 block text-sm font-semibold text-black"}>
            Pied fort <span className={darkMode ? "text-red-400" : "text-red-500"}>*</span>
          </label>
          <select
            value={p.strong_foot ?? ""}
            onChange={(e) => updateProfile({ strong_foot: e.target.value })}
            className={darkMode 
              ? "input-base-dark h-11 w-full"
              : "input-base h-11 w-full"
            }
            required
          >
            <option value="">Choisir…</option>
            <option value="Droit">Droit</option>
            <option value="Gauche">Gauche</option>
            <option value="Ambidextre">Ambidextre</option>
          </select>
        </div>
      </div>

      <div className={darkMode ? "flex items-center gap-3 rounded-lg border-2 border-gray-700 bg-zinc-800 p-4" : "flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-4"}>
        <input
          type="checkbox"
          id="gardien-cb"
          checked={isGardien}
          onChange={(e) => {
            if (e.target.checked) {
              updateProfile({ wingspan_cm: p.wingspan_cm ?? 0 });
            } else {
              updateProfile({ wingspan_cm: null });
              // Retirer cleanSheets de tous les clubs dans toutes les saisons
              const updatedSeasons = data.career_seasons.map((season) => ({
                ...season,
                clubs: season.clubs.map((club) => ({
                  ...club,
                  clean_sheets: null,
                })),
              }));
              onChange({
                ...data,
                player_profile: { ...p, wingspan_cm: null },
                career_seasons: updatedSeasons,
              });
            }
          }}
          className={darkMode ? "h-4 w-4 cursor-pointer rounded border-2 border-gray-600" : "h-4 w-4 cursor-pointer rounded border-2 border-gray-300"}
        />
        <label
          htmlFor="gardien-cb"
          className={darkMode ? "cursor-pointer text-sm font-semibold text-white" : "cursor-pointer text-sm font-semibold text-black"}
        >
          Gardien de but
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="Taille (cm)"
          type="number"
          value={p.height_cm}
          placeholder="180"
          min={100}
          max={250}
          required
          onChange={(v) =>
            updateProfile({ height_cm: v === "" ? 0 : parseInt(v, 10) || 0 })
          }
          darkMode={darkMode}
        />
        <FormField
          label="Poids (kg)"
          type="number"
          value={p.weight_kg}
          placeholder="75"
          min={30}
          max={200}
          onChange={(v) =>
            updateProfile({ weight_kg: v === "" ? 0 : parseInt(v, 10) || 0 })
          }
          darkMode={darkMode}
        />
        {isGardien && (
          <FormField
            label="Envergure (cm)"
            type="number"
            value={p.wingspan_cm ?? ""}
            placeholder="180"
            min={100}
            max={250}
            onChange={(v) =>
              updateProfile({
                wingspan_cm: v === "" ? null : parseInt(v, 10) || null,
              })
            }
            darkMode={darkMode}
          />
        )}
      </div>

      <FormField
        label="VMA"
        type="number"
        value={p.vma ?? ""}
        placeholder="18.5"
        min={10}
        max={30}
        step={0.1}
        onChange={(v) =>
          updateProfile({
            vma: v === "" ? null : parseFloat(v) || null,
          })
        }
        darkMode={darkMode}
      />
    </FormSection>
  );
}
