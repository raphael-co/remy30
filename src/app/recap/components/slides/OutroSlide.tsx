"use client";

import React from "react";
import { motion } from "framer-motion";
import type { SlideProps } from "./SlideRenderer";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const CONFETTI_COLORS = [
  "rgba(255, 99, 132, 0.98)",
  "rgba(54, 162, 235, 0.98)",
  "rgba(255, 206, 86, 0.98)",
  "rgba(75, 192, 192, 0.98)",
  "rgba(153, 102, 255, 0.98)",
  "rgba(255, 159, 64, 0.98)",
  "rgba(240, 240, 255, 0.98)",
  "rgba(255, 220, 160, 0.98)",
  "rgba(200, 235, 255, 0.98)",
  "rgba(220, 210, 255, 0.98)",
  "rgba(255, 120, 205, 0.98)",
  "rgba(140, 255, 204, 0.98)",
];

const EMOJIS = ["🥳", "🎂", "🎈", "🍾", "💫", "✨", "🎁", "🎊", "🎉", "🪩", "🍰", "🕺", "🫶", "🌟"];

// ⚠️ 250/250 ça fait très lourd si tu empiles des waves.
// Mets plutôt 120/90 ou 160/120 si tu veux pouvoir recliquer plusieurs fois.
const CONFETTI_COUNT = 160;
const EMOJI_COUNT = 120;

// durée max (en ms) avant de supprimer une wave
const WAVE_TTL_MS = 7200;

type ConfettiPiece = {
  id: string;
  leftPct: number;
  size: number;
  delay: number;
  dur: number;
  drift: number;
  rot: number;
  spin: number;
  wobble: number;
  shape: "sq" | "pill" | "tri";
  opacity: number;
  color: string;
};

function makeConfettiPool(count: number): ConfettiPiece[] {
  const out: ConfettiPiece[] = [];
  const base = `${Date.now().toString(16)}-c-${Math.random().toString(16).slice(2)}`;
  for (let i = 0; i < count; i++) {
    const size = rand(6, 16);
    out.push({
      id: `${base}-${i}`,
      leftPct: rand(0, 100),
      size,
      delay: rand(0, 0.9),
      dur: rand(2.6, 6.0),
      drift: rand(-70, 70),
      rot: rand(-180, 180),
      spin: rand(-820, 820),
      wobble: rand(8, 22),
      shape: Math.random() > 0.72 ? "pill" : Math.random() > 0.45 ? "sq" : "tri",
      opacity: rand(0.65, 1),
      color: pick(CONFETTI_COLORS),
    });
  }
  return out;
}

type EmojiRain = {
  id: string;
  emoji: string;
  leftPct: number;
  size: number;
  delay: number;
  dur: number;
  drift: number;
  wobble: number;
  rot: number;
  spin: number;
  opacity: number;
};

function makeEmojiPool(count: number): EmojiRain[] {
  const out: EmojiRain[] = [];
  const base = `${Date.now().toString(16)}-e-${Math.random().toString(16).slice(2)}`;
  for (let i = 0; i < count; i++) {
    const size = rand(18, 42);
    out.push({
      id: `${base}-${i}`,
      emoji: pick(EMOJIS),
      leftPct: rand(0, 100),
      size,
      delay: rand(0, 0.9),
      dur: rand(2.8, 6.0),
      drift: rand(-90, 90),
      wobble: rand(10, 26),
      rot: rand(-20, 20),
      spin: rand(-220, 220),
      opacity: rand(0.55, 0.95),
    });
  }
  return out;
}

type BurstConfetti = {
  id: string;
  kind: "confetti";
  shape: "sq" | "pill" | "tri";
  size: number;
  color: string;
  opacity: number;
  dur: number;
  delay: number;
  rot: number;
  spin: number;
  dx: number;
  dy: number;
};

type BurstEmoji = {
  id: string;
  kind: "emoji";
  emoji: string;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
  rot: number;
  spin: number;
  dx: number;
  dy: number;
};

type Burst = {
  id: string;
  x: number;
  y: number;
  confetti: BurstConfetti[];
  emojis: BurstEmoji[];
  ttlMs: number;
};

