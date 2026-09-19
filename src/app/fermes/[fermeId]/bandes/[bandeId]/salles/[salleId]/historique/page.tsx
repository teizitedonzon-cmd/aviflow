"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BoutonRetour } from "@/components/BoutonRetour";
import styles from "@/app/shared.module.css";
import { SalleNav } from "@/components/SalleNav";
interface Fiche {
  _id: string; date: string; mortalite: number; alimentConsommeKg?: number;
  eauConsommeeL?: number; productionOeufs?: number; traitements?: string; observations?: string;
}

export default function HistoriqueSallePage() {
  const { salleId } = useParams<{ salleId: string }>();
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch(`/api/fiches?salleId=${salleId}`).then((r) => r.json()).then(setFiches).finally(() => setChargement(false));
  }, [salleId]);

  if (chargement) return <div className="container"><p style={{ padding: "2rem" }}>Chargement...</p></div>;

  return (
    <div className="container">
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}><Logo /></Link>
      </header>
      <SalleNav />
      <div className={styles.titleRow}>
        <h1>Historique des fiches ({fiches.length})</h1>
        <BoutonRetour />
      </div>

      {fiches.length === 0 ? (
        <div className={styles.empty}>Aucune fiche saisie depuis la création de la salle.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr><th>Date</th><th>Mortalité</th><th>Aliment (kg)</th><th>Eau (L)</th><th>Œufs</th><th>Traitements</th><th>Observations</th></tr>
          </thead>
          <tbody>
            {[...fiches].reverse().map((f) => (
              <tr key={f._id}>
                <td>{new Date(f.date).toLocaleDateString("fr-FR")}</td>
                <td>{f.mortalite}</td>
                <td>{f.alimentConsommeKg ?? "—"}</td>
                <td>{f.eauConsommeeL ?? "—"}</td>
                <td>{f.productionOeufs ?? "—"}</td>
                <td>{f.traitements ?? "—"}</td>
                <td>{f.observations ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}