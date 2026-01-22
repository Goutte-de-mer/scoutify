"use client";

import { useState } from "react";
import HeaderUser from "@/components/HeaderUser";
import { ResumeForm } from "@/components/ResumeForm/ResumeForm";
import { createEmptyResume } from "@/lib/utils/create-empty-resume";
import { convertResumeToSubmission } from "@/lib/utils/resume-to-submission";
import { submitResume } from "@/lib/api/submit-resume";
import { validateRequiredFields } from "@/components/ResumeForm/ResumeForm";
import type { CompleteResumeResponse } from "@/types/submission";

export default function Home() {
  const [resume, setResume] = useState<CompleteResumeResponse>(() =>
    createEmptyResume(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const isValid = validateRequiredFields(resume);

  const handleSave = async () => {
    if (!validateRequiredFields(resume)) {
      setError(
        "Veuillez remplir tous les champs obligatoires (marqués d'un *) avant de soumettre.",
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const submissionData = convertResumeToSubmission(resume);
      await submitResume(submissionData);

      setSuccess(true);
      // Réinitialiser le formulaire après succès
      setTimeout(() => {
        setResume(createEmptyResume());
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la soumission",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <HeaderUser onSend={handleSave} disabled={!isValid || saving} />
      {(error || success) && (
        <div className="fixed top-20 right-4 z-50 max-w-md">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-lg">
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 shadow-lg">
              <p className="font-medium">Succès</p>
              <p className="text-sm">Votre CV a été soumis avec succès !</p>
            </div>
          )}
        </div>
      )}
      <ResumeForm
        data={resume}
        onChange={setResume}
        onSave={handleSave}
        saveDisabled={saving}
        saving={saving}
        mode="player"
        darkMode={true}
      />
    </div>
  );
}
