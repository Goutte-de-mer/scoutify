"use client";

import { useRouter } from "next/navigation";
import { Shield, LogOut } from "lucide-react";
import { useState } from "react";

const HeaderStaff = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="header">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
            <Shield strokeWidth={2} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Espace STAFF</h1>
            <p className="text-sm text-gray-400">Gestion des CV joueurs</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="group btn flex items-center gap-x-2 border border-gray-800 bg-white text-sm font-semibold text-black transition-colors hover:bg-red-700/15 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut
            size={16}
            strokeWidth={2}
            className="text-black transition group-hover:text-red-500"
          />
          {loading ? "Déconnexion..." : "Déconnexion"}
        </button>
      </div>
    </header>
  );
};

export default HeaderStaff;
