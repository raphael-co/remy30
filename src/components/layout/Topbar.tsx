"use client";

import React from "react";
import { useAuth } from "@/components/auth/useAuth";
import RecapButton from "../recap/RecapButton";

export default function Topbar({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user, isLoggedIn, logout, loading } = useAuth();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    // lock scroll quand le menu est ouvert (mobile)
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);


  const MobileAuth = () => {
    if (loading) return <div className="muted">…</div>;
    if (isLoggedIn)
      return (
        <>
          <div className="who">
            <div className="avatar" aria-hidden="true">
              {String(user?.name ?? "?")
                .trim()
                .slice(0, 1)
                .toUpperCase()}
            </div>
            <div className="whoText">
              <div className="whoName">{user?.name}</div>
              <div className="whoSub">Connecté</div>
            </div>
          </div>
          <button className="menuBtn danger" type="button" onClick={logout}>
            Déconnexion
          </button>
        </>
      );

    return (
      <button className="menuBtn primary" type="button" onClick={onOpenAuth}>
        Connexion
      </button>
    );
  };

  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Accueil">
        <span className="mark" aria-hidden="true" />
        <span className="brandText">Rémy</span>
      </a>

      <nav className="nav" aria-label="Navigation principale">
        <a href="/galerie">Galerie</a>
        <a href="#avis">Avis</a>
      </nav>

      <div className="actions">
        <div className="desktopOnly">
          <RecapButton />
        </div>

        <div className="desktopOnly authDesktop">
          {loading ? (
            <div className="chip muted">…</div>
          ) : isLoggedIn ? (
            <>
              <div className="chip hello" title={user?.id}>
                {user?.name}
              </div>
              <button className="chip" onClick={logout} type="button">
                Déconnexion
              </button>
            </>
          ) : (
            <button className="chip primary" onClick={onOpenAuth} type="button">
              Connexion
            </button>
          )}
        </div>

        <button
          className="burger"
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`burgerIcon ${open ? "open" : ""}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {/* Bottom sheet */}
      <div className={`sheetWrap ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="backdrop" onClick={() => setOpen(false)} />

        <div className="sheet" role="dialog" aria-label="Menu">
          <div className="sheetHandle" aria-hidden="true" />
          <div className="sheetHeader">
            <div className="sheetTitle">Menu</div>
            <button className="iconBtn" type="button" aria-label="Fermer" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className="menuGrid">
            <a className="menuCard" href="/galerie" onClick={() => setOpen(false)}>
              <div className="menuLabel">Galerie</div>
              <div className="menuSub">Photos & souvenirs</div>
            </a>

            <a className="menuCard" href="#avis" onClick={() => setOpen(false)}>

              <div className="menuLabel">Avis</div>
              <div className="menuSub">Messages des invités</div>

            </a>

            <a className="menuCard" href="/recap" onClick={() => setOpen(false)}>

              <div className="menuLabel">Recap</div>
              <div className="menuSub">Visionner le Recap</div>

            </a>
          </div>

          <div className="authBlock">
            <MobileAuth />
          </div>

          <div className="fineprint">Astuce: touche Échap pour fermer.</div>
        </div>
      </div>

      <style jsx>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 10px 12px;
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.62);
          backdrop-filter: blur(10px);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          position: relative;
          z-index: 50;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--text);
          min-width: 0;
        }

        .brandText {
          font-weight: 950;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }

        .mark {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(180deg, var(--accent-2), var(--accent));
          box-shadow: 0 8px 18px rgba(122, 78, 47, 0.2);
          flex: 0 0 auto;
        }

        .nav {
          display: flex;
          gap: 8px;
          padding: 4px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: rgba(243, 231, 214, 0.42);
        }

        .nav a {
          text-decoration: none;
          color: var(--muted);
          font-weight: 900;
          padding: 8px 12px;
          border-radius: 999px;
          transition: background 140ms ease, color 140ms ease, transform 140ms ease;
        }

        .nav a:hover {
          background: rgba(243, 231, 214, 0.75);
          color: var(--text);
          transform: translateY(-1px);
        }

        .actions {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .authDesktop {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .chip {
          height: 38px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.6);
          color: var(--text);
          font-weight: 950;
          cursor: pointer;
          transition: transform 140ms ease, background 140ms ease;
        }

        .chip:hover {
          transform: translateY(-1px);
          background: rgba(243, 231, 214, 0.78);
        }

        .chip.muted {
          cursor: default;
          opacity: 0.7;
        }
        .chip.muted:hover {
          transform: none;
        }

        .chip.hello {
          cursor: default;
          background: rgba(255, 250, 242, 0.75);
        }
        .chip.hello:hover {
          transform: none;
        }

        .chip.primary {
          background: linear-gradient(180deg, rgba(243, 231, 214, 0.85), rgba(243, 231, 214, 0.55));
        }

        .burger {
          display: none;
          height: 38px;
          width: 44px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.6);
          cursor: pointer;
        }

        .burgerIcon {
          display: grid;
          gap: 5px;
          place-items: center;
        }

        .burgerIcon span {
          width: 18px;
          height: 2px;
          border-radius: 99px;
          background: rgba(30, 18, 8, 0.88);
          display: block;
          transition: transform 160ms ease, opacity 160ms ease;
        }

        .burgerIcon.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .burgerIcon.open span:nth-child(2) {
          opacity: 0;
        }
        .burgerIcon.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Sheet */
        .sheetWrap {
          position: fixed;
          inset: 0;
          z-index: 80;
          pointer-events: none;
        }

        .sheetWrap.open {
          pointer-events: auto;
        }

        .backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.28);
          opacity: 0;
          transition: opacity 180ms ease;
        }

        .sheetWrap.open .backdrop {
          opacity: 1;
        }

        .sheet {
          position: absolute;
          left: 12px;
          right: 12px;

          /* ✅ SAFE AREA + ne sort jamais */
          bottom: max(12px, env(safe-area-inset-bottom));
          max-height: calc(100dvh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;

          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 250, 242, 1);
          backdrop-filter: blur(16px);
          box-shadow: 0 40px 140px rgba(0, 0, 0, 0.35);

          transform: translateY(18px);
          opacity: 0;
          transition: transform 180ms ease, opacity 180ms ease;

          /* ✅ espace en bas pour les téléphones (home indicator) */
          padding: 12px 12px calc(14px + env(safe-area-inset-bottom));
        }


        .sheetWrap.open .sheet {
          transform: translateY(500px);
          opacity: 1;
        }

        .sheetHandle {
          width: 46px;
          height: 5px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.14);
          margin: 2px auto 10px;
        }

        .sheetHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .sheetTitle {
          font-weight: 1000;
          letter-spacing: -0.02em;
        }

        .iconBtn {
          height: 36px;
          width: 44px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.6);
          cursor: pointer;
          font-weight: 900;
        }

        .menuGrid {
          display: grid;
          gap: 10px;
        }

        .menuCard {
          display: grid;
          grid-template-columns: 42px 1fr;
          gap: 10px;
          align-items: center;
          padding: 12px;
          border-radius: 18px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.52);
          text-decoration: none;
          color: var(--text);
          transition: transform 140ms ease, background 140ms ease;
        }

        .menuCard:hover {
          transform: translateY(-1px);
          background: rgba(243, 231, 214, 0.74);
        }

        .menuCard.ghost {
          grid-template-columns: 42px 1fr auto;
        }

        .menuIcon {
          height: 42px;
          width: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(255, 250, 242, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.06);
          font-size: 20px;
        }

        .menuLabel {
          font-weight: 1000;
          letter-spacing: -0.02em;
        }

        .menuSub {
          font-size: 12px;
          color: var(--muted);
          margin-top: 2px;
        }

        .menuRight {
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
        }

        .authBlock {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          display: grid;
          gap: 10px;
        }

        .who {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar {
          height: 38px;
          width: 38px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-weight: 1000;
          background: rgba(243, 231, 214, 0.85);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .whoName {
          font-weight: 1000;
        }

        .whoSub {
          font-size: 12px;
          color: var(--muted);
          margin-top: 1px;
        }

        .menuBtn {
          height: 42px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.62);
          font-weight: 1000;
          cursor: pointer;
          padding: 0 12px;
        }

        .menuBtn.primary {
          background: linear-gradient(180deg, rgba(243, 231, 214, 0.9), rgba(243, 231, 214, 0.55));
        }

        .menuBtn.danger {
          background: rgba(255, 210, 210, 0.65);
        }

        .muted {
          color: var(--muted);
          font-weight: 900;
        }

        .fineprint {
          margin-top: 10px;
          font-size: 12px;
          color: var(--muted);
          opacity: 0.9;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .nav {
            display: none;
          }
          .desktopOnly {
            display: none;
          }
          .burger {
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .backdrop,
          .sheet,
          .burgerIcon span,
          .chip:hover,
          .menuCard:hover {
            transition: none;
            transform: none;
          }
        }
      `}</style>
    </header>
  );
}
