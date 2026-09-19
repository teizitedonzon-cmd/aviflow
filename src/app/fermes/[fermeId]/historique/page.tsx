"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import styles from "@/app/shared.module.css";

interface JourAgrege {
  date: string;
  mortalite: number;
  alimentKg: number;
  eauL: number;
  oeufs: number;
}

interface LigneDetail {
  date: string;
  nomSalle: string;
  nomBande: string;
  mortalite: number;
  alimentConsommeKg?: number;
  eauConsommeeL?: number;
  productionOeufs?: number;
  traitements?: string;
  observations?: string;
}

export default function HistoriqueFermePage() {
  const { fermeId } = useParams<{ fermeId: string }>();
  const [historique, setHistorique] = useState<JourAgrege[]>([]);
  const [detail, setDetail] = useState<LigneDetail[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch(`/api/fermes/${fermeId}/historique`)
      .then((r) => r.json())
      .then((data) => {
        setHistorique(data.historique);
        setDetail(data.detail);
      })
      .finally(() => setChargement(false));
  }, [fermeId]);

  if (chargement) return <div className="container"><p style={{ padding: "2rem" }}>Chargement...</p></div>;

  return (
    <div className="container">
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}><Logo /></Link>
      </header>

      <div className={styles.breadcrumb}>
        <Link href="/dashboard">Mes fermes</Link> / <Link href={`/fermes/${fermeId}`}>Ferme</Link> / Historique
      </div>

      <div className={styles.titleRow}>
        <h1>Historique de la ferme</h1>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Totaux par jour (toutes salles confondues)</div>
        {historique.length === 0 ? (
          <div className={styles.empty}>Aucune fiche saisie pour le moment.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th><th>Mortalité</th><th>Aliment (kg)</th><th>Eau (L)</th><th>Œufs</th>
                </tr>
              </thead>
              <tbody>
                {[...historique].reverse().map((j) => (
                  <tr key={j.date}>
                    <td>{new Date(j.date).toLocaleDateString("fr-FR")}</td>
                    <td>{j.mortalite}</td>
                    <td>{j.alimentKg.toFixed(1)}</td>
                    <td>{j.eauL.toFixed(1)}</td>
                    <td>{j.oeufs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Détail par salle ({detail.length} fiches)</div>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th><th>Bande</th><th>Salle</th><th>Mortalité</th>
                <th>Aliment</th><th>Eau</th><th>Œufs</th><th>Traitements</th><th>Observations</th>
              </tr>
            </thead>
            <tbody>
              {[...detail].reverse().map((d, i) => (
                <tr key={i}>
                  <td>{new Date(d.date).toLocaleDateString("fr-FR")}</td>
                  <td>{d.nomBande}</td>
                  <td>{d.nomSalle}</td>
                  <td>{d.mortalite}</td>
                  <td>{d.alimentConsommeKg ?? "—"}</td>
                  <td>{d.eauConsommeeL ?? "—"}</td>
                  <td>{d.productionOeufs ?? "—"}</td>
                  <td>{d.traitements ?? "—"}</td>
                  <td>{d.observations ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}