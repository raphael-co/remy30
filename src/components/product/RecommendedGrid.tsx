import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export default function RecommendedGrid() {
  const items = [
    {
      title: "Accessoire minimal",
      price: 19.9,
      img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Produit complémentaire",
      price: 29.9,
      img: "https://images.unsplash.com/photo-1518441902117-f0a6f14b0a25?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Version premium",
      price: 79.9,
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <section className="rec">
      <h2 className="h2">Recommandés</h2>

      <div className="grid">
        {items.map((x) => (
          <a key={x.title} className="card" href="#">
            <div className="thumb">
              <Image src={x.img} alt={x.title} fill sizes="(max-width: 900px) 100vw, 320px" style={{ objectFit: "cover" }} />
            </div>
            <div className="meta">
              <div className="t">{x.title}</div>
              <div className="p">{formatPrice(x.price, "EUR")}</div>
            </div>
          </a>
        ))}
      </div>

      <style jsx>{`
        .rec { margin-top: 22px; }
        .h2 { font-size: 16px; letter-spacing: -0.01em; margin: 0 0 12px; color: var(--text); }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .card {
          text-decoration: none;
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.85);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: transform 140ms ease, border-color 140ms ease;
        }
        .card:hover { transform: translateY(-2px); border-color: var(--border-2); }

        .thumb { position: relative; aspect-ratio: 4 / 3; background: rgba(42, 27, 18, 0.04); }

        .meta { padding: 10px 12px 12px; display: grid; gap: 6px; }
        .t { color: var(--text); font-weight: 900; font-size: 14px; }
        .p { color: var(--muted); font-size: 13px; font-weight: 700; }

        @media (max-width: 900px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
