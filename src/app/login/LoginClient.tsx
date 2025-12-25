"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sp = useSearchParams();
  const router = useRouter();
  const nextPath = useMemo(() => sp.get("next") || "/admin", [sp]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password }),
      });

      const j = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(j?.error ?? "Login failed");
      }

      if (j?.role !== "ADMIN") {
        throw new Error("Accès réservé aux administrateurs.");
      }

      router.push(nextPath);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="head">
          <h1 className="h1">Admin</h1>
          <p className="p">Connexion pour modifier le produit et gérer le contenu.</p>
        </div>

        {err ? <div className="err">{err}</div> : null}

        <form onSubmit={onSubmit} className="form">
          <label className="label">
            Nom
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={30}
              autoComplete="username"
              placeholder="ex: raphael"
            />
          </label>

          <label className="label">
            Mot de passe
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={72}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          <div className="row">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </div>
        </form>

        <div className="badge">30 ans de Rémy</div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 22px 16px;
        }

        .card {
          width: 100%;
          max-width: 520px;
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.85);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 16px;
          display: grid;
          gap: 12px;
        }

        .head {
          display: grid;
          gap: 6px;
        }

        .h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          letter-spacing: -0.02em;
        }

        .p {
          margin: 0;
          color: var(--muted);
          font-weight: 700;
          font-size: 13px;
          line-height: 1.5;
        }

        .err {
          border: 1px solid rgba(122, 42, 31, 0.2);
          background: rgba(255, 235, 235, 0.7);
          color: #7a2a1f;
          border-radius: 14px;
          padding: 10px 12px;
          font-weight: 900;
          font-size: 13px;
        }

        .form {
          display: grid;
          gap: 10px;
        }

        .label {
          display: grid;
          gap: 6px;
          font-size: 12px;
          font-weight: 900;
          color: var(--muted);
        }

        .input {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 10px 12px;
          background: rgba(255, 250, 242, 0.9);
          color: var(--text);
          outline: none;
          font-weight: 800;
        }

        .input:focus {
          border-color: rgba(122, 78, 47, 0.35);
          box-shadow: 0 0 0 4px rgba(122, 78, 47, 0.1);
        }

        .row {
          display: flex;
          justify-content: flex-end;
          margin-top: 4px;
        }

        .btn {
          height: 44px;
          padding: 0 14px;
          border-radius: 16px;
          border: 1px solid rgba(42, 27, 18, 0.08);
          cursor: pointer;
          background: linear-gradient(180deg, var(--accent-2), var(--accent));
          color: var(--accent-contrast);
          font-weight: 950;
          letter-spacing: -0.01em;
          box-shadow: 0 14px 26px rgba(122, 78, 47, 0.18);
        }

        .btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.03);
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: default;
          transform: none;
        }

        .badge {
          display: grid;
          place-items: center;
          padding: 10px 12px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.55);
          border-radius: 14px;
          font-weight: 950;
          letter-spacing: -0.01em;
          color: var(--text);
        }
      `}</style>
    </div>
  );
}
