"use client";

import { useEffect, useState } from "react";
import Header from "@/components/HeaderStaff";
import CardNumber from "@/components/CardNumber";
import { ResumeFilters } from "@/components/ResumeFilters/ResumeFilters";
import { fetchResumes } from "@/lib/api/resumes";
import Table from "@/components/Table/Table";

type StatusFilter = "all" | "treated" | "untreated";

export default function Home() {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [treatedCount, setTreatedCount] = useState<number>(0);
  const [untreatedCount, setUntreatedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const data = await fetchResumes("all");
        const treated = data.resumes.filter((r) => r.is_treated === 1).length;
        const untreated = data.resumes.filter((r) => r.is_treated === 0).length;

        setTotalCount(data.count);
        setTreatedCount(treated);
        setUntreatedCount(untreated);
      } catch (error) {
        console.error("Erreur lors du chargement des CVs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResumes();
  }, []);

  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-3 gap-4">
          <CardNumber
            title="Total"
            type="total"
            number={loading ? 0 : totalCount}
          />
          <CardNumber
            title="Traités"
            type="processed"
            number={loading ? 0 : treatedCount}
          />
          <CardNumber
            title="En attente"
            type="pending"
            number={loading ? 0 : untreatedCount}
          />
        </div>

        <div className="mt-6">
          <ResumeFilters
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-gray-800 bg-zinc-900">
          <div className="relative w-full overflow-auto">
            <Table statusFilter={statusFilter} searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </>
  );
}
