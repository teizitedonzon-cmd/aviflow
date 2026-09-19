"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SalleNav } from "@/components/SalleNav";
import styles from "@/app/shared.module.css";

function aujourdHui() { return new Date().toISOString().slice(0, 10); }

export default function RapportSallePage() {
  const { salleId } = useParams<{ salleId: string }>();
  const [date, setDate] = useState(aujourdHui());

  const urlPdf = `/api/salles/${salleId}/rapport?date=${date}`;
  const messagePartage = encodeURIComponent(
    `Bonjour, voici le bilan journalier de la salle du ${new Date(date).toLocaleDateString("fr-FR")}. Merci de trouver le PDF téléchargé en pièce jointe.`
  );

  return (
    <div className="container">
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}><Logo /></Link>
      </header>
      <SalleNav />

      <div className={styles.titleRow}><h1>Rapport de la salle</h1></div>

      <div className={styles.section}>
        <div className={styles.form} style={{ marginBottom: 0 }}>
          <div className={styles.field}>
            <label>Date du bilan</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <a className={styles.newBtn} href={urlPdf} download>Télécharger le PDF</a>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Envoyer au vétérinaire</div>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Téléchargez d&apos;abord le PDF ci-dessus, puis joignez-le manuellement dans WhatsApp ou votre email.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <a className={styles.secondaryBtn} href={`https://wa.me/?text=${messagePartage}`} target="_blank" rel="noreferrer">
            📱 Ouvrir WhatsApp
          </a>
          <a className={styles.secondaryBtn} href={`mailto:?subject=${encodeURIComponent("Bilan salle - " + date)}&body=${messagePartage}`}>
            ✉️ Ouvrir l&apos;email
          </a>
        </div>
      </div>
    </div>
  );
}