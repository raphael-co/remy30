"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/app/recap/components/Icon";

export default function RecapButton() {
  const router = useRouter();

  return (
    <>
      <button
        className="btn"
        aria-label="Ouvrir le recap"
        onClick={() => router.push("/recap")}
        type="button"
      >
        <span className="ic" aria-hidden="true">
          <Icon name="sparkles" size={18} />
        </span>

        <span className="txt">Recap</span>

        <span className="chip" aria-hidden="true">
          New
        </span>

        <span className="shine" aria-hidden="true" />
      </button>

      <style jsx>{`
        .btn {
          position: relative;
          height: 44px;
          padding: 0 14px 0 10px;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: rgba(253, 249, 246, 0.92);
          box-shadow: 0 10px 26px rgba(2, 6, 23, 0.08);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: rgba(15, 23, 42, 0.92);
          font-weight: 950;
          letter-spacing: -0.02em;
          overflow: hidden;
          transform: translateZ(0);
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* subtle hover + lift */
        .btn:hover {
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 14px 34px rgba(2, 6, 23, 0.12);
          transform: translateY(-1px);
        }

        .btn:active {
          transform: translateY(0px) scale(0.995);
          box-shadow: 0 10px 26px rgba(2, 6, 23, 0.1);
        }

        /* focus visible */
        .btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.18), 0 14px 34px rgba(2, 6, 23, 0.12);
        }

        .ic {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(15, 23, 42, 0.92);
          color: #fff;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
          transition: transform 180ms ease, box-shadow 180ms ease;
          flex: 0 0 auto;
        }

        .btn:hover .ic {
          transform: scale(1.04);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16), 0 10px 22px rgba(0, 0, 0, 0.12);
        }

        .txt {
          line-height: 1;
          font-size: 14px;
          white-space: nowrap;
        }

        .chip {
          margin-left: 2px;
          height: 24px;
          padding: 0 10px;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: rgba(15, 23, 42, 0.06);
          display: inline-flex;
          align-items: center;
          font-size: 12px;
          font-weight: 950;
          color: rgba(15, 23, 42, 0.75);
          flex: 0 0 auto;
        }

        /* small premium shine */
        .shine {
          position: absolute;
          inset: -40px;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.35), transparent 55%);
          opacity: 0.65;
          pointer-events: none;
          transition: opacity 180ms ease;
        }

        .btn:hover .shine {
          opacity: 0.9;
        }

        /* mobile: compact (icon only optional behavior) */
        @media (max-width: 420px) {
          .btn {
            height: 42px;
            padding: 0 12px 0 10px;
            gap: 8px;
          }
          .txt {
            font-size: 13px;
          }
          .chip {
            height: 22px;
            padding: 0 8px;
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
}
