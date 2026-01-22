"use client";

import { useState, useRef } from "react";
import { Eye, Plus, Trash2, Upload } from "lucide-react";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import type { CompleteResumeResponse } from "@/types/submission";

interface InterestsSectionProps {
  data: CompleteResumeResponse;
  onChange: (data: CompleteResumeResponse) => void;
  mode?: "staff" | "player";
  darkMode?: boolean;
}

const MAX_INTERESTS = 5;
const tempId = () =>
  `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

type ClubInterest = CompleteResumeResponse["club_interests"][number];

export function InterestsSection({ data, onChange, mode = "staff", darkMode = false }: InterestsSectionProps) {
  const interests = data.club_interests ?? [];
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const setInterests = (next: ClubInterest[]) => {
    onChange({ ...data, club_interests: next });
  };

  const updateInterest = (idx: number, updates: Partial<ClubInterest>) => {
    const next = [...interests];
    next[idx] = { ...next[idx], ...updates };
    setInterests(next);
  };

  const addInterest = () => {
    if (interests.length >= MAX_INTERESTS) return;
    setInterests([
      ...interests,
      {
        id: tempId(),
        club_name: "",
        club_logo_url: null,
        year: "",
        display_order: interests.length + 1,
      },
    ]);
  };

  const removeInterest = (idx: number) => {
    const next = interests
      .filter((_, i) => i !== idx)
      .map((e, i) => ({ ...e, display_order: i + 1 }));
    setInterests(next);
  };

  const handleFileSelect = (idx: number) => {
    fileInputRefs.current[idx]?.click();
  };

  const handleFileUpload = async (
    idx: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(idx);

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
      updateInterest(idx, {
        club_logo_url: result.logo_url,
      });
    } catch (error) {
      console.error("Erreur upload:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de l'upload");
    } finally {
      setUploading(null);
      if (fileInputRefs.current[idx]) {
        fileInputRefs.current[idx]!.value = "";
      }
    }
  };

  return (
    <FormSection darkMode={darkMode}
      icon={Eye}
      title="Marques d'intérêt / Essais"
      subtitle={
        interests.length ? `(${interests.length}/${MAX_INTERESTS})` : undefined
      }
      action={
        interests.length < MAX_INTERESTS ? (
          <button
            type="button"
            onClick={addInterest}
            className={darkMode ? "inline-flex items-center gap-2 rounded-md border border-gray-600 bg-zinc-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-600" : "inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50"}
          >
            <Plus className="h-4 w-4" />
            Intérêt
          </button>
        ) : null
      }
    >
      {interests.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <p className={darkMode ? "text-sm text-gray-400" : "text-sm text-gray-500"}>
            Aucun essai ou intérêt renseigné.
          </p>
          <button
            type="button"
            onClick={addInterest}
            className={darkMode ? "hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-md border-2 border-dashed border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 transition-colors" : "hover:border-primary hover:text-primary inline-flex items-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors"}
          >
            <Plus className="h-4 w-4" />
            Ajouter un intérêt
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {interests.map((item, idx) => {
            const isUploading = uploading === idx;
            return (
              <div
                key={item.id}
                className={darkMode ? "space-y-3 rounded-lg border border-gray-700 bg-zinc-800 p-4" : "space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start sm:items-center flex-1 gap-3">
                    {mode === "staff" && (
                      <div className="group relative shrink-0">
                        {item.club_logo_url ? (
                          <img
                            src={item.club_logo_url}
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
                          onClick={() => handleFileSelect(idx)}
                          disabled={isUploading}
                          className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Upload className="h-4 w-4 text-white" />
                        </button>
                        <input
                          ref={(el) => {
                            fileInputRefs.current[idx] = el;
                          }}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={(e) => handleFileUpload(idx, e)}
                          className="hidden"
                          id={`interest-logo-upload-${idx}`}
                        />
                      </div>
                    )}
                    {mode === "player" && item.club_logo_url && (
                      <img
                        src={item.club_logo_url}
                        alt=""
                        className={darkMode ? "h-16 w-16 rounded border border-gray-600 object-cover" : "h-16 w-16 rounded border border-gray-200 object-cover"}
                      />
                    )}
                    <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                      <FormField
                        label="Club"
                        value={item.club_name}
                        placeholder="Nom du club"
                        onChange={(v) => updateInterest(idx, { club_name: v })}
                        darkMode={darkMode}
                      />
                      <FormField
                        label="Année"
                        value={item.year}
                        placeholder="2024"
                        onChange={(v) => updateInterest(idx, { year: v })}
                        darkMode={darkMode}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeInterest(idx)}
                    className="shrink-0 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                    aria-label="Supprimer l'intérêt"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {interests.length < MAX_INTERESTS && (
            <button
              type="button"
              onClick={addInterest}
              className={darkMode ? "hover:border-primary hover:text-primary inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-600 px-4 py-3 text-sm font-medium text-gray-300 transition-colors" : "hover:border-primary hover:text-primary inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition-colors"}
            >
              <Plus className="h-4 w-4" />
              Ajouter un intérêt
            </button>
          )}
        </div>
      )}
    </FormSection>
  );
}
