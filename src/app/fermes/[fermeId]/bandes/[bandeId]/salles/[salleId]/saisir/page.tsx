"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BoutonRetour } from "@/components/BoutonRetour";
import styles from "@/app/shared.module.css";
import { ajouterFicheEnAttente } from "@/lib/offlineQueue";
import { SalleNav } from "@/components/SalleNav";

interface Bande { typeElevage: "chair" | "ponte"; }

function aujourdHui() { return new Date().toISOString().slice(0, 10); }

export default function SaisirPage() {
  const { bandeId, salleId } = useParams<{ bandeId: string; salleId: string }>();
  const [bande, setBande] = useState<Bande | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const [date, setDate] = useState(aujourdHui());
  const [mortalite, setMortalite] = useState("0");
  const [alimentConsommeKg, setAlimentConsommeKg] = useState("");
  const [eauConsommeeL, setEauConsommeeL] = useState("");
  const [traitements, setTraitements] = useState("");
  const [observations, setObservations] = useState("");
  const [productionOeufs, setProductionOeufs] = useState("");

  useEffect(() => {
    fetch(`/api/bandes/${bandeId}`).then((r) => r.json()).then(setBande);
  }, [bandeId]);

  async function soumettreFiche(e: FormEvent) {
    e.preventDefault();
    setErreur(null);

    const payload = {
      salleId, date, mortalite: Number(mortalite || 0),
      alimentConsommeKg: alimentConsommeKg ? Number(alimentConsommeKg) : undefined,
      eauConsommeeL: eauConsommeeL ? Number(eauConsommeeL) : undefined,
      traitements: traitements || undefined,
      observations: observations || undefined,
      productionOeufs: productionOeufs ? Number(productionOeufs) : undefined,
    };

    try {
      const reponse = await fetch("/api/fiches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!reponse.ok) {
        const data = await reponse.json();
        setErreur(data.error ?? "Erreur lors de l'enregistrement");
        return;
      }
      alert("Fiche enregistrée !");
    } catch {
      ajouterFicheEnAttente(payload);
      alert("Pas de connexion : la fiche est enregistrée hors-ligne et sera synchronisée automatiquement.");
    }

    setMortalite("0"); setAlimentConsommeKg(""); setEauConsommeeL("");
    setTraitements(""); setObservations(""); setProductionOeufs("");
  }

  return (
    <div className="container">
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}><Logo /></Link>
      </header>
      <SalleNav />

      <div className={styles.titleRow}>
        <h1>Saisir le bilan du jour</h1>
        <BoutonRetour />
      </div>

      {erreur && <p style={{ color: "var(--color-danger)", marginBottom: "0.75rem" }}>{erreur}</p>}

      <form className={styles.form} onSubmit={soumettreFiche}>
        <div className={styles.field}><label>Date</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className={styles.field}><label>Mortalité</label>
          <input type="number" min={0} value={mortalite} onChange={(e) => setMortalite(e.target.value)} /></div>
        <div className={styles.field}><label>Aliment (kg)</label>
          <input type="number" min={0} step="0.1" value={alimentConsommeKg} onChange={(e) => setAlimentConsommeKg(e.target.value)} /></div>
        <div className={styles.field}><label>Eau (L)</label>
          <input type="number" min={0} step="0.1" value={eauConsommeeL} onChange={(e) => setEauConsommeeL(e.target.value)} /></div>
        {bande?.typeElevage === "ponte" && (
          <div className={styles.field}><label>Œufs produits</label>
            <input type="number" min={0} value={productionOeufs} onChange={(e) => setProductionOeufs(e.target.value)} /></div>
        )}
        <div className={styles.field}><label>Traitements</label>
          <input value={traitements} onChange={(e) => setTraitements(e.target.value)} /></div>
        <div className={styles.field}><label>Observations</label>
          <input value={observations} onChange={(e) => setObservations(e.target.value)} /></div>
        <button className={styles.newBtn} type="submit">Enregistrer</button>
      </form>
    </div>
  );
}
