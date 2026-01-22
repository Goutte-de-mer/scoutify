"use client";

import { useState, useRef } from "react";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import type { CompleteResumeResponse } from "@/types/submission";

interface TrainingSectionProps {
  data: CompleteResumeResponse;
  onChange: (data: CompleteResumeResponse) => void;
  darkMode?: boolean;
}

const MAX_ENTRIES = 5;
const tempId = () =>
  `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

type TrainingEntry = CompleteResumeResponse["training_entries"][number];

export function TrainingSection({ data, onChange, darkMode = false }: TrainingSectionProps) {
  const entries = data.training_entries ?? [];

  const setEntries = (next: TrainingEntry[]) => {
    onChange({ ...data, training_entries: next });
  };

  const updateEntry = (idx: number, updates: Partial<TrainingEntry>) => {
    const next = [...entries];
    next[idx] = { ...next[idx], ...updates };
    setEntries(next);
  };

  const addEntry = () => {
    if (entries.length >= MAX_ENTRIES) return;
    setEntries([
      ...entries,
      {
        id: tempId(),
        start_year: 0,
        end_year: null,
        location: "",
        title: "",
        details: null,
        display_order: entries.length + 1,
      },
    ]);
  };

  const removeEntry = (idx: number) => {
    const next = entries
      .filter((_, i) => i !== idx)
      .map((e, i) => ({ ...e, display_order: i + 1 }));
    setEntries(next);
  };

  return (
    <FormSection darkMode={darkMode}
      icon={GraduationCap}
      title="Formations"
      subtitle={
        entries.length ? `(${entries.length}/${MAX_ENTRIES})` : undefined
      }
      action={
        entries.length < MAX_ENTRIES ? (
          <button
            type="button"
            onClick={addEntry}
            className={darkMode ? "inline-flex items-center gap-2 rounded-md border border-gray-600 bg-zinc-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-600" : "inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50"}
          >
            <Plus className="h-4 w-4" />
            Formation
          </button>
        ) : null
      }
    >
      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <p className={darkMode ? "text-sm text-gray-400" : "text-sm text-gray-500"}>Aucune formation renseignée.</p>
          <button
            type="button"
            onClick={addEntry}
            className={darkMode ? "hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-md border-2 border-dashed border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 transition-colors" : "hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors"}
          >
            <Plus className="h-4 w-4" />
            Ajouter une formation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <div
              key={entry.id}
              className={darkMode ? "space-y-3 rounded-lg border border-gray-700 bg-zinc-800 p-4" : "space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center gap-2">
                      <FormField
                        label="Année début"
                        type="number"
                        value={entry.start_year === 0 ? "" : entry.start_year ?? ""}
                        min={1990}
                        max={2100}
                        required
                        onChange={(v) =>
                          updateEntry(idx, {
                            start_year: v === "" ? 0 : parseInt(v, 10) || 0,
                          })
                        }
                        darkMode={darkMode}
                      />
                      <span className={darkMode ? "mt-6 text-gray-400" : "mt-6 text-gray-500"}>-</span>
                      <FormField
                        label="Année fin"
                        type="number"
                        value={entry.end_year ?? ""}
                        min={1990}
                        max={2100}
                        required
                        onChange={(v) =>
                          updateEntry(idx, {
                            end_year: v === "" ? null : parseInt(v, 10) || null,
                          })
                        }
                        darkMode={darkMode}
                      />
                    </div>
                  </div>
                  <FormField
                    label="Titre"
                    value={entry.title}
                    placeholder="Titre de la formation"
                    required
                    onChange={(v) => updateEntry(idx, { title: v })}
                    darkMode={darkMode}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(idx)}
                  className={darkMode ? "shrink-0 rounded-lg p-2 text-red-400 transition-colors hover:bg-red-900/20" : "shrink-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"}
                  aria-label="Supprimer la formation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <FormField
                label="Lieu"
                value={entry.location}
                placeholder="Lieu de la formation"
                required
                onChange={(v) => updateEntry(idx, { location: v })}
                darkMode={darkMode}
              />
              <FormField
                label="Détails"
                value={entry.details ?? ""}
                placeholder="Détails supplémentaires (optionnel)"
                onChange={(v) => updateEntry(idx, { details: v || null })}
                darkMode={darkMode}
              />
            </div>
          ))}

          {entries.length < MAX_ENTRIES && (
            <button
              type="button"
              onClick={addEntry}
              className={darkMode ? "hover:border-primary hover:text-primary inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 transition-colors" : "hover:border-primary hover:text-primary inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition-colors"}
            >
              <Plus className="h-4 w-4" />
              Ajouter une formation
            </button>
          )}
        </div>
      )}
    </FormSection>
  );
}
