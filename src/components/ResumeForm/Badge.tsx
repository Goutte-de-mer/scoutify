import { CircleX } from "lucide-react";

interface BadgeProps {
  label: string;
  onRemove: () => void;
}

export function Badge({ label, onRemove }: BadgeProps) {
  return (
    <span className="bg-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/20"
        aria-label={`Retirer ${label}`}
      >
        <CircleX size={16} color="white" />
      </button>
    </span>
  );
}
