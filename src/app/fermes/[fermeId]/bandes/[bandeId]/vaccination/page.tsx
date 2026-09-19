"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import styles from "@/app/shared.module.css";

interface Bande {
  _id: string;
  nom: string;
  dateMiseEnPlace: string;
}

interface Entree {
  _id: string;
  jourAge: number;
  libelle: string;
  statut: "a_faire" | "fait" | "manque";
  dateReelle?: string;
}

function jourAgeActuel(dateMiseEnPlace: string) {
  const debut = new Date(dateMiseEnPlace);
  const maintenant = new Date();
  const diffMs = maintenant.getTime() - debut.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export default function VaccinationPage() {
  const { fermeId, bandeId } = useParams<{ fermeId: string; bandeId: string }>();
  const [bande, setBande] = useState<Bande | null>(null);
  const [entrees, setEntrees] = useState<Entree[]>([]);
  const [chargement, setChargement] = useState(true);
  const [afficherForm, setAfficherForm] = useState(false);
  const [jourAge, setJourAge] = useState("");
  const [libelle, setLibelle] = useState("");

  function charger() {
    return Promise.all([
      fetch(`/api/bandes/${bandeId}`).then((r) => r.json()),
      fetch(`/api/vaccinations?bandeId=${bandeId}`).then((r) => r.json()),
    ]).then(([bandeData, entreesData]) => {
      setBande(bandeData);
      setEntrees(entreesData);
    });
  }

  useEffect(() => {
    charger().finally(() => setChargement(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bandeId]);

  async function ajouterEntree(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/vaccinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bandeId, jourAge: Number(jourAge), libelle }),
    });
    setJourAge("");
    setLibelle("");
    setAfficherForm(false);
    await charger();
  }

  async function changerStatut(id: string, statut: "fait" | "manque" | "a_faire") {
    await fetch(`/api/vaccinations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    await charger();
  }

  if (chargement) return <div className="container"><p style={{ padding: "2rem" }}>Chargement...</p></div>;

  const ageActuel = bande ? jourAgeActuel(bande.dateMiseEnPlace) : 0;

  return (
    <div className="container">
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}><Logo /></Link>
      </header>

      <div className={styles.breadcrumb}>
        <Link href="/dashboard">Mes fermes</Link> / <Link href={`/fermes/${fermeId}`}>Ferme</Link> /{" "}
        <Link href={`/fermes/${fermeId}/bandes/${bandeId}`}>{bande?.nom}</Link> / Vaccination
      </div>

      <div className={styles.titleRow}>
        <h1>Calendrier de vaccination</h1>
        <button className={styles.newBtn} onClick={() => setAfficherForm((v) => !v)}>
          + Ajouter une étape
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Âge actuel de la bande</div>
          <div className={styles.statValue}>{ageActuel} j</div>
        </div>
      </div>

      {afficherForm && (
        <form className={styles.form} onSubmit={ajouterEntree}>
          <div className={styles.field}>
            <label>Jour d&apos;âge</label>
            <input required type="number" min={0} value={jourAge} onChange={(e) => setJourAge(e.target.value)} placeholder="ex: 7" />
          </div>
          <div className={styles.field}>
            <label>Vaccin / traitement</label>
            <input required value={libelle} onChange={(e) => setLibelle(e.target.value)} placeholder="ex: Vaccin Newcastle" />
          </div>
          <button className={styles.newBtn} type="submit">Ajouter</button>
        </form>
      )}

      {entrees.length === 0 ? (
        <div className={styles.empty}>Aucune étape définie. Ajoutez votre premier vaccin/traitement prévu.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Jour</th>
                <th>Vaccin / traitement</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entrees.map((entree) => {
                const enRetard = entree.statut === "a_faire" && entree.jourAge < ageActuel;
                return (
                  <tr key={entree._id}>
                    <td>Jour {entree.jourAge}</td>
                    <td>{entree.libelle}</td>
                    <td>
                      <span
                        className={styles.badge}
                        style={{
                          background: entree.statut === "fait" ? "#e8f3ea" : enRetard ? "#fdecea" : "#f1e9e0",
                          color: entree.statut === "fait" ? "#204d29" : enRetard ? "#c0392b" : "#8a6b3d",
                        }}
                      >
                        {entree.statut === "fait" ? "Fait" : enRetard ? "En retard" : "À faire"}
                      </span>
                    </td>
                    <td>
                      {entree.statut !== "fait" && (
                        <button className={styles.linkBtn} onClick={() => changerStatut(entree._id, "fait")}>
                          Marquer fait
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
