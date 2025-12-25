"use client";

import React from "react";
import Accordion from "@/components/ui/Accordion";
import Quantity from "@/components/ui/Quantity";
import Stars from "@/components/ui/Stars";

function SoldModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Produit déjà acheté"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modalCard">
        <div className="modalHeader">
          <div className="modalIcon">⚠️</div>
          <div className="modalTitle">Déjà acheté</div>
        </div>

        <div className="modalBody">
          <p className="modalText">
            Rémy a déjà été acheté par <strong>Laura</strong>.
          </p>
          <p className="modalText subtle">
            Impossible de l’ajouter au panier.
          </p>

          <div className="modalHint">
            <span className="pill">Rupture de stock</span>
            <span className="pill">Édition unique</span>
          </div>
        </div>

        <div className="modalActions">
          <button className="modalBtnPrimary" onClick={onClose}>
            OK
          </button>
        </div>
      </div>

      <style jsx>{`
        .modalOverlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(2, 6, 23, 0.55);
          backdrop-filter: blur(6px);
        }

        .modalCard {
          width: min(520px, 100%);
          border-radius: 18px;
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.98);
          box-shadow: 0 22px 55px rgba(2, 6, 23, 0.18);
          padding: 16px;
          animation: pop 140ms ease-out;
        }

        @keyframes pop {
          from {
            transform: translateY(6px) scale(0.99);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .modalHeader {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .modalIcon {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.75);
          display: grid;
          place-items: center;
          font-size: 18px;
        }

        .modalTitle {
          font-weight: 950;
          letter-spacing: -0.02em;
          font-size: 18px;
          color: var(--text);
        }

        .modalBody {
          padding: 6px 2px 4px;
        }

        .modalText {
          margin: 6px 0;
          line-height: 1.6;
          color: var(--text);
          font-weight: 700;
        }

        .subtle {
          color: var(--muted);
          font-weight: 700;
        }

        .modalHint {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .pill {
          font-size: 12px;
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.55);
          color: var(--text);
          font-weight: 900;
        }

        .modalActions {
          margin-top: 14px;
          display: flex;
          justify-content: flex-end;
        }

        .modalBtnPrimary {
          height: 42px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid rgba(42, 27, 18, 0.08);
          cursor: pointer;
          background: linear-gradient(180deg, var(--accent-2), var(--accent));
          color: var(--accent-contrast);
          font-weight: 950;
          letter-spacing: -0.01em;
          box-shadow: 0 14px 26px rgba(122, 78, 47, 0.18);
        }
        .modalBtnPrimary:hover {
          transform: translateY(-1px);
          filter: brightness(1.03);
        }
      `}</style>
    </div>
  );
}

export default function ProductInfo({
  title,
  subtitle,
  description,
  qty,
  setQty,
}: {
  title: string;
  subtitle: string | null;
  description: string;
  qty: number;
  setQty: (n: number) => void;
}) {
  const [soldOpen, setSoldOpen] = React.useState(false);

  return (
    <div className="right" id="infos">
      <div className="badges">
        <span className="badge">Édition spéciale</span>
        <span className="badge">Page officielle</span>
      </div>

      <h1 className="h1">{title}</h1>
      {subtitle ? <p className="subtitle">{subtitle}</p> : null}

      <div className="ratingRow">
        <Stars rating={4.8} />
        <span className="ratingText">4.8 • 242 avis</span>
      </div>

      <p className="desc">{description}</p>

      <div className="buyRow">
        <Quantity value={qty} onChange={setQty} />

        <button className="ghost" onClick={() => setSoldOpen(true)}>
          Acheter
        </button>
      </div>

      <div className="trust">
        <div className="trustItem">
          <span className="k">✓</span>
          <span>Infos à jour</span>
        </div>
        <div className="trustItem">
          <span className="k">✓</span>
          <span>Simple</span>
        </div>
        <div className="trustItem">
          <span className="k">✓</span>
          <span>Premium</span>
        </div>
      </div>

      <div className="accordions">
        <Accordion title="Détails">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium">Identité</div>
              <div className="text-sm text-[var(--muted)]">
                Prénom : Rémy • Âge : 30 ans • Signe astrologique : Capricorne
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Physique</div>
              <div className="text-sm text-[var(--muted)]">
                Taille : 1m70 • Poids : 64 kg • Yeux : bleus • Cheveux : bruns
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Personnalité</div>
              <div className="text-sm text-[var(--muted)]">
                Humour : drôle • Tempérament : chill • Sociabilité : 10/10
              </div>
            </div>

            <div>
              <div className="text-sm text-[var(--muted)]">
                QI : non affichable pour des raisons évidentes
              </div>
            </div>

            <div>
              <div className="text-sm text-[var(--muted)]">
                Faiblesse : la liste est trop longue pour n’en citer qu’une
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Fun facts</div>
              <div className="text-sm text-[var(--muted)]">
                Record : a réussi à trouver quelqu’un qui l’accepte tel qu’il
                est • Phrase fétiche : « faisons comme ça » • Hobby : prendre
                exemple sur son petit frère
              </div>
            </div>
          </div>
        </Accordion>
      </div>

      <SoldModal open={soldOpen} onClose={() => setSoldOpen(false)} />

      <style jsx>{`
        .right {
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.82);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 16px;
        }

        .badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .badge {
          font-size: 12px;
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.75);
          color: var(--text);
          font-weight: 900;
        }

        .h1 {
          margin: 12px 0 6px;
          font-size: 30px;
          letter-spacing: -0.03em;
          line-height: 1.08;
        }

        .subtitle {
          margin: 0 0 12px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.45;
          font-weight: 700;
        }

        .ratingRow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .ratingText {
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
        }

        .desc {
          margin: 10px 0 12px;
          color: var(--muted);
          line-height: 1.7;
          font-size: 14px;
        }

        .buyRow {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: center;
          margin: 14px 0 12px;
        }

        .ghost {
          grid-column: 1 / -1;
          height: 46px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          color: var(--text);
          font-weight: 900;
        }
        .ghost:hover {
          background: rgba(243, 231, 214, 0.55);
        }

        .trust {
          margin-top: 10px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 10px;
          background: linear-gradient(
            to bottom,
            rgba(122, 78, 47, 0.06),
            rgba(122, 78, 47, 0)
          );
        }

        .trustItem {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font-size: 13px;
          justify-content: center;
          text-align: center;
          font-weight: 700;
        }

        .k {
          width: 22px;
          height: 22px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.75);
          color: var(--text);
          font-weight: 900;
          font-size: 12px;
        }

        .accordions {
          margin-top: 12px;
          display: grid;
          gap: 10px;
        }

        @media (max-width: 900px) {
          .trust {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
