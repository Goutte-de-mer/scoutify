import { Phone } from "lucide-react";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import type { CompleteResumeResponse } from "@/types/submission";

interface ContactSectionProps {
  data: CompleteResumeResponse;
  onChange: (data: CompleteResumeResponse) => void;
  darkMode?: boolean;
}

export function ContactSection({ data, onChange, darkMode = false }: ContactSectionProps) {
  const c = data.contacts;

  const updateContacts = (updates: Partial<typeof c>) => {
    onChange({
      ...data,
      contacts: { ...c, ...updates },
    });
  };

  return (
    <FormSection icon={Phone} title="Contact" darkMode={darkMode}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="Email joueur"
          type="email"
          value={c.player_email}
          placeholder="joueur@email.com"
          required
          onChange={(v) => updateContacts({ player_email: v })}
          darkMode={darkMode}
        />
        <FormField
          label="Téléphone joueur"
          type="tel"
          value={c.player_phone}
          placeholder="+33 6 12 34 56 78"
          onChange={(v) => updateContacts({ player_phone: v })}
          darkMode={darkMode}
        />
      </div>
      <div className={darkMode ? "border-t-2 border-gray-700 pt-6" : "border-t-2 border-gray-200 pt-6"}>
        <p className={darkMode ? "mb-4 text-base font-bold text-white" : "mb-4 text-base font-bold text-black"}>Agent (optionnel)</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            label="Email agent"
            type="email"
            value={c.agent_email ?? ""}
            placeholder="agent@email.com"
            onChange={(v) =>
              updateContacts({ agent_email: v === "" ? null : v })
            }
            darkMode={darkMode}
          />
          <FormField
            label="Téléphone agent"
            type="tel"
            value={c.agent_phone ?? ""}
            placeholder="+33 6 12 34 56 78"
            onChange={(v) =>
              updateContacts({ agent_phone: v === "" ? null : v })
            }
            darkMode={darkMode}
          />
        </div>
      </div>
    </FormSection>
  );
}
