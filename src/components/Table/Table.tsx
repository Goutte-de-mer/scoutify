import TableHeader from "./TableHeader";
import TableBody from "./TableBody";

interface TableProps {
  statusFilter?: "all" | "treated" | "untreated";
  searchQuery?: string;
}

const Table = ({ statusFilter = "all", searchQuery = "" }: TableProps) => {
  return (
    <table className="w-full caption-bottom text-sm">
      <TableHeader />
      <TableBody statusFilter={statusFilter} searchQuery={searchQuery} />
    </table>
  );
};

export default Table;
