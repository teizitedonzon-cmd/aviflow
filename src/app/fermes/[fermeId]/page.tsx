"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import styles from "@/app/shared.module.css";
import { SalleNav } from "@/components/SalleNav";

interface Bande {
  _id: string;
  nom: string;
  race: string;
  typeElevage: "chair" | "ponte";
  effectifInitial: number;
  dateMiseEnPlace: string;
  statut: "en_cours" | "cloturee";
}

interface Ferme {
  _id: string;
  nom: string;
  localisation?: string;
}

export default function FermePage() {
  const { fermeId } = useParams<{ fermeId: string }>();
  const [ferme, setFerme] = useState<Ferme | null>(null);
  const [bandes, setBandes] = useState<Bande[]>([]);
  const [chargement, setChargement] = useState(true);
  const [afficherForm, setAfficherForm] = useState(false);

  const [nom, setNom] = useState("");
  const [race, setRace] = useState("");
  const [typeElevage, setTypeElevage] = useState<"chair" | "ponte">("chair");
  const [effectifInitial, setEffectifInitial] = useState("");
  const [dateMiseEnPlace, setDateMiseEnPlace] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/fermes/${fermeId}`).then((r) => r.json()),
      fetch(`/api/bandes?fermeId=${fermeId}`).then((r) => r.json()),
    ])
      .then(([fermeData, bandesData]) => {
        setFerme(fermeData);
        setBandes(bandesData);
      })
      .finally(() => setChargement(false));
  }, [fermeId]);

  async function creerBande(e: FormEvent) {
    e.preventDefault();
    const reponse = await fetch("/api/bandes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fermeId,
        nom,
        race,
        typeElevage,
        effectifInitial: Number(effectifInitial),
        dateMiseEnPlace,
      }),
    });
    const nouvelleBande = await reponse.json();
    setBandes((prev) => [nouvelleBande, ...prev]);
    setNom("");
    setRace("");
    setEffectifInitial("");
    setDateMiseEnPlace("");
    setAfficherForm(false);
  }

  if (chargement) return <div className="container"><p style={{ padding: "2rem" }}>Chargement...</p></div>;

  return (
    <div className="container">
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}><Logo /></Link>
      </header>

      <div className={styles.breadcrumb}>
        <Link href="/dashboard">Mes fermes</Link> / {ferme?.nom}
      </div>

      <div className={styles.titleRow}>
        <h1>{ferme?.nom}</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href={`/fermes/${fermeId}/historique`} className={styles.secondaryBtn}>
             Historique
          </Link>
          <Link href={`/fermes/${fermeId}/veterinaires`} className={styles.secondaryBtn}>
            Vétérinaires
          </Link>
          <Link href={`/fermes/${fermeId}/rapport`} className={styles.secondaryBtn}>
            Rapport PDF
          </Link>
          <button className={styles.newBtn} onClick={() => setAfficherForm((v) => !v)}>
            + Nouvelle bande
          </button>
        </div>
      </div>

      {afficherForm && (
        <form className={styles.form} onSubmit={creerBande}>
          <div className={styles.field}>
            <label>Nom de la bande</label>
            <input required value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Race</label>
            <input required value={race} onChange={(e) => setRace(e.target.value)} placeholder="ex: Cobb 500" />
          </div>
          <div className={styles.field}>
            <label>Type d&apos;élevage</label>
            <select value={typeElevage} onChange={(e) => setTypeElevage(e.target.value as "chair" | "ponte")}>
              <option value="chair">Chair</option>
              <option value="ponte">Ponte</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Effectif initial</label>
            <input
              required
              type="number"
              min={1}
              value={effectifInitial}
              onChange={(e) => setEffectifInitial(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Date de mise en place</label>
            <input
              required
              type="date"
              value={dateMiseEnPlace}
              onChange={(e) => setDateMiseEnPlace(e.target.value)}
            />
          </div>
          <button className={styles.newBtn} type="submit">Créer</button>
        </form>
      )}

      {bandes.length === 0 ? (
        <div className={styles.empty}>Aucune bande pour le moment. Créez-en une pour commencer.</div>
      ) : (
        <div className={styles.grid}>
          {bandes.map((bande) => (
            <Link key={bande._id} href={`/fermes/${fermeId}/bandes/${bande._id}`} className={styles.card}>
              <span className={bande.statut === "en_cours" ? `${styles.badge} ${styles.badgeActive}` : `${styles.badge} ${styles.badgeClosed}`}>
                {bande.statut === "en_cours" ? "En cours" : "Clôturée"}
              </span>
              <span className={styles.cardTitle}>{bande.nom}</span>
              <span className={styles.cardMeta}>
                {bande.race} · {bande.effectifInitial} sujets · {bande.typeElevage}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
