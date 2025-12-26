"use client";

import { useRouter } from "next/navigation";
import styles from "./galerie.module.css";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className={styles.scrollInfo}
      onClick={() => router.push("/")}
      aria-label="Retour à l’accueil"
    >
      <span aria-hidden="true">{"< Retour"}</span>

      <span className={styles.icon} aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path d="M50,67.1c-0.6,0-1.2-0.2-1.8-0.7c-3.8-3.8-7.7-7.7-11.5-11.5c-2.3-2.3,1.2-5.8,3.5-3.5c2.5,2.5,4.9,4.9,7.4,7.4c0-13.7,0-27.4,0-41.2c0-0.6,0.2-1.2,0.5-1.5c0.4-0.6,1.1-1,2-0.9c13.7,0.3,26.4,7.2,33.5,19.1C96.5,55.9,84.7,85,60.2,91.6C35.5,98.2,11.6,79.1,11.1,54c-0.1-3.2,4.9-3.2,5,0c0.3,13.8,8.4,26.4,21.3,31.5c12.5,5,27.1,1.9,36.6-7.5c9.5-9.5,12.5-24.1,7.5-36.6c-4.8-12.1-16.3-20.1-29-21.2c0,12.8,0,25.5,0,38.3c2.5-2.5,4.9-4.9,7.4-7.4c2.3-2.3,5.8,1.3,3.5,3.5c-3.9,3.9-7.8,7.8-11.8,11.8C51.2,66.9,50.6,67.1,50,67.1z" />
        </svg>
      </span>

      <span className={styles.icon}>Scroll</span>
    </button>
  );
}
