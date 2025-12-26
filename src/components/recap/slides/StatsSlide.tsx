"use client";

import React from "react";
import type { SlideProps } from "./SlideRenderer";
import { Icon } from "../components/Icon";
import { stars, formatDate } from "../lib/utils";

export function StatsSlide({ reviews, latestReviews, avg, gallery }: SlideProps) {
  return (
    <div className="stack">
      <div className="kicker">Stats</div>

      <div className="cards">
        <div className="card">
          <div className="cardTop">
            <Icon name="star" size={18} />
            Note moyenne
          </div>
          <div className="cardVal">{reviews.length ? avg.toFixed(1) : "—"}</div>
          <div className="cardSub">{reviews.length ? stars(avg).slice(0, 5) : "Aucun avis"}</div>
        </div>

        <div className="card">
          <div className="cardTop">
            <Icon name="photo" size={18} />
            Galerie
          </div>
          <div className="cardVal">{gallery.length || "—"}</div>
          <div className="cardSub">{gallery.length ? "images" : "vide"}</div>
        </div>

        <div className="card">
          <div className="cardTop">
            <Icon name="quote" size={18} />
            Dernier avis
          </div>
          <div className="cardVal">{latestReviews[0]?.name ? latestReviews[0].name : "—"}</div>
          <div className="cardSub">
            {latestReviews[0]?.createdAt ? formatDate(latestReviews[0].createdAt) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsSlide;
