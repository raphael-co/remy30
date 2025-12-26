"use client";

import React from "react";
import { Icon } from "./components/Icon";
import { RecapPlayer } from "./RecapPlayer";

export default function RecapButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button className="btn" onClick={() => setOpen(true)} aria-label="Ouvrir le recap">
        <span className="ic">
          <Icon name="sparkles" size={18} />
        </span>
        <span className="txt">Recap</span>
      </button>

      <RecapPlayer open={open} onClose={() => setOpen(false)} />

      <style jsx>{`
        .btn {
          height: 44px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #fdf9f6;
          box-shadow: 0 12px 30px rgba(2, 6, 23, 0.08);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: rgba(15, 23, 42, 0.9);
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .btn:hover {
          background: rgba(255, 255, 255, 1);
        }
        .ic {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(15, 23, 42, 0.9);
          color: #fff;
        }
        .txt {
          line-height: 1;
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
          font-weight: 900;
          color: rgba(15, 23, 42, 0.75);
        }
      `}</style>
    </>
  );
}
