import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { Link2 } from "lucide-react";
import type { CompleteResumeResponse } from "@/types/submission";

interface LinksSectionProps {
  data: CompleteResumeResponse;
  onChange: (data: CompleteResumeResponse) => void;
  darkMode?: boolean;
}

export function LinksSection({ data, onChange, darkMode = false }: LinksSectionProps) {
  const p = data.player_profile;

  const updateProfile = (updates: Partial<typeof p>) => {
    onChange({
      ...data,
      player_profile: { ...p, ...updates },
    });
  };

  return (
    <FormSection icon={Link2} title="Liens" darkMode={darkMode}>
      <div className="space-y-4">
        <FormField
          label="Lien stats / Transfermarkt"
          type="url"
          value={p.stats_url ?? ""}
          placeholder="https://..."
          onChange={(v) => updateProfile({ stats_url: v === "" ? null : v })}
          darkMode={darkMode}
        />
        <FormField
          label="Lien vidéo"
          type="url"
          value={p.video_url ?? ""}
          placeholder="https://youtube.com/..."
          onChange={(v) => updateProfile({ video_url: v === "" ? null : v })}
          darkMode={darkMode}
        />
      </div>
    </FormSection>
  );
}
