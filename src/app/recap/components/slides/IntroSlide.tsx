"use client";

import React from "react";
import { motion } from "framer-motion";
import type { SlideProps } from "./SlideRenderer";
import { Icon } from "../Icon";

export function IntroSlide({ product, reviews, gallery }: SlideProps) {
  const year = new Date().getFullYear();
 
   const title = product?.title?.trim() || "Recap";
   const subtitle =
     product?.subtitle?.trim() ||
     "Un diaporama rapide des moments, des photos et des avis.";
 
   const reviewCount = reviews?.length ?? 0;
   const galleryCount = gallery?.length ?? 0;
 
   const hero = product?.heroImageUrl || null;
   const coverImg = hero || gallery?.[0] || null;
 
   return (
     <div className="center intro">
       {/* Cover card */}
       <motion.div
         className="cover"
         initial={{ opacity: 0, y: 14, scale: 0.98 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         transition={{ duration: 0.45, ease: "easeOut" }}
       >
         <div className="coverInner">
           <div className="coverImgWrap" aria-hidden="true">
             {coverImg ? (
               <img className="coverImg" src={coverImg} alt="" />
             ) : (
               <div className="coverImgFallback" />
             )}
             <div className="coverGlow" />
           </div>
 
           <div className="coverMeta">
             <div className="coverBadge">
               <span className="dot" aria-hidden="true" />
               Recap
             </div>
 
             <div className="coverTitle">{title}</div>
 
             <div className="coverTags">
               <span className="tag">
                 <Icon name="sparkles" size={16} /> Featuring: Rémy
               </span>
               <span className="tag">
                 <Icon name="check" size={16} /> Top moment
               </span>
             </div>
           </div>
         </div>
       </motion.div>
 
       {/* Main text */}
       <motion.div
         className="subtitle"
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.45, ease: "easeOut", delay: 0.06 }}
       >
         {subtitle}
       </motion.div>
 
       {/* Quick stats */}
       <motion.div
         className="introMeta"
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4, ease: "easeOut", delay: 0.12 }}
       >
         <span className="pill">
           <Icon name="quote" size={16} />
           {reviewCount} avis
         </span>
         <span className="pill">
           <Icon name="photo" size={16} />
           {galleryCount} photos
         </span>
       </motion.div>
 
       {/* CTA */}
       <motion.div
         className="cta"
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4, ease: "easeOut", delay: 0.18 }}
       >
         <button className="action introAction" type="button" aria-label="Commencer le recap">
           <Icon name="play" size={18} />
           Commencer
         </button>
 
         <span className="chip">
           <Icon name="check" size={16} />
           Plein écran
         </span>
         <span className="chip">Diaporama interactif</span>
       </motion.div>
 
       <motion.div
         className="introHint"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 0.35, ease: "easeOut", delay: 0.26 }}
       >
         Astuce : clique à droite pour avancer • ← → pour naviguer • Espace pour pause
       </motion.div>
 
       <style jsx>{`
         .intro {
           gap: 14px;
           padding: clamp(16px, 3vw, 44px);
         }
 
         /* Cover card */
         .cover {
           width: 100%;
           max-width: 920px;
           border-radius: 28px;
           border: 1px solid rgba(255, 255, 255, 0.16);
           background: rgba(0, 0, 0, 0.22);
           box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
           overflow: hidden;
         }
 
         .coverInner {
           display: grid;
           grid-template-columns: 160px 1fr;
           gap: 16px;
           padding: 16px;
         }
 
         .coverImgWrap {
           position: relative;
           width: 160px;
           height: 160px;
           border-radius: 22px;
           overflow: hidden;
           border: 1px solid rgba(255, 255, 255, 0.14);
           background: rgba(255, 255, 255, 0.06);
         }
 
         .coverImg {
           width: 100%;
           height: 100%;
           object-fit: cover;
           display: block;
           transform: scale(1.03);
           filter: saturate(1.1) contrast(1.04);
         }
 
         .coverImgFallback {
           width: 100%;
           height: 100%;
           background: radial-gradient(circle at 25% 30%, rgba(255, 255, 255, 0.18), transparent 55%),
             radial-gradient(circle at 75% 65%, rgba(255, 255, 255, 0.12), transparent 55%),
             linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 0.92));
         }
 
         .coverGlow {
           position: absolute;
           inset: -40px;
           background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.14), transparent 55%);
           pointer-events: none;
         }
 
         .coverMeta {
           display: grid;
           align-content: center;
           gap: 10px;
           min-width: 0;
         }
 
         .coverBadge {
           display: inline-flex;
           align-items: center;
           gap: 10px;
           width: fit-content;
           padding: 8px 12px;
           border-radius: 999px;
           border: 1px solid rgba(255, 255, 255, 0.14);
           background: rgba(0, 0, 0, 0.22);
           color: rgba(255, 255, 255, 0.86);
           font-weight: 950;
           font-size: 12px;
           letter-spacing: 0.1em;
           text-transform: uppercase;
         }
 
         .dot {
           width: 8px;
           height: 8px;
           border-radius: 999px;
           background: rgba(255, 255, 255, 0.88);
           box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.12);
           animation: pulse 1.8s ease-in-out infinite;
         }
 
         @keyframes pulse {
           0%,
           100% {
             transform: scale(1);
             opacity: 0.88;
           }
           50% {
             transform: scale(1.15);
             opacity: 1;
           }
         }
 
         .coverTitle {
           font-size: clamp(22px, 3vw, 34px);
           line-height: 1.06;
           font-weight: 1000;
           letter-spacing: -0.04em;
           color: rgba(255, 255, 255, 0.96);
           text-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
           white-space: nowrap;
           overflow: hidden;
           text-overflow: ellipsis;
           max-width: 100%;
         }
 
         .coverTags {
           display: flex;
           gap: 10px;
           flex-wrap: wrap;
         }
 
         .tag {
           display: inline-flex;
           align-items: center;
           gap: 8px;
           padding: 10px 12px;
           border-radius: 999px;
           border: 1px solid rgba(255, 255, 255, 0.14);
           background: rgba(255, 255, 255, 0.08);
           color: rgba(255, 255, 255, 0.9);
           font-weight: 900;
           font-size: 13px;
           letter-spacing: -0.02em;
         }
 
         /* Inline additions (reuse your global recapCss classes too) */
         .introMeta {
           display: flex;
           gap: 10px;
           flex-wrap: wrap;
           margin-top: 2px;
         }
 
         .introAction {
           display: inline-flex;
           align-items: center;
           gap: 10px;
         }
 
         .introHint {
           margin-top: 4px;
           font-size: 12px;
           color: rgba(255, 255, 255, 0.62);
           max-width: 860px;
         }
 
         @media (max-width: 720px) {
           .coverInner {
             grid-template-columns: 120px 1fr;
           }
           .coverImgWrap {
             width: 120px;
             height: 120px;
             border-radius: 18px;
           }
           .coverTitle {
             font-size: 22px;
           }
         }
 
         @media (max-width: 520px) {
           .coverInner {
             grid-template-columns: 1fr;
           }
           .coverImgWrap {
             width: 100%;
             height: 160px;
           }
           .coverMeta {
             gap: 10px;
           }
           .coverTitle {
             white-space: normal;
           }
         }
       `}</style>
     </div>
   );
 }
 
 export default IntroSlide;