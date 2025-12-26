"use client";

import React from "react";

export function SlideShell({
  bgUrl,
  children,
}: {
  bgUrl?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="shell">
      <div className="bg">
        {bgUrl ? <img className="bgImg" src={bgUrl} alt="" /> : <div className="bgFallback" />}
        <div className="bgVignette" />
      </div>

      <div className="inner">{children}</div>

      <style jsx>{`
        .shell {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .bg {
          position: absolute;
          inset: 0;
        }
        .bgImg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.06);
          filter: saturate(1.15) contrast(1.06);
        }
        .bgFallback {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 25% 30%, rgba(255, 255, 255, 0.18), transparent 55%),
            radial-gradient(circle at 75% 65%, rgba(255, 255, 255, 0.12), transparent 55%),
            linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.92));
        }
        .bgVignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(0, 0, 0, 0.28), transparent 55%),
            radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.28), transparent 55%),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.62));
          backdrop-filter: blur(10px);
        }
        .inner {
          position: relative;
          height: 100%;
          width: 100%;
          display: grid;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