function makeBurst(x: number, y: number): Burst {
  const id = `${Date.now().toString(16)}-b-${Math.random().toString(16).slice(2)}`;

  const confettiCount = 40;
  const emojiCount = 14;

  const mkVector = () => {
    const angle = rand(-Math.PI * 0.85, -Math.PI * 0.15);
    const speed = rand(420, 900);
    return { dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed };
  };

  const confetti: BurstConfetti[] = Array.from({ length: confettiCount }).map((_, i) => {
    const { dx, dy } = mkVector();
    const shape: "sq" | "pill" | "tri" = Math.random() > 0.74 ? "pill" : Math.random() > 0.45 ? "sq" : "tri";
    const size = rand(7, 16);
    return {
      id: `${id}-c-${i}`,
      kind: "confetti",
      shape,
      size,
      color: pick(CONFETTI_COLORS),
      opacity: rand(0.72, 1),
      dur: rand(0.9, 1.55),
      delay: rand(0, 0.06),
      rot: rand(-180, 180),
      spin: rand(-820, 820),
      dx,
      dy,
    };
  });

  const emojis: BurstEmoji[] = Array.from({ length: emojiCount }).map((_, i) => {
    const { dx, dy } = mkVector();
    return {
      id: `${id}-e-${i}`,
      kind: "emoji",
      emoji: pick(EMOJIS),
      size: rand(18, 34),
      opacity: rand(0.7, 0.98),
      dur: rand(1.0, 1.75),
      delay: rand(0, 0.08),
      rot: rand(-18, 18),
      spin: rand(-200, 200),
      dx: dx * rand(0.72, 0.92),
      dy: dy * rand(0.72, 0.92),
    };
  });

  return { id, x, y, confetti, emojis, ttlMs: 2000 };
}

type Wave = { id: string };

