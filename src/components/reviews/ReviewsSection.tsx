"use client";

import React from "react";
import Stars from "@/components/ui/Stars";
import { useReviews } from "@/components/reviews/useReviews";
import { clamp } from "@/lib/utils";
import { useAuth } from "@/components/auth/useAuth";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "2-digit" });
}

function avgRating(items: { rating: number }[]) {
  if (!items.length) return 0;
  const sum = items.reduce((acc, r) => acc + (Number.isFinite(r.rating) ? r.rating : 0), 0);
  return sum / items.length;
}

type PresignResp = { uploadUrl: string; publicUrl: string; key: string };

async function presignReviewImage(file: File): Promise<PresignResp> {
  const res = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: file.type,
      size: file.size,
      folder: "reviews",
    }),
  });

  if (!res.ok) {
    const j = await res.json().catch(() => null);
    throw new Error(j?.error ?? "Presign failed");
  }
  return (await res.json()) as PresignResp;
}

async function uploadToSignedUrl(uploadUrl: string, file: File) {
  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error("Upload failed");
}

type ExistingImageState =
  | { kind: "none" }
  | { kind: "existing"; url: string }
  | { kind: "removed" }; // user wants remove existing image

export default function ReviewsSection({ onRequireAuth }: { onRequireAuth: () => void }) {
  const { items, loading, error, refetch } = useReviews();
  const { isLoggedIn, user, refresh: refreshAuth, defaults, review } = useAuth();

  const [message, setMessage] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  // local upload (new image)
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  // existing image handling (from defaults/review)
  const [existingImage, setExistingImage] = React.useState<ExistingImageState>({ kind: "none" });

  // lightbox
  const [lightboxUrl, setLightboxUrl] = React.useState<string | null>(null);

  const count = items.length;
  const average = avgRating(items);

  // ✅ Prefill from /api/auth/me defaults
  React.useEffect(() => {
    if (!isLoggedIn) return;

    setRating(defaults?.rating ?? 5);
    setMessage(defaults?.message ?? "");

    const url = defaults?.imageUrl ?? null;
    if (url) setExistingImage({ kind: "existing", url });
    else setExistingImage({ kind: "none" });

    // reset local upload when auth defaults change
    setImageFile(null);
  }, [isLoggedIn, defaults?.rating, defaults?.message, defaults?.imageUrl]);

  // create preview for local file
  React.useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // lightbox escape close
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxUrl(null);
    }
    if (!lightboxUrl) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxUrl]);

  const hasReview = !!review?.id;

  function clearNewImage() {
    setImageFile(null);
  }

  function removeExistingImage() {
    setExistingImage({ kind: "removed" });
    // also clear any new image selection
    setImageFile(null);
  }

  function keepExistingImage() {
    if (defaults?.imageUrl) setExistingImage({ kind: "existing", url: defaults.imageUrl });
    else setExistingImage({ kind: "none" });
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setOkMsg(null);

    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }

    const m = message.trim();
    const r = clamp(Math.round(rating), 1, 5);

    if (!m || m.length > 500) {
      setFormError("Message invalide (1 à 500 caractères).");
      return;
    }

    setSubmitting(true);

    try {
      // Decide imageUrl payload:
      // - if user picked a new file => upload => use new publicUrl
      // - else if existing image is removed => send "" to trigger delete + null in DB
      // - else keep existing => send existing url OR null
      let imageUrlToSend: string | null | "" = null;

      if (imageFile) {
        const { uploadUrl, publicUrl } = await presignReviewImage(imageFile);
        await uploadToSignedUrl(uploadUrl, imageFile);
        imageUrlToSend = publicUrl;
      } else {
        if (existingImage.kind === "removed") imageUrlToSend = "";
        else if (existingImage.kind === "existing") imageUrlToSend = existingImage.url;
        else imageUrlToSend = null;
      }

      const payload = {
        rating: r,
        message: m,
        imageUrl: imageUrlToSend,
      };

      // ✅ POST if no review yet, else PUT
      const res = await fetch("/api/reviews", {
        method: hasReview ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? `HTTP ${res.status}`);
      }

      setOkMsg(hasReview ? "Avis mis à jour ✅" : "Avis ajouté ✅");

      // Refresh everything (auth defaults + list)
      await Promise.all([refreshAuth(), refetch()]);
    } catch (err: any) {
      const msg = err?.message ?? "Impossible d’envoyer l’avis.";
      if (String(msg).toLowerCase().includes("unauthorized") || String(msg).includes("401")) {
        await refreshAuth();
        onRequireAuth();
      } else {
        setFormError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="wrap" id="avis" aria-label="Avis">
      {lightboxUrl ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image de l’avis"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setLightboxUrl(null);
          }}
        >
          <button className="lightboxClose" onClick={() => setLightboxUrl(null)} aria-label="Fermer">
            ✕
          </button>
          <div className="lightboxInner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="lightboxImg" src={lightboxUrl} alt="Image de l’avis" />
          </div>
        </div>
      ) : null}

      <div className="head">
        <div className="titleBlock">
          <h2 className="h2">Avis</h2>
          <p className="sub">Connecte-toi pour publier un avis.</p>
        </div>

        <div className="summary">
          <div className="avg">
            <div className="avgNum">{count ? average.toFixed(1) : "—"}</div>
            <Stars rating={count ? average : 0} />
          </div>
          <div className="count">{count} avis</div>
        </div>
      </div>

      <div className="grid">
        <div className="listCard">
          <div className="listTop">
            <div className="listTitle">Derniers avis</div>
            <button className="miniBtn" onClick={refetch} disabled={loading} aria-label="Rafraîchir">
              Rafraîchir
            </button>
          </div>

          {loading ? (
            <div className="state">Chargement…</div>
          ) : error ? (
            <div className="state">
              <div className="err">Erreur: {error}</div>
              <button className="miniBtn" onClick={refetch}>
                Recharger
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="state">Aucun avis pour le moment. ✨</div>
          ) : (
            <div className="items" role="list">
              {items.slice(0, 100).map((r) => (
                <article key={r.id} className="item" role="listitem">
                  <div className="topRow">
                    <div className="who">
                      <div className="avatar" aria-hidden="true">
                        {String(r.name || "?").trim().slice(0, 1).toUpperCase()}
                      </div>
                      <div className="meta">
                        <div className="name">{r.name}</div>
                        <div className="date">{formatDate(r.createdAt)}</div>
                      </div>
                    </div>

                    <div className="rate">
                      <Stars rating={r.rating} />
                    </div>
                  </div>

                  <div className={`contentRow ${r.imageUrl ? "hasMedia" : ""}`}>
                    <p className="msg">{r.message}</p>

                    {r.imageUrl ? (
                      <button
                        type="button"
                        className="thumb"
                        onClick={() => setLightboxUrl(r.imageUrl!)}
                        aria-label="Ouvrir l’image"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="thumbImg" src={r.imageUrl} alt="" loading="lazy" />
                        <span className="thumbHint">Voir</span>
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="formCard">
          <div className="formTitle">{hasReview ? "Mettre à jour mon avis" : "Laisser un avis"}</div>

          {!isLoggedIn ? (
            <div className="locked">
              <div className="lockedTitle">Connexion requise</div>
              <div className="lockedSub">Pour publier un avis, connecte-toi ou crée un compte.</div>
              <button className="cta" onClick={onRequireAuth}>
                Connexion / Inscription
              </button>
            </div>
          ) : (
            <form onSubmit={submitReview} className="form">
              <div className="me">
                Connecté en tant que <b>{user?.name}</b>
              </div>

              <label className="field">
                <span>Note</span>
                <div className="ratingPicker" role="radiogroup" aria-label="Note">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const on = n <= rating;
                    return (
                      <button
                        key={n}
                        type="button"
                        className={`starBtn ${on ? "on" : ""}`}
                        onClick={() => setRating(n)}
                        aria-label={`${n} étoiles`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </label>

              <label className="field">
                <span>Message</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écris un petit mot…"
                  maxLength={500}
                  rows={5}
                  className="textarea"
                />
                <div className="hint">{message.trim().length}/500</div>
              </label>

              {/* ✅ Existing image row */}
              {existingImage.kind === "existing" && !imageFile ? (
                <div className="currentImage">
                  <div className="currentLeft">
                    <div className="currentTitle">Image actuelle</div>
                    <div className="currentSub">Tu peux la garder ou la retirer.</div>
                  </div>

                  <button
                    type="button"
                    className="currentThumb"
                    onClick={() => setLightboxUrl(existingImage.url)}
                    aria-label="Ouvrir l’image actuelle"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="currentThumbImg" src={existingImage.url} alt="" />
                  </button>

                  <div className="currentActions">
                    <button type="button" className="miniBtn" onClick={removeExistingImage}>
                      Retirer l’image
                    </button>
                  </div>
                </div>
              ) : null}

              {existingImage.kind === "removed" ? (
                <div className="removedBar">
                  <div className="removedText">Image actuelle supprimée (sera supprimée sur R2).</div>
                  <button type="button" className="miniBtn" onClick={keepExistingImage}>
                    Annuler
                  </button>
                </div>
              ) : null}

              {/* ✅ Upload new image */}
              <label className="field">
                <span>Image (optionnelle)</span>
                <div className="uploadRow">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setImageFile(f);
                      if (f) setExistingImage({ kind: "none" }); // when selecting new image, treat as replacement
                    }}
                  />
                  {imageFile ? (
                    <button type="button" className="miniBtn" onClick={clearNewImage}>
                      Retirer le fichier
                    </button>
                  ) : null}
                </div>

                {imagePreview ? (
                  <div className="preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} className="previewImg" alt="Prévisualisation" />
                  </div>
                ) : null}

                <div className="tiny">Formats: jpg/png/webp/gif — max 30MB.</div>
              </label>

              {formError ? <div className="alert err">{formError}</div> : null}
              {okMsg ? <div className="alert ok">{okMsg}</div> : null}

              <button className="cta" disabled={submitting}>
                {submitting ? "Envoi…" : hasReview ? "Mettre à jour" : "Publier l’avis"}
              </button>

              <div className="tiny">Un seul avis par compte. Tu peux le modifier quand tu veux.</div>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .wrap {
          margin-top: 16px;
        }

        .head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          margin: 18px 0 12px;
        }

        .h2 {
          margin: 0;
          font-size: 18px;
          letter-spacing: -0.02em;
          font-weight: 950;
        }

        .sub {
          margin: 6px 0 0;
          color: var(--muted);
          font-weight: 700;
          font-size: 13px;
        }

        .summary {
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.72);
          border-radius: 16px;
          padding: 10px 12px;
          box-shadow: var(--shadow);
          min-width: 180px;
          text-align: right;
        }

        .avg {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        .avgNum {
          font-weight: 950;
          font-size: 20px;
          letter-spacing: -0.02em;
        }

        .count {
          margin-top: 6px;
          color: var(--muted);
          font-weight: 800;
          font-size: 12px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 14px;
          align-items: start;
        }

        .listCard,
        .formCard {
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.82);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 14px;
        }

        .listTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .listTitle,
        .formTitle {
          font-weight: 950;
          letter-spacing: -0.02em;
        }

        .miniBtn {
          height: 34px;
          padding: 0 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.75);
          cursor: pointer;
          font-weight: 900;
          color: var(--text);
        }
        .miniBtn:hover {
          transform: translateY(-1px);
        }
        .miniBtn:disabled {
          opacity: 0.6;
          cursor: default;
          transform: none;
        }

        .state {
          border: 1px dashed var(--border);
          border-radius: 14px;
          padding: 12px;
          color: var(--muted);
          font-weight: 800;
          background: rgba(243, 231, 214, 0.35);
        }

        .err {
          color: #7a2a1f;
          font-weight: 900;
        }

        .items {
          display: grid;
          gap: 10px;
        }

        .item {
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 12px;
          background: rgba(243, 231, 214, 0.42);
        }

        .topRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .who {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-weight: 950;
          background: linear-gradient(
            180deg,
            rgba(168, 116, 74, 0.35),
            rgba(122, 78, 47, 0.22)
          );
          border: 1px solid var(--border);
          color: var(--text);
          flex: 0 0 auto;
        }

        .meta {
          min-width: 0;
        }

        .name {
          font-weight: 950;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .date {
          margin-top: 2px;
          font-size: 12px;
          color: var(--muted);
          font-weight: 800;
        }

        .contentRow {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          align-items: start;
        }
        .contentRow.hasMedia {
          grid-template-columns: 1fr 112px;
        }

        .msg {
          margin: 0;
          color: rgba(42, 27, 18, 0.86);
          font-weight: 700;
          line-height: 1.6;
          font-size: 14px;
          white-space: pre-wrap;
        }

        .thumb {
          position: relative;
          width: 112px;
          height: 84px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.6);
          cursor: pointer;
          padding: 0;
          display: block;
          box-shadow: 0 10px 22px rgba(2, 6, 23, 0.06);
        }
        .thumb:hover {
          transform: translateY(-1px);
          filter: brightness(1.02);
        }
        .thumb:focus-visible {
          outline: none;
          box-shadow: 0 0 0 4px rgba(122, 78, 47, 0.16);
        }

        .thumbImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .thumbHint {
          position: absolute;
          right: 8px;
          bottom: 8px;
          padding: 6px 8px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 950;
          color: var(--text);
          border: 1px solid rgba(15, 23, 42, 0.10);
          background: rgba(255, 250, 242, 0.85);
          backdrop-filter: blur(6px);
        }

        /* Current image block (form) */
        .currentImage {
          display: grid;
          grid-template-columns: 1fr 120px auto;
          gap: 10px;
          align-items: center;
          border: 1px solid var(--border);
          background: rgba(243, 231, 214, 0.35);
          border-radius: 16px;
          padding: 10px;
        }

        .currentTitle {
          font-weight: 950;
          letter-spacing: -0.01em;
        }

        .currentSub {
          color: var(--muted);
          font-weight: 800;
          font-size: 12px;
          margin-top: 2px;
          line-height: 1.4;
        }

        .currentThumb {
          width: 120px;
          height: 84px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.7);
          padding: 0;
          cursor: pointer;
        }

        .currentThumbImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .currentActions {
          display: flex;
          justify-content: flex-end;
        }

        .removedBar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border: 1px dashed var(--border);
          background: rgba(243, 231, 214, 0.25);
          border-radius: 16px;
          padding: 10px;
        }

        .removedText {
          color: var(--muted);
          font-weight: 850;
          font-size: 12px;
        }

        /* Lightbox */
        .lightbox {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(10, 10, 10, 0.55);
          backdrop-filter: blur(8px);
          display: grid;
          place-items: center;
          padding: 18px;
        }

        .lightboxInner {
          width: min(980px, 96vw);
          max-height: 86vh;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 250, 242, 0.85);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
        }

        .lightboxImg {
          width: 100%;
          height: auto;
          max-height: 86vh;
          object-fit: contain;
          display: block;
          background: rgba(0, 0, 0, 0.06);
        }

        .lightboxClose {
          position: fixed;
          top: 14px;
          right: 14px;
          z-index: 61;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 250, 242, 0.86);
          cursor: pointer;
          font-weight: 950;
        }
        .lightboxClose:hover {
          transform: translateY(-1px);
        }

        .locked {
          border: 1px dashed var(--border);
          border-radius: 16px;
          background: rgba(243, 231, 214, 0.35);
          padding: 12px;
          display: grid;
          gap: 10px;
        }
        .lockedTitle {
          font-weight: 950;
        }
        .lockedSub {
          color: var(--muted);
          font-weight: 700;
          font-size: 13px;
          line-height: 1.5;
        }

        .me {
          color: var(--muted);
          font-weight: 800;
          font-size: 13px;
        }

        .form {
          display: grid;
          gap: 10px;
          margin-top: 10px;
        }

        .field {
          display: grid;
          gap: 6px;
        }

        .field span {
          font-size: 12px;
          font-weight: 900;
          color: var(--muted);
        }

        .textarea {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 10px 12px;
          background: rgba(255, 250, 242, 0.85);
          color: var(--text);
          outline: none;
          font-weight: 800;
          resize: vertical;
          min-height: 120px;
        }

        .textarea:focus {
          border-color: rgba(122, 78, 47, 0.35);
          box-shadow: 0 0 0 4px rgba(122, 78, 47, 0.1);
        }

        .hint {
          text-align: right;
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
        }

        .ratingPicker {
          display: inline-flex;
          gap: 6px;
          padding: 6px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: rgba(243, 231, 214, 0.45);
          width: fit-content;
        }

        .starBtn {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          color: rgba(42, 27, 18, 0.25);
          font-weight: 900;
        }

        .starBtn.on {
          color: rgba(122, 78, 47, 0.95);
          background: rgba(255, 250, 242, 0.8);
          border-color: var(--border);
        }

        .uploadRow {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: space-between;
        }

        .preview {
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          background: rgba(255, 250, 242, 0.8);
        }

        .previewImg {
          width: 100%;
          display: block;
          height: auto;
        }

        .alert {
          border-radius: 14px;
          padding: 10px 12px;
          border: 1px solid var(--border);
          font-weight: 900;
          font-size: 13px;
        }

        .alert.err {
          background: rgba(255, 235, 235, 0.7);
          color: #7a2a1f;
          border-color: rgba(122, 42, 31, 0.2);
        }

        .alert.ok {
          background: rgba(235, 255, 245, 0.7);
          color: #14532d;
          border-color: rgba(20, 83, 45, 0.2);
        }

        .cta {
          height: 46px;
          border-radius: 16px;
          border: 1px solid rgba(42, 27, 18, 0.08);
          cursor: pointer;
          background: linear-gradient(180deg, var(--accent-2), var(--accent));
          color: var(--accent-contrast);
          font-weight: 950;
          letter-spacing: -0.01em;
          box-shadow: 0 14px 26px rgba(122, 78, 47, 0.18);
        }
        .cta:hover {
          transform: translateY(-1px);
          filter: brightness(1.03);
        }
        .cta:disabled {
          opacity: 0.7;
          cursor: default;
          transform: none;
        }

        .tiny {
          color: var(--muted);
          font-size: 12px;
          font-weight: 800;
          line-height: 1.5;
        }

        @media (max-width: 900px) {
          .head {
            align-items: flex-start;
            flex-direction: column;
          }
          .summary {
            text-align: left;
            width: 100%;
          }
          .avg {
            justify-content: flex-start;
          }
          .grid {
            grid-template-columns: 1fr;
          }

          .contentRow.hasMedia {
            grid-template-columns: 1fr;
          }

          .thumb {
            width: 100%;
            height: 180px;
          }

          .currentImage {
            grid-template-columns: 1fr;
          }

          .currentThumb {
            width: 100%;
            height: 180px;
          }

          .currentActions {
            justify-content: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
