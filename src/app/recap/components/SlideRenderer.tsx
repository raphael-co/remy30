"use client";

import React from "react";
import { Product, Review, Slide } from "../types";
import IntroSlide from "./slides/IntroSlide";
import ProductSlide from "./slides/ProductSlide";
import StatsSlide from "./slides/StatsSlide";
import GallerySlide from "./slides/GallerySlide";
import ReviewsSlide from "./slides/ReviewsSlide";
import OutroSlide from "./slides/OutroSlide";

export type SlideProps = {
  slide: Slide;
  product: Product | null;
  reviews: Review[];
  latestReviews: Review[];
  avg: number;
  gallery: string[];
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
