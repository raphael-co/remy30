"use client";

import React from "react";
import Modal from "@/components/ui/Modal";

type Mode = "login" | "register";

export default function AuthModal({
  open,
  onClose,
  onAuthed,
  defaultMode = "login",
}: {
  open: boolean;
  onClose: () => void;
  onAuthed: () => void;
  defaultMode?: Mode;
}) {
  const [mode, setMode] = React.useState<Mode>(defaultMode);

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setMode(defaultMode);
    setError(null);
  }, [open, defaultMode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const n = name.trim();
    const p = password;

    if (!n || n.length < 2 || n.length > 30) {
      setError("Nom invalide (2..30).");
      return;
    }
    if (!p || p.length < 6 || p.length > 72) {
      setError("Mot de passe invalide (6..72).");
      return;
    }

    setBusy(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, password: p }),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if (j?.error) msg = String(j.error);
        } catch {}
        throw new Error(msg);
      }

      setName("");
      setPassword("");
      onAuthed();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === "login" ? "Connexion" : "Créer un compte"}>
      <div className="wrap">
        <div className="switch">
          <button
            type="button"
            className={`tab ${mode === "login" ? "on" : ""}`}
            onClick={() => setMode("login")}
          >
            Connexion
          </button>
          <button
            type="button"
            className={`tab ${mode === "register" ? "on" : ""}`}
            onClick={() => setMode("register")}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={submit} className="form">
          <label className="field">
            <span>Nom</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: raphael"
              maxLength={30}
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>Mot de passe</span>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              maxLength={72}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          {error ? <div className="alert">{error}</div> : null}

          <button className="cta" disabled={busy}>
            {busy ? "…" : mode === "login" ? "Se connecter" : "Créer le compte"}
          </button>

          <div className="tiny">
            Cookie de session (httpOnly). Pas de mails, juste nom + mot de passe.
          </div>
        </form>
      </div>

      <style jsx>{`
        .wrap { display: grid; gap: 12px; }

        .switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 6px;
          background: rgba(243, 231, 214, 0.5);
        }

        .tab {
          height: 40px;
          border-radius: 14px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          font-weight: 950;
          color: var(--muted);
        }

        .tab.on {
          background: rgba(255, 250, 242, 0.85);
          border-color: var(--border);
          color: var(--text);
          box-shadow: 0 10px 22px rgba(42, 27, 18, 0.08);
        }

        .form { display: grid; gap: 10px; }

        .field { display: grid; gap: 6px; }
        .field span { font-size: 12px; font-weight: 900; color: var(--muted); }

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

        .alert {
          border: 1px solid rgba(122, 42, 31, 0.2);
          background: rgba(255, 235, 235, 0.7);
          color: #7a2a1f;
          border-radius: 14px;
          padding: 10px 12px;
          font-weight: 900;
          font-size: 13px;
        }

        .cta {
          height: 46px;
          border-radius: 16px;
          border: 1px solid rgba(42, 27, 18, 0.08);
          cursor: pointer;
          background: linear-gradient(180deg, var(--accent-2), var(--accent));
          color: var(--accent-contrast);
          font-weight: 950;
          letter-spacing: -0.01em;
          box-shadow: 0 14px 26px rgba(122, 78, 47, 0.18);
        }
        .cta:hover { transform: translateY(-1px); filter: brightness(1.03); }
        .cta:disabled { opacity: 0.7; cursor: default; transform: none; }

        .tiny {
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
          line-height: 1.5;
        }
      `}</style>
    </Modal>
  );
}
