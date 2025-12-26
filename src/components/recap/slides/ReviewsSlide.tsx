"use client";

import React from "react";
import type { SlideProps } from "./SlideRenderer";
import { clamp, formatDate, stars } from "../lib/utils";

export function ReviewsSlide({ reviews, latestReviews }: SlideProps) {
  return (
    <div className="stack">
      <div className="kicker">Avis</div>
      <div className="title">Ce qu’ils en pensent</div>
      <div className="subtitle">{reviews.length ? "Top 3 avis récents" : "Pas encore d’avis."}</div>

      {reviews.length ? (
        <div className="reviews">
          {latestReviews.slice(0, 3).map((r) => (
            <div key={r.id} className="rCard">
              <div className="rTop">
                <div className="rWho">
                  <span className="rAvatar">{(r.name || "?").slice(0, 1).toUpperCase()}</span>
                  <div className="rTxt">
                    <div className="rName">{r.name || "Anonyme"}</div>
                    <div className="rDate">{formatDate(r.createdAt)}</div>
                  </div>
                </div>

                <div className="rRate">
                  <span className="rStars">{stars(r.rating).slice(0, 5)}</span>
                  <span className="rNum">{clamp(r.rating, 0, 5)}/5</span>
                </div>
              </div>

              {r.message ? <div className="rMsg">“{r.message}”</div> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default ReviewsSlide;
