"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import styles from "@/app/shared.module.css";

interface Salle {
  _id: string;
  nom: string;
  capacite: number;
  equipements?: string;
}

interface Bande {
  _id: string;
  nom: string;
  race: string;
  typeElevage: "chair" | "ponte";
  effectifInitial: number;
}

export default function BandePage() {
  const { fermeId, bandeId } = useParams<{ fermeId: string; bandeId: string }>();
  const [bande, setBande] = useState<Bande | null>(null);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [chargement, setChargement] = useState(true);
  const [afficherForm, setAfficherForm] = useState(false);

  const [nom, setNom] = useState("");
  const [capacite, setCapacite] = useState("");
  const [equipements, setEquipements] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/bandes/${bandeId}`).then((r) => r.json()),
      fetch(`/api/salles?bandeId=${bandeId}`).then((r) => r.json()),
    ])
      .then(([bandeData, sallesData]) => {
        setBande(bandeData);
        setSalles(sallesData);
      })
      .finally(() => setChargement(false));
  }, [bandeId]);

  async function creerSalle(e: FormEvent) {
    e.preventDefault();
    const reponse = await fetch("/api/salles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bandeId, nom, capacite: Number(capacite), equipements }),
    });
    const nouvelleSalle = await reponse.json();
    setSalles((prev) => [...prev, nouvelleSalle]);
    setNom("");
    setCapacite("");
    setEquipements("");
    setAfficherForm(false);
  }

  async function modifierSalle(salle: Salle) {
    const nomModifie = window.prompt("Nom de la salle", salle.nom);
    if (!nomModifie?.trim()) return;
    const capaciteModifiee = window.prompt("Capacité", String(salle.capacite));
    if (capaciteModifiee === null) return;
    const reponse = await fetch(`/api/salles/${salle._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: nomModifie, capacite: Number(capaciteModifiee) }),
    });
    if (!reponse.ok) return alert((await reponse.json()).error ?? "Modification impossible");
    const modifiee = await reponse.json();
    setSalles((liste) => liste.map((item) => item._id === salle._id ? modifiee : item));
  }

  async function supprimerSalle(salle: Salle) {
    if (!window.confirm(`Supprimer ${salle.nom} et toutes ses fiches et pesées ?`)) return;
    const reponse = await fetch(`/api/salles/${salle._id}`, { method: "DELETE" });
    if (!reponse.ok) return alert("Suppression impossible");
    setSalles((liste) => liste.filter((item) => item._id !== salle._id));
  }

  if (chargement) return <div className="container"><p style={{ padding: "2rem" }}>Chargement...</p></div>;

  return (
    <div className="container">
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}><Logo /></Link>
      </header>

      <div className={styles.breadcrumb}>
        <Link href="/dashboard">Mes fermes</Link> / <Link href={`/fermes/${fermeId}`}>Ferme</Link> / {bande?.nom}
      </div>

      <div className={styles.titleRow}>
        <h1>{bande?.nom}</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href={`/fermes/${fermeId}/bandes/${bandeId}/vaccination`} className={styles.secondaryBtn}>
            💉 Vaccination
          </Link>
          <button className={styles.newBtn} onClick={() => setAfficherForm((v) => !v)}>
            + Nouvelle salle
          </button>
        </div>
      </div>

      {afficherForm && (
        <form className={styles.form} onSubmit={creerSalle}>
          <div className={styles.field}>
            <label>Nom de la salle</label>
            <input required value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Capacité</label>
            <input required type="number" min={1} value={capacite} onChange={(e) => setCapacite(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Équipements</label>
            <input value={equipements} onChange={(e) => setEquipements(e.target.value)} placeholder="ventilation, abreuvoirs..." />
          </div>
          <button className={styles.newBtn} type="submit">Créer</button>
        </form>
      )}

      {salles.length === 0 ? (
        <div className={styles.empty}>Aucune salle pour le moment. Créez-en une pour commencer.</div>
      ) : (
        <div className={styles.grid}>
          {salles.map((salle) => (
            <div key={salle._id} className={styles.card}>
              <Link href={`/fermes/${fermeId}/bandes/${bandeId}/salles/${salle._id}`}>
                <span className={styles.cardTitle}>{salle.nom}</span>
                <span className={styles.cardMeta}>Capacité : {salle.capacite} sujets</span>
                {salle.equipements && <span className={styles.cardMeta}>{salle.equipements}</span>}
              </Link>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <button className={styles.linkBtn} onClick={() => modifierSalle(salle)}>Modifier</button>
                <button className={styles.linkBtn} onClick={() => supprimerSalle(salle)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
