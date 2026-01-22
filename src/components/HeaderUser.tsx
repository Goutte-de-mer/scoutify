"use client";

import { User, Send } from "lucide-react";
import Link from "next/link";

interface HeaderUserProps {
  onSend?: () => void;
  disabled?: boolean;
}

const HeaderUser = ({ onSend, disabled = false }: HeaderUserProps) => {
  return (
    <header className="header">
      <div className="inner-header">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
            <User strokeWidth={2} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CV Joueur</h1>
            <p className="text-sm text-gray-400">Formulaire de candidature</p>
          </div>
        </div>
        <div className="flex items-center gap-x-3.5">
          <Link
            href={"/staff"}
            className="group flex items-center gap-x-2 rounded-md border border-gray-600 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-800 hover:text-white active:scale-95"
          >
            <User
              size={16}
              strokeWidth={2}
              className="text-black transition group-hover:text-white"
            />
            Espace Staff
          </Link>
          <button
            onClick={onSend}
            disabled={disabled}
            className={`group btn bg-primary flex items-center gap-x-2 border border-gray-800 text-sm font-semibold text-white transition ${
              disabled
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-amber-500/80"
            }`}
          >
            <Send size={16} strokeWidth={2} color="white" />
            Envoyer
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderUser;
