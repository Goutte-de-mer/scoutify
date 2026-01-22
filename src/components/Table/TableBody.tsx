"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchResumes, type ResumesResponse } from "@/lib/api/resumes";
import { Eye, Trash, FileText } from "lucide-react";
import Link from "next/link";
import DownloadBtn from "../DownloadBtn";

interface TableBodyProps {
  statusFilter?: "all" | "treated" | "untreated";
  searchQuery?: string;
}

const TableBody = ({ statusFilter = "all", searchQuery = "" }: TableBodyProps) => {
  const [allResumes, setAllResumes] = useState<ResumesResponse["resumes"]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const data = await fetchResumes("all");
        setAllResumes(data.resumes);
      } catch (error) {
        console.error("Erreur lors du chargement des CVs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResumes();
  }, []);

  // Filtrer les CVs selon le statut et la recherche
  const resumes = useMemo(() => {
    let filtered = [...allResumes];

    // Filtre par statut
    if (statusFilter === "treated") {
      filtered = filtered.filter((r) => r.is_treated === 1);
    } else if (statusFilter === "untreated") {
      filtered = filtered.filter((r) => r.is_treated === 0);
    }

    // Filtre par recherche (nom et/ou prénom)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.last_name.toLowerCase().includes(query) ||
          r.first_name.toLowerCase().includes(query) ||
          `${r.first_name} ${r.last_name}`.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allResumes, statusFilter, searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getStatusBadge = (isTreated: number) => {
    if (isTreated === 1) {
      return (
        <span className="rounded-sm border border-green-500/50 bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-400">
          Traité
        </span>
      );
    }
    return (
      <span className="border-primary/50 bg-primary/20 text-primary rounded-sm border px-2 py-1 text-xs font-semibold">
        À traiter
      </span>
    );
  };

  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={6} className="py-8 text-center text-gray-500">
            Chargement...
          </td>
        </tr>
      </tbody>
    );
  }

  if (resumes.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={6} className="py-8 text-center text-gray-500">
            Aucun CV trouvé
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {resumes.map((resume) => (
        <tr
          key={resume.id}
          className="border-b border-gray-800 transition-colors hover:bg-gray-800/50"
        >
          <td className="px-4 py-3 text-gray-400">{resume.last_name}</td>
          <td className="px-4 py-3 text-gray-400">{resume.first_name}</td>
          <td className="px-4 py-3 text-gray-400">{resume.main_position}</td>
          <td className="px-4 py-3 text-gray-400">
            {formatDate(resume.created_at)}
          </td>
          <td className="px-4 py-3">{getStatusBadge(resume.is_treated)}</td>
          <td className="px-4 py-3 text-right text-gray-400">
            <div className="flex justify-end gap-2">
              <Link
                href={`/staff/resume/${resume.id}`}
                className="rounded-sm px-3 py-2 text-blue-400 transition hover:bg-blue-500/10 hover:text-blue-300"
              >
                <Eye size={16} />
              </Link>
              <DownloadBtn
                firstName={resume.first_name}
                lastName={resume.last_name}
              />
              <button className="px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                <Trash size={16} />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
