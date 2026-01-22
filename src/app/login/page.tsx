"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Si l'utilisateur est déjà authentifié, rediriger
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        if (response.ok) {
          const redirect = searchParams.get("redirect") || "/staff";
          router.push(redirect);
        }
      } catch {
        // Pas authentifié, rester sur la page de login
      }
    };
    checkAuth();
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        const redirect = searchParams.get("redirect") || "/staff";
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || "Erreur lors de la connexion");
      }
    } catch (err) {
      setError("Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-zinc-900 p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-white">
            Connexion Staff
          </h1>
          <p className="text-sm text-gray-400">Accès réservé au personnel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus:ring-primary w-full rounded-lg border border-gray-700 bg-zinc-800 px-4 py-3 text-white placeholder-gray-500 focus:border-transparent focus:ring-2 focus:outline-none"
              placeholder="Entrez le mot de passe"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary w-full rounded-lg px-4 py-3 font-semibold text-white transition-colors hover:bg-amber-500/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
