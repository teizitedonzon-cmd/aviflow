"use client";

import { useRouter } from "next/navigation";
import styles from "@/app/shared.module.css";

export function BoutonRetour() {
  const router = useRouter();
  return (
    <button className={styles.secondaryBtn} onClick={() => router.back()}>
      ← Retour
    </button>
  );
}