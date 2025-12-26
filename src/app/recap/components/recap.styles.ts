export const recapCss = `
:global(html.recap-open),
:global(body.recap-open) {
  overflow: hidden;
  height: 100%;
}

.recap {
  position: fixed;
  inset: 0;
  z-index: 70;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 22px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.frame {
  width: min(980px, 100%);
  height: min(760px, 100%);
  max-height: calc(100vh - 44px);

  border-radius: 26px;
  overflow: hidden;

  background: #0b0b0c;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);

  display: flex;
  flex-direction: column;
  position: relative;
}

/* ===== HUD TOP ===== */
.hudTop {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 20;
  padding: 14px 14px 10px;
  pointer-events: none;
}

.hudRow {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  pointer-events: none;
}

.hudLeft {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  pointer-events: none;
}

.badge {
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.92);
  font-weight: 900;
  letter-spacing: -0.02em;
}

.hint {
  pointer-events: none;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.62);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hudRight {
  display: flex;
  gap: 10px;
  pointer-events: none;
}

.hudBtn {
  pointer-events: auto;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.hudBtn:hover {
  background: rgba(0, 0, 0, 0.38);
}

.hudBtn:active {
  transform: translateY(1px);
}

/* ===== STAGE ===== */
.stage {
  position: relative;
  flex: 1;
  min-height: 0;
}

.slide {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* ===== CONTENT ===== */
/* ✅ Fix: le contenu doit remplir la slide pour les slides "plein écran" */
.content {
  position: relative;
  z-index: 2;

  width: 100%;
  height: 100%;
  min-height: 0;

  display: block;
  max-width: none;
}

/* Pour les slides non full-screen, on garde un "cadre" dans les composants eux-mêmes */
.center {
  display: grid;
  justify-items: start;
  align-content: center;
  gap: 10px;
  max-width: min(900px, 100%);
}

.stack {
  display: grid;
  align-content: end;
  gap: 12px;
  max-width: min(980px, 100%);
}

/* ===== TYPO ===== */
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}

.title {
  font-size: clamp(34px, 5.2vw, 70px);
  line-height: 1.02;
  font-weight: 1000;
  letter-spacing: -0.04em;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.subtitle {
  font-size: 15px;
  line-height: 1.45;
  max-width: 900px;
  color: rgba(255, 255, 255, 0.72);
}

.big {
  font-size: 22px;
  font-weight: 900;
}

.small {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.72);
}

/* ===== CTA / CHIPS ===== */
.cta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 900;
  font-size: 13px;
}

/* ===== ROW / PILLS ===== */
.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.18);
  color: rgba(255, 255, 255, 0.92);
  font-weight: 900;
  font-size: 13px;
}

/* ===== STATS CARDS ===== */
.cards {
  margin-top: 6px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.card {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.22);
  padding: 16px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
}

.cardTop {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.74);
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cardVal {
  margin-top: 12px;
  font-size: 38px;
  font-weight: 1000;
  letter-spacing: -0.04em;
  color: rgba(255, 255, 255, 0.96);
}

.cardSub {
  margin-top: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

/* ===== REVIEWS ===== */
.reviews {
  margin-top: 10px;
  display: grid;
  gap: 14px;
  max-width: 980px;
}

.rCard {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.22);
  padding: 16px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
}

.rTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.rWho {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.rAvatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 1000;
  background: rgba(255, 255, 255, 0.92);
  color: rgba(0, 0, 0, 0.9);
}

.rTxt {
  min-width: 0;
}

.rName {
  font-weight: 900;
  letter-spacing: -0.02em;
  color: rgba(255, 255, 255, 0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 520px;
}

.rDate {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.62);
}

.rRate {
  display: grid;
  justify-items: end;
  gap: 2px;
}

.rStars {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.92);
}

.rNum {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.62);
}

.rMsg {
  margin-top: 10px;
  font-size: 15px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.78);
}

/* ===== HUD BOTTOM ===== */
.hudBottom {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 14px;
  z-index: 3;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  pointer-events: none;
}

.nav {
  pointer-events: auto;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(0, 0, 0, 0.22);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.nav:hover {
  background: rgba(0, 0, 0, 0.36);
}

.nav:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.counter {
  pointer-events: none;
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.85);
  font-weight: 1000;
  font-size: 13px;
}

/* ===== ACTIONS ===== */
.action {
  height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.92);
  color: rgba(0, 0, 0, 0.9);
  font-weight: 900;
  cursor: pointer;
}

.action:hover {
  background: rgba(255, 255, 255, 1);
}

.action.ghost {
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.92);
}

.action.ghost:hover {
  background: rgba(0, 0, 0, 0.36);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 980px) {
  .hint { display: none; }
  .cards { grid-template-columns: 1fr; }
}

/* ===== MOBILE: FULLSCREEN + SAFE AREAS ===== */
@media (max-width: 640px) {
  .recap {
    padding: 0;
    background: #000;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .frame {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    box-shadow: none;
  }

  .hudTop {
    padding-top: calc(10px + env(safe-area-inset-top));
    padding-left: calc(12px + env(safe-area-inset-left));
    padding-right: calc(12px + env(safe-area-inset-right));
    padding-bottom: 10px;
  }

  .hudBottom {
    left: 12px;
    right: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom));
  }

  .hudBtn,
  .nav {
    width: 44px;
    height: 44px;
  }

  .badge {
    font-size: 13px;
    padding: 7px 10px;
  }

  .counter {
    min-width: 54px;
    padding: 9px 10px;
    font-size: 13px;
  }
}
`;
