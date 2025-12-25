"use client";

import React from "react";

export default function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={title ?? "Modal"}>
      <button className="backdrop" aria-label="Fermer" onClick={onClose} />
      <div className="panel">
        <div className="top">
          <div className="title">{title ?? ""}</div>
          <button className="close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div className="content">{children}</div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: grid;
          place-items: center;
          padding: 18px;
        }
        .backdrop {
          position: absolute;
          inset: 0;
          background: rgba(42, 27, 18, 0.55);
          border: 0;
          cursor: pointer;
        }
        .panel {
          position: relative;
          width: min(980px, 100%);
          border-radius: 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: 0 40px 90px rgba(42, 27, 18, 0.35);
          overflow: hidden;
        }
        .top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(
            to bottom,
            rgba(255, 250, 242, 0.85),
            rgba(255, 250, 242, 0)
          );
        }
        .title {
          font-weight: 800;
          font-size: 14px;
          color: var(--text);
        }
        .close {
          width: 38px;
          height: 38px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.85);
          cursor: pointer;
          color: var(--text);
        }
        .close:hover {
          transform: translateY(-1px);
        }
        .content {
          padding: 14px;
        }
      `}</style>
    </div>
  );
}
