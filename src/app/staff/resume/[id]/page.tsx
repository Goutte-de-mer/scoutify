"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  fetchResumeById,
  updateResume,
  type CompleteResumeResponse,
} from "@/lib/api/resumes";
import { convertResumeToUpdateInput } from "@/lib/utils/resume-converter";
import { ResumeForm, validateRequiredFields } from "@/components/ResumeForm/ResumeForm";

export default function ResumePage() {
  const params = useParams();
  const id = params.id as string;

  const [resume, setResume] = useState<CompleteResumeResponse | null>(null);
  const [initialResume, setInitialResume] =
    useState<CompleteResumeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await fetchResumeById(id);
        setResume(data);
        setInitialResume(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement du CV",
        );
        setResume(null);
        setInitialResume(null);
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [id]);

  const handleTreatedChange = (checked: boolean) => {
    if (!resume) return;
    setResume({
      ...resume,
      resume: { ...resume.resume, is_treated: checked ? 1 : 0 },
    });
  };

  const handleSave = async () => {
    if (!resume || !id) return;

    // Validation des champs obligatoires avant la soumission
    if (!validateRequiredFields(resume)) {
      setError("Veuillez remplir tous les champs obligatoires (marqués d'un *) avant de sauvegarder.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);

      const updateData = convertResumeToUpdateInput(resume);
      const updatedResume = await updateResume(id, updateData);

      setResume(updatedResume);
      setInitialResume(updatedResume);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Chargement du CV…</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-600">{error ?? "CV introuvable"}</p>
      </div>
    );
  }

  const isDirty =
    initialResume != null &&
    JSON.stringify(initialResume) !== JSON.stringify(resume);
  const isValid = resume ? validateRequiredFields(resume) : false;

  return (
    <>
      {(error || saveSuccess) && (
        <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-lg">
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {saveSuccess && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 shadow-lg">
              <p className="font-medium">Succès</p>
              <p className="text-sm">Modifications enregistrées.</p>
            </div>
          )}
        </div>
      )}
      <ResumeForm
        data={resume}
        onChange={setResume}
        onTreatedChange={handleTreatedChange}
        onSave={handleSave}
        saveDisabled={!isDirty || !isValid || saving}
        saving={saving}
      />
    </>
  );
}
