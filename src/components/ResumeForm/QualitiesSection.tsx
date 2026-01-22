"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { FormSection } from "./FormSection";
import { Badge } from "./Badge";
import type { CompleteResumeResponse } from "@/types/submission";

interface QualitiesSectionProps {
  data: CompleteResumeResponse;
  onChange: (data: CompleteResumeResponse) => void;
  darkMode?: boolean;
}

const MAX_QUALITIES = 6;

export function QualitiesSection({ data, onChange, darkMode = false }: QualitiesSectionProps) {
  const qualities = data.qualities ?? [];
  const [newQuality, setNewQuality] = useState("");

  const add = () => {
    const v = newQuality.trim();
    if (!v || qualities.length >= MAX_QUALITIES) return;
    onChange({ ...data, qualities: [...qualities, v] });
    setNewQuality("");
  };

  const remove = (index: number) => {
    onChange({
      ...data,
      qualities: qualities.filter((_, i) => i !== index),
    });
  };

  return (
    <FormSection
      icon={Trophy}
      title="Qualités sportives"
      subtitle={`(${qualities.length}/${MAX_QUALITIES})`}
      darkMode={darkMode}
    >
      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          {qualities.map((q, i) => (
            <Badge key={i} label={q} onRemove={() => remove(i)} />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newQuality}
            onChange={(e) => setNewQuality(e.target.value)}
            placeholder="Ajouter une qualité..."
            maxLength={24}
            className={darkMode 
              ? "input-base-dark h-11 w-full"
              : "input-base h-11 w-full"
            }
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              add();
            }}
          />
          <button
            type="button"
            onClick={add}
            disabled={!newQuality.trim() || qualities.length >= MAX_QUALITIES}
            className="bg-primary hover:bg-primary/90 h-11 shrink-0 rounded-lg px-4 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
      </div>
    </FormSection>
  );
}
