export default function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="stars" aria-label={`Note ${rating} sur 5`}>
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f-${i}`} className="star full">
          ★
        </span>
      ))}
      {half && (
        <span className="star half" aria-hidden="true">
          ★
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e-${i}`} className="star">
          ★
        </span>
      ))}

      <style jsx>{`
        .stars {
          display: inline-flex;
          gap: 2px;
          line-height: 1;
          transform: translateY(1px);
        }
        .star {
          font-size: 14px;
          color: rgba(42, 27, 18, 0.22);
        }
        .star.full {
          color: rgba(122, 78, 47, 0.92);
        }
        .star.half {
          color: rgba(122, 78, 47, 0.55);
        }
      `}</style>
    </div>
  );
}
