import { LucideIcon } from "lucide-react";

interface DistinctionBadgeProps {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}

export function DistinctionBadge({
  label,
  icon: Icon,
  active,
  onClick,
}: DistinctionBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
