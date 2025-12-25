import { clamp } from "@/lib/utils";

export default function Quantity({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const min = 0;
  const max = 1;

  return (
    <div className="qty" aria-label="Quantité">
      <button
        className="btn"
        onClick={() => onChange(clamp(value - 1, min, max))}
        aria-label="Diminuer"
        disabled={value <= min}
      >
        −
      </button>

      <div className="val">{value}</div>

      <button
        className="btn"
        onClick={() => onChange(clamp(value + 1, min, max))}
        aria-label="Augmenter"
        disabled={value >= max}
      >
        +
      </button>

      <style jsx>{`
        .qty {
          display: grid;
          grid-template-columns: 40px 48px 40px;
          align-items: center;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.75);
          border-radius: 16px;
          overflow: hidden;
          height: 46px;
        }
        .btn {
          height: 46px;
          border: 0;
          background: transparent;
          cursor: pointer;
          color: var(--text);
          font-size: 18px;
          font-weight: 900;
        }
        .btn:hover {
          background: rgba(122, 78, 47, 0.10);
        }
        .btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .btn:disabled:hover {
          background: transparent;
        }
        .val {
          text-align: center;
          font-weight: 900;
          color: var(--text);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
