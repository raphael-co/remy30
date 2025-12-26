"use client";

import React from "react";
import type { Product, Review, Slide } from "../types";

import { IntroSlide } from "./IntroSlide";
import { ProductSlide } from "./ProductSlide";
import { StatsSlide } from "./StatsSlide";
import { GallerySlide } from "./GallerySlide";
import { ReviewsSlide } from "./ReviewsSlide";
import { OutroSlide } from "./OutroSlide";

export type SlideProps = {
  slide: Slide;
  product: Product | null;
  reviews: Review[];
  latestReviews: Review[];
  avg: number;
  gallery: string[];
  onOpenLightbox: (i: number) => void;
  onReplay: () => void;
  onClose: () => void;
};

export function SlideRenderer(props: SlideProps) {
  const { slide } = props;

  switch (slide.type) {
    case "intro":
      return <IntroSlide {...props} />;
    case "product":
      return <ProductSlide {...props} />;
    case "stats":
      return <StatsSlide {...props} />;
    case "gallery":
      return <GallerySlide {...props} />;
    case "reviews":
      return <ReviewsSlide {...props} />;
    case "outro":
      return <OutroSlide {...props} />;
  }
}

export default SlideRenderer;
