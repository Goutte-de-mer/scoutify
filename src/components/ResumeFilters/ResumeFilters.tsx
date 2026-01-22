import { SearchBar } from "./SearchBar";
import { StatusFilter } from "./StatusFilter";

type StatusFilterValue = "all" | "treated" | "untreated";

interface ResumeFiltersProps {
  searchQuery: string;
  statusFilter: StatusFilterValue;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: StatusFilterValue) => void;
}

export function ResumeFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: ResumeFiltersProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-zinc-900 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        <StatusFilter value={statusFilter} onChange={onStatusChange} />
      </div>
    </div>
  );
}
