import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface FormSectionProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  darkMode?: boolean;
}

export function FormSection({
  icon: Icon,
  title,
  subtitle,
  children,
  action,
  darkMode = false,
}: FormSectionProps) {
  const sectionClassName = darkMode
    ? "space-y-6 rounded-xl border-2 border-gray-700 bg-zinc-900 p-6"
    : "space-y-6 rounded-xl border-2 border-gray-200 bg-white p-6";
  
  const titleClassName = darkMode
    ? "text-xl font-bold text-white"
    : "text-xl font-bold text-black";
  
  const subtitleClassName = darkMode
    ? "text-sm font-semibold text-gray-400"
    : "text-sm font-semibold text-gray-600";

  return (
    <section className={sectionClassName}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg text-white">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className={titleClassName}>{title}</h3>
            {subtitle && <span className={subtitleClassName}>{subtitle}</span>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