export function OutroSlide({ onReplay, onClose }: SlideProps) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  // pool stable
  const confettiPoolRef = React.useRef<ConfettiPiece[] | null>(null);
  const emojiPoolRef = React.useRef<EmojiRain[] | null>(null);
  if (!confettiPoolRef.current) confettiPoolRef.current = makeConfettiPool(CONFETTI_COUNT);
  if (!emojiPoolRef.current) emojiPoolRef.current = makeEmojiPool(EMOJI_COUNT);

  const confetti = confettiPoolRef.current!;
  const emojiRain = emojiPoolRef.current!;

  // waves empilées (pas de "key" global, donc pas d'annulation)
  const [waves, setWaves] = React.useState<Wave[]>([]);
  const [bursts, setBursts] = React.useState<Burst[]>([]);

  // wave au mount
  React.useEffect(() => {
    const id = `${Date.now().toString(16)}-w-${Math.random().toString(16).slice(2)}`;
    setWaves([{ id }]);
    const t = window.setTimeout(() => {
      setWaves((prev) => prev.filter((w) => w.id !== id));
    }, WAVE_TTL_MS);
    return () => window.clearTimeout(t);
  }, []);

  const relaunchWave = React.useCallback(() => {
    const id = `${Date.now().toString(16)}-w-${Math.random().toString(16).slice(2)}`;
    setWaves((prev) => [...prev, { id }]);

    window.setTimeout(() => {
      setWaves((prev) => prev.filter((w) => w.id !== id));
    }, WAVE_TTL_MS);
  }, []);

  const replay = () => {
    relaunchWave();
    onReplay();
  };

  const popAtClientPoint = React.useCallback(
    (clientX: number, clientY: number) => {
      const el = wrapRef.current;
      if (!el) return;

      const r = el.getBoundingClientRect();
      const x = Math.max(12, Math.min(r.width - 12, clientX - r.left));
      const y = Math.max(12, Math.min(r.height - 12, clientY - r.top));

      const burst = makeBurst(x, y);
      setBursts((prev) => [...prev, burst]);

      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burst.id));
      }, burst.ttlMs);

      // relance wave en PLUS, sans annuler les précédentes
      relaunchWave();
    },
    [relaunchWave]
  );

  const onPartyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    popAtClientPoint(e.clientX, e.clientY);
  };

  const onPartyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    popAtClientPoint(r.left + r.width * 0.5, r.top + r.height * 0.35);
  };

  return (
    <div className="wrap" ref={wrapRef}>
      {/* WAVES (empilées) */}
      {waves.map((w) => (
        <React.Fragment key={w.id}>
          <div className="confetti" aria-hidden="true">
            {confetti.map((c) => {
              const triBorder = c.shape === "tri" ? c.color : undefined;
              return (
                <motion.span
                  key={`${w.id}-${c.id}`}
                  className={`piece ${c.shape}`}
                  style={{
                    left: `${c.leftPct}%`,
                    width: c.shape === "tri" ? 0 : `${c.size}px`,
                    height: c.shape === "tri" ? 0 : `${c.shape === "pill" ? c.size * 0.55 : c.size}px`,
                    opacity: c.opacity,
                    background: c.shape === "tri" ? "transparent" : c.color,
                    borderBottomColor: triBorder,
                  }}
                  initial={{ y: -70, x: 0, rotate: c.rot, scale: 0.95 }}
                  animate={{
                    y: "112vh",
                    x: [0, c.wobble, -c.wobble, c.wobble * 0.6, 0].map((v) => v + c.drift),
                    rotate: c.rot + c.spin,
                    scale: 1,
                  }}
                  transition={{ delay: c.delay, duration: c.dur, ease: "easeIn", type: "tween" }}
                />
              );
            })}
          </div>

          <div className="confetti" aria-hidden="true">
            {emojiRain.map((e) => (
              <motion.span
                key={`${w.id}-${e.id}`}
                className="absolute select-none will-change-transform [text-shadow:0_18px_60px_rgba(0,0,0,0.35)]"
                style={{
                  left: `${e.leftPct}%`,
                  top: 0,
                  fontSize: `${e.size}px`,
                  opacity: e.opacity,
                }}
                initial={{ y: -120, x: 0, rotate: e.rot, scale: 0.95 }}
                animate={{
                  y: "120vh",
                  x: [0, e.wobble, -e.wobble, e.wobble * 0.6, 0].map((v) => v + e.drift),
                  rotate: e.rot + e.spin,
                  scale: 1,
                }}
                transition={{ delay: e.delay, duration: e.dur, ease: "easeIn", type: "tween" }}
              >
                {e.emoji}
              </motion.span>
            ))}
          </div>
        </React.Fragment>
      ))}

      {/* bursts */}
      <div className="burstLayer" aria-hidden="true">
        {bursts.map((b) => (
          <React.Fragment key={b.id}>
            {b.confetti.map((p) => {
              const triBorder = p.shape === "tri" ? p.color : undefined;
              const gravity = rand(300, 520);
              const yKF = [0, p.dy, p.dy + gravity];
              return (
                <motion.span
                  key={p.id}
                  className={`burstPiece ${p.shape}`}
                  style={{
                    left: b.x,
                    top: b.y,
                    width: p.shape === "tri" ? 0 : `${p.size}px`,
                    height: p.shape === "tri" ? 0 : `${p.shape === "pill" ? p.size * 0.55 : p.size}px`,
                    opacity: p.opacity,
                    background: p.shape === "tri" ? "transparent" : p.color,
                    borderBottomColor: triBorder,
                  }}
                  initial={{ x: 0, y: 0, rotate: p.rot, scale: 0.95 }}
                  animate={{
                    x: [0, p.dx],
                    y: yKF,
                    rotate: p.rot + p.spin,
                    scale: [0.95, 1, 0.98],
                    opacity: [p.opacity, p.opacity, 0],
                  }}
                  transition={{
                    delay: p.delay,
                    duration: p.dur,
                    ease: "easeOut",
                    times: [0, 0.6, 1],
                    type: "tween",
                  }}
                />
              );
            })}

            {b.emojis.map((p) => {
              const gravity = rand(260, 440);
              const yKF = [0, p.dy, p.dy + gravity];
              return (
                <motion.span
                  key={p.id}
                  className="burstEmoji"
                  style={{
                    left: b.x,
                    top: b.y,
                    fontSize: `${p.size}px`,
                    opacity: p.opacity,
                  }}
                  initial={{ x: 0, y: 0, rotate: p.rot, scale: 0.95 }}
                  animate={{
                    x: [0, p.dx],
                    y: yKF,
                    rotate: p.rot + p.spin,
                    scale: [0.95, 1.06, 1],
                    opacity: [p.opacity, p.opacity, 0],
                  }}
                  transition={{
                    delay: p.delay,
                    duration: p.dur,
                    ease: "easeOut",
                    times: [0, 0.6, 1],
                    type: "tween",
                  }}
                >
                  {p.emoji}
                </motion.span>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* glow */}
      <div className="glow" aria-hidden="true" />
      <div className="glow2" aria-hidden="true" />

      <motion.div
        className="center"
        initial={{ opacity: 0, y: 14, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", type: "tween" }}
      >
        <motion.div
          className="kicker"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05, type: "tween" }}
        >
          Fin
        </motion.div>

        <motion.h2
          className="title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.08, type: "tween" }}
        >
          Joyeux anniversaire à toi <span className="name">Rémy</span>{" "}
          <motion.span
            className="partyPop"
            role="button"
            tabIndex={0}
            aria-label="Relancer confettis"
            onClick={onPartyClick}
            onKeyDown={onPartyKeyDown}
            whileHover={{ scale: 1.08, rotate: 2 }}
            whileTap={{ scale: 0.92, rotate: -6 }}
            transition={{ type: "spring", stiffness: 520, damping: 22 }}
          >
            🎉
          </motion.span>
        </motion.h2>

        <motion.p
          className="subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.12, type: "tween" }}
        >
          On te souhaite une année pleine de moments incroyables, de rires, de belles surprises…
          <br />
          Et surtout, profite à fond de tes <span className="age">30 ans</span> ✨
        </motion.p>

        <motion.div
          className="cta"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.2, type: "tween" }}
        >
          <button className="action primary" onClick={replay} type="button">
            Rejouer
          </button>
          <button className="action ghost" onClick={onClose} type="button">
            Fermer
          </button>
        </motion.div>

        <div className="hint">Astuce: maintiens appuyé pour mettre en pause sur les autres slides.</div>
      </motion.div>

      <style jsx>{`
        .wrap {
          position: relative;
          height: 100%;
          width: 100%;
          display: grid;
          place-items: center;
          padding: clamp(16px, 3vw, 44px);
          text-align: center;
          overflow: hidden;
        }

        .confetti,
        .burstLayer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          contain: layout paint style;
          transform: translateZ(0);
        }

        .confetti {
          z-index: 6;
        }

        .piece {
          position: absolute;
          top: 0;
          border-radius: 4px;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
          mix-blend-mode: screen;
          filter: saturate(1.12) contrast(1.05);
          will-change: transform, opacity;
        }

        .piece.pill {
          border-radius: 999px;
        }

        .piece.tri {
          width: 0 !important;
          height: 0 !important;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 14px solid rgba(255, 255, 255, 0.95);
          background: transparent !important;
          box-shadow: none;
          filter: none;
        }

        .burstLayer {
          z-index: 9;
        }

        .burstPiece {
          position: absolute;
          transform: translate(-50%, -50%);
          border-radius: 4px;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.26);
          mix-blend-mode: screen;
          filter: saturate(1.15) contrast(1.06);
          will-change: transform, opacity;
        }

        .burstPiece.pill {
          border-radius: 999px;
        }

        .burstPiece.tri {
          width: 0 !important;
          height: 0 !important;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 14px solid rgba(255, 255, 255, 0.95);
          background: transparent !important;
          box-shadow: none;
          filter: none;
        }

        .burstEmoji {
          position: absolute;
          transform: translate(-50%, -50%);
          user-select: none;
          text-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
          will-change: transform, opacity;
        }

        .glow {
          position: absolute;
          inset: -120px;
          background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.16), transparent 55%);
          z-index: 1;
          pointer-events: none;
        }
        .glow2 {
          position: absolute;
          inset: -160px;
          background: radial-gradient(circle at 75% 65%, rgba(255, 255, 255, 0.12), transparent 60%);
          z-index: 1;
          pointer-events: none;
        }

        .center {
          position: relative;
          z-index: 10;
          width: min(760px, 100%);
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.26);
          backdrop-filter: blur(14px);
          box-shadow: 0 40px 130px rgba(0, 0, 0, 0.45);
          padding: clamp(16px, 3vw, 26px);
          display: grid;
          gap: 12px;
        }

        .kicker {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.82);
        }

        .title {
          font-size: clamp(24px, 3.2vw, 38px);
          font-weight: 1000;
          letter-spacing: -0.03em;
          line-height: 1.08;
          margin: 0;
        }

        .partyPop {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 999px;
          padding: 2px 8px;
          margin-left: 2px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 16px 60px rgba(0, 0, 0, 0.22);
          outline: none;
        }
        .partyPop:focus-visible {
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25), 0 16px 60px rgba(0, 0, 0, 0.22);
        }

        .name {
          display: inline-block;
          padding: 0 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.08);
        }

        .subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.84);
          line-height: 1.55;
          margin: 0;
        }

        .age {
          font-weight: 1000;
          color: rgba(255, 255, 255, 0.96);
        }

        .cta {
          margin-top: 8px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .action {
          padding: 12px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          font-weight: 950;
          cursor: pointer;
          min-width: 132px;
          transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }

        .action:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.16);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.28);
        }

        .action:active {
          transform: translateY(0px) scale(0.995);
        }

        .primary {
          background: rgba(255, 255, 255, 0.16);
        }

        .ghost {
          background: rgba(0, 0, 0, 0.22);
        }

        .hint {
          margin-top: 8px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
        }

        @media (max-width: 520px) {
          .center {
            border-radius: 24px;
          }
          .action {
            width: 100%;
            min-width: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .confetti,
          .burstLayer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default OutroSlide;
