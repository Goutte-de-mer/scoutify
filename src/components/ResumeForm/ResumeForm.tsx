"use client";

import { useMemo } from "react";
import { Save } from "lucide-react";
import type { CompleteResumeResponse } from "@/types/submission";
import { ResumeEditHeader } from "./ResumeEditHeader";
import { ProfilSection } from "./ProfilSection";
import { PosteSection } from "./PosteSection";
import { QualitiesSection } from "./QualitiesSection";
import { ContactSection } from "./ContactSection";
import { CareerSection } from "./CareerSection";
import { TrainingSection } from "./TrainingSection";
import { InterestsSection } from "./InterestsSection";
import { LinksSection } from "./LinksSection";

interface ResumeFormProps {
  data: CompleteResumeResponse;
  onChange: (data: CompleteResumeResponse) => void;
  onTreatedChange?: (checked: boolean) => void;
  onSave?: () => void;
  saveDisabled?: boolean;
  saving?: boolean;
  mode?: "staff" | "player"; // Mode staff (avec uploads) ou player (sans uploads)
  darkMode?: boolean; // Thème dark
}

/**
 * Valide que tous les champs obligatoires sont remplis
 */
export function validateRequiredFields(data: CompleteResumeResponse): boolean {
  const p = data.player_profile;
  const c = data.contacts;
  const r = data.resume;

  // Nom
  if (!p.last_name || p.last_name.trim() === "") return false;
  
  // Prénom
  if (!p.first_name || p.first_name.trim() === "") return false;
  
  // Nationalité(s)
  if (!p.nationalities || p.nationalities.length === 0) return false;
  
  // Date de naissance
  if (!p.birth_date || p.birth_date.trim() === "") return false;
  
  // Pied fort
  if (!p.strong_foot || p.strong_foot.trim() === "") return false;
  
  // Taille
  if (!p.height_cm || p.height_cm === 0) return false;
  
  // Couleur du CV
  if (!r.color || r.color.trim() === "") return false;
  
  // Poste principal
  if (!p.main_position || p.main_position.trim() === "") return false;
  
  // Photo du joueur
  if (!p.photo_path || p.photo_path.trim() === "") return false;
  
  // Email du joueur
  if (!c.player_email || c.player_email.trim() === "") return false;

  return true;
}

export function ResumeForm({
  data,
  onChange,
  onTreatedChange,
  onSave,
  saveDisabled = false,
  saving = false,
  mode = "staff",
  darkMode = false,
}: ResumeFormProps) {
  const treated = data.resume.is_treated === 1;
  const { first_name, last_name } = data.player_profile;
  
  const isValid = useMemo(() => validateRequiredFields(data), [data]);
  const isFormDisabled = saveDisabled || !isValid || saving;
  const isPlayerMode = mode === "player";
  const showHeader = !isPlayerMode;

  const bgClass = darkMode ? "bg-black" : "bg-white";
  const containerBgClass = darkMode ? "bg-zinc-900" : "bg-gray-50";
  const textClass = darkMode ? "text-white" : "text-black";
  const errorTextClass = darkMode ? "text-red-400" : "text-red-600";

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {showHeader && (
        <ResumeEditHeader
          firstName={first_name}
          lastName={last_name}
          isTreated={treated}
          onTreatedChange={onTreatedChange}
          onSave={onSave}
          saveDisabled={isFormDisabled}
          saving={saving}
        />
      )}

      <div className={`mx-auto max-w-6xl space-y-8 ${containerBgClass} px-6 py-8`}>
        <ProfilSection data={data} onChange={onChange} mode={mode} darkMode={darkMode} />
        <PosteSection data={data} onChange={onChange} darkMode={darkMode} />
        <QualitiesSection data={data} onChange={onChange} darkMode={darkMode} />
        <ContactSection data={data} onChange={onChange} darkMode={darkMode} />
        <CareerSection data={data} onChange={onChange} mode={mode} darkMode={darkMode} />
        <TrainingSection data={data} onChange={onChange} darkMode={darkMode} />
        <InterestsSection data={data} onChange={onChange} mode={mode} darkMode={darkMode} />
        <LinksSection data={data} onChange={onChange} darkMode={darkMode} />

        <div className="flex flex-col items-center gap-3 pt-6 pb-12">
          {!isValid && (
            <p className={`text-sm font-medium ${errorTextClass}`}>
              Veuillez remplir tous les champs obligatoires (marqués d'un *) avant de sauvegarder.
            </p>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={isFormDisabled}
            className="bg-primary hover:bg-primary/90 disabled:hover:bg-primary inline-flex h-12 items-center justify-center gap-2 rounded-md px-12 py-6 text-lg font-bold text-white shadow transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-6 w-6" />
            {isPlayerMode ? "Envoyer le CV" : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
