"use client";

import React from "react";
import { useAuth } from "@/components/auth/useAuth";

export default function Topbar({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user, isLoggedIn, logout, loading } = useAuth();

  return (
    <header className="topbar">
      <div className="brand">
        <span className="mark" aria-hidden="true" />
        <span>Rémy</span>
      </div>

      <nav className="nav">
        <a href="#galerie">Galerie</a>
        <a href="#infos">Infos</a>
        <a href="#avis">Avis</a>
      </nav>

      <div className="right">
        {loading ? (
          <div className="pill ghost">…</div>
        ) : isLoggedIn ? (
          <>
            <div className="pill hello" title={user?.id}>
              <b>{user?.name}</b>
            </div>
            <button className="pill" onClick={logout}>
              Déconnexion
            </button>
          </>
        ) : (
          <button className="pill" onClick={onOpenAuth}>
            Connexion
          </button>
        )}
      </div>

      <style jsx>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 14px;
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.65);
          backdrop-filter: blur(10px);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .mark {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(180deg, var(--accent-2), var(--accent));
          box-shadow: 0 8px 18px rgba(122, 78, 47, 0.2);
        }

        .nav {
          display: flex;
          gap: 12px;
          font-size: 14px;
          color: var(--muted);
        }

        .nav a {
          text-decoration: none;
          padding: 8px 10px;
          border-radius: 12px;
          border: 1px solid transparent;
          font-weight: 800;
        }

        .nav a:hover {
          color: var(--text);
          border-color: var(--border);
          background: rgba(243, 231, 214, 0.75);
        }

        .right {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .pill {
          height: 40px;
          padding: 0 12px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.75);
          cursor: pointer;
          font-weight: 950;
          color: var(--text);
        }

        .pill:hover {
          transform: translateY(-1px);
        }

        .pill.ghost {
          cursor: default;
          transform: none;
          opacity: 0.7;
        }

        .pill.hello {
          background: rgba(255, 250, 242, 0.8);
          cursor: default;
        }
        .pill.hello:hover { transform: none; }

        @media (max-width: 700px) {
          .nav {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
