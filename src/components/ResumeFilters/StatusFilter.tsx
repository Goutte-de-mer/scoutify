type StatusFilter = "all" | "treated" | "untreated";

interface StatusFilterProps {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}

const filters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "untreated", label: "À traiter" },
  { value: "treated", label: "Traités" },
];

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            value === filter.value
              ? "bg-primary text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
