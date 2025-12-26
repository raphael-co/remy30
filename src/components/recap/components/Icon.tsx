"use client";

import React from "react";

export function Icon({
  name,
  size = 18,
}: {
  name:
    | "sparkles"
    | "play"
    | "pause"
    | "close"
    | "arrowLeft"
    | "arrowRight"
    | "star"
    | "photo"
    | "quote"
    | "check";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (name) {
    case "sparkles":
      return (
        <svg {...common}>
          <path
            d="M12 2l1.1 4.3L17 7.4l-3.9 1.1L12 13l-1.1-4.5L7 7.4l3.9-1.1L12 2z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M19 12l.7 2.7L22 15.4l-2.3.7L19 19l-.7-2.9L16 15.4l2.3-.7L19 12z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="M9 7l10 5-10 5V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common}>
          <path d="M7 6v12M17 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "arrowLeft":
      return (
        <svg {...common}>
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "arrowRight":
      return (
        <svg {...common}>
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path
            d="M12 17.3l-5.3 3 1.4-6-4.6-4 6.1-.6L12 4l2.4 5.7 6.1.6-4.6 4 1.4 6-5.3-3z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "photo":
      return (
        <svg {...common}>
          <path
            d="M4 7a3 3 0 0 1 3-3h2l1.2 2H17a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 14.5l2.2-2.2 2 2 2.6-2.6L20 14.9V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2.2l4-2.3z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "quote":
      return (
        <svg {...common}>
          <path
            d="M10 11H6a4 4 0 0 0 0 8h2v-3H6a1 1 0 0 1 0-2h4V7a4 4 0 0 0-4 4z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M20 11h-4a4 4 0 0 0 0 8h2v-3h-2a1 1 0 1 1 0-2h4V7a4 4 0 0 0-4 4z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
