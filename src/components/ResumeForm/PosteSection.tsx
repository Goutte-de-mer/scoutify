"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { Badge } from "./Badge";
import type { CompleteResumeResponse } from "@/types/submission";

interface PosteSectionProps {
  data: CompleteResumeResponse;
  onChange: (data: CompleteResumeResponse) => void;
  darkMode?: boolean;
}

const FORMATIONS = ["4-3-3", "3-5-2"] as const;

// Liste des postes disponibles (affichage avec espace, valeur DB sans espace)
const AVAILABLE_POSITIONS = [
  { label: "GB", value: "GB" },
  { label: "DG", value: "DG" },
  { label: "DC", value: "DC" },
  { label: "DD", value: "DD" },
  { label: "MDC", value: "MDC" },
  { label: "MC", value: "MC" },
  { label: "MOC", value: "MOC" },
  { label: "AG", value: "AG" },
  { label: "AD", value: "AD" },
  { label: "BU", value: "BU" },
  { label: "Piston G", value: "PistonG" },
  { label: "Piston D", value: "PistonD" },
] as const;

export function PosteSection({ data, onChange, darkMode = false }: PosteSectionProps) {
  const system = data.resume.formation_system || "4-3-3";
  const mainPosition = data.player_profile.main_position;
  const positions = data.player_profile.positions ?? [];
  const [selectedPosition, setSelectedPosition] = useState("");

  // Fonction pour obtenir le label d'un poste à partir de sa valeur
  const getPositionLabel = (value: string) => {
    const pos = AVAILABLE_POSITIONS.find((p) => p.value === value);
    return pos ? pos.label : value;
  };

  // Fonction pour ajouter un poste
  const addPosition = (value: string) => {
    if (!value || positions.includes(value)) return;
    updateProfile({
      positions: [...positions, value],
    });
    setSelectedPosition("");
  };

  const updateResume = (updates: Partial<typeof data.resume>) => {
    onChange({ ...data, resume: { ...data.resume, ...updates } });
  };

  const updateProfile = (updates: Partial<typeof data.player_profile>) => {
    onChange({
      ...data,
      player_profile: { ...data.player_profile, ...updates },
    });
  };

  return (
    <FormSection icon={MapPin} title="Poste & Terrain" darkMode={darkMode}>
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          {FORMATIONS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => updateResume({ formation_system: f })}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-all ${
                system === f
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <FormField
          label="Position principale"
          value={mainPosition}
          placeholder="GB, MDC..."
          required
          onChange={(v) => updateProfile({ main_position: v })}
          darkMode={darkMode}
        />
        <div>
          <label className={darkMode ? "mb-2 block text-sm font-semibold text-white" : "mb-2 block text-sm font-semibold text-black"}>
            Autres postes
          </label>
          <div className="mb-2 flex flex-wrap gap-2">
            {positions.map((pos, i) => (
              <Badge
                key={i}
                label={getPositionLabel(pos)}
                onRemove={() => {
                  const next = positions.filter((_, j) => j !== i);
                  updateProfile({
                    positions: next,
                  });
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPosition}
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  addPosition(value);
                }
              }}
              className={darkMode ? "input-base-dark flex-1" : "input-base flex-1"}
            >
              <option value="">Sélectionner un poste</option>
              {AVAILABLE_POSITIONS.filter(
                (pos) => !positions.includes(pos.value),
              ).map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
