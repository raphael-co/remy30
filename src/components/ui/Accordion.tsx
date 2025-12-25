import React from "react";

export default function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="acc" open={defaultOpen}>
      <summary className="sum">
        <span>{title}</span>
        <span className="icon" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="body">{children}</div>

      <style jsx>{`
        .acc {
          border: 1px solid var(--border);
          border-radius: 16px;
          background: rgba(255, 250, 242, 0.85);
          overflow: hidden;
        }
        .sum {
          list-style: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 14px;
          gap: 12px;
          font-weight: 900;
          color: var(--text);
          user-select: none;
        }
        .sum::-webkit-details-marker {
          display: none;
        }
        .icon {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--muted);
          background: rgba(243, 231, 214, 0.85);
          font-weight: 900;
          transition: transform 180ms ease;
        }
        details[open] .icon {
          transform: rotate(45deg);
        }
        .body {
          padding: 0 14px 14px;
          color: var(--muted);
          line-height: 1.55;
          font-size: 14px;
        }
      `}</style>
    </details>
  );
}
