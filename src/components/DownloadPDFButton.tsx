"use client";

import { useState } from "react";
import { Download } from "lucide-react";

interface DownloadPDFButtonProps {
    resumeId: string;
}

export default function DownloadPDFButton({ resumeId }: DownloadPDFButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/resume/${resumeId}/generate-pdf`, {
                method: "POST",
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Erreur lors de la génération du PDF");
            }

            const data = await response.json();
            
            // Télécharger le fichier depuis le chemin retourné
            const fileUrl = data.file_path;
            const a = document.createElement("a");
            a.href = fileUrl;
            a.download = data.file_name || `CV_${resumeId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Erreur lors du téléchargement:", error);
            alert(error instanceof Error ? error.message : "Erreur lors de la génération du PDF");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            <Download size={20} />
            {isLoading ? "Génération..." : "Télécharger PDF"}
        </button>
    );
}
