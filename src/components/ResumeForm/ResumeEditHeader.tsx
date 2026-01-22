"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface ResumeEditHeaderProps {
  firstName: string;
  lastName: string;
  isTreated: boolean;
  onTreatedChange?: (checked: boolean) => void;
  onSave?: () => void;
  saveDisabled?: boolean;
  saving?: boolean;
}

export function ResumeEditHeader({
  firstName,
  lastName,
  isTreated,
  onTreatedChange,
  onSave,
  saveDisabled = false,
  saving = false,
}: ResumeEditHeaderProps) {
  const fullName = `${firstName} ${lastName}`.trim() || "Sans nom";

  return (
    <header className="sticky top-0 z-50 border-b-2 border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-6xl px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/staff"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-black shadow-sm transition-colors hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-black">{fullName}</h1>
              <p className="text-sm text-gray-600">Édition du CV</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
              <span
                className={`text-sm font-semibold ${
                  isTreated ? "text-green-600" : "text-red-600"
                }`}
              >
                {isTreated ? "Traité" : "Non traité"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isTreated}
                onClick={() => onTreatedChange?.(!isTreated)}
                className={`relative inline-block h-5 w-9 cursor-pointer rounded-full transition-colors duration-400 ease-in-out select-none focus:outline-none ${
                  isTreated ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-400 ease-in-out ${
                    isTreated ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <button
              type="button"
              onClick={onSave}
              disabled={saveDisabled || saving}
              className="bg-primary hover:bg-primary/90 disabled:hover:bg-primary inline-flex h-10 items-center justify-center gap-2 rounded-md px-8 font-semibold text-white shadow transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className={`h-5 w-5 ${saving ? "animate-spin" : ""}`} />
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
