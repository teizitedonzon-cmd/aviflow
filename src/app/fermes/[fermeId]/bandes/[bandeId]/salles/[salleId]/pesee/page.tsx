"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BoutonRetour } from "@/components/BoutonRetour";
import styles from "@/app/shared.module.css";
import { SalleNav } from "@/components/SalleNav";

interface Pesee { _id: string; date: string; poidsMoyenGrammes: number; }

function aujourdHui() { return new Date().toISOString().slice(0, 10); }

export default function PeseePage() {
  const { salleId } = useParams<{ salleId: string }>();
  const [pesees, setPesees] = useState<Pesee[]>([]);
  const [date, setDate] = useState(aujourdHui());
  const [poidsMoyenGrammes, setPoidsMoyenGrammes] = useState("");
  const [chargement, setChargement] = useState(true);

  function charger() {
    return fetch(`/api/pesees?salleId=${salleId}`).then((r) => r.json()).then(setPesees);
  }

  useEffect(() => { charger().finally(() => setChargement(false)); }, [salleId]);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/pesees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salleId, date, poidsMoyenGrammes: Number(poidsMoyenGrammes) }),
    });
    setPoidsMoyenGrammes("");
    await charger();
  }

  if (chargement) return <div className="container"><p style={{ padding: "2rem" }}>Chargement...</p></div>;

  return (
    <div className="container">
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}><Logo /></Link>
      </header>
      <SalleNav />
      <div className={styles.titleRow}>
        <h1>Pesée des animaux</h1>
        <BoutonRetour />
      </div>

      <form className={styles.form} onSubmit={soumettre}>
        <div className={styles.field}><label>Date</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className={styles.field}><label>Poids moyen (g)</label>
          <input type="number" required min={0} value={poidsMoyenGrammes} onChange={(e) => setPoidsMoyenGrammes(e.target.value)} /></div>
        <button className={styles.newBtn} type="submit">Ajouter la pesée</button>
      </form>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Historique des pesées ({pesees.length})</div>
        {pesees.length === 0 ? (
          <div className={styles.empty}>Aucune pesée enregistrée pour le moment.</div>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>Date</th><th>Poids moyen</th></tr></thead>
            <tbody>
              {[...pesees].reverse().map((p) => (
                <tr key={p._id}>
                  <td>{new Date(p.date).toLocaleDateString("fr-FR")}</td>
                  <td>{p.poidsMoyenGrammes} g</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}