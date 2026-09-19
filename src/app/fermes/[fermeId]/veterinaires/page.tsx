"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import styles from "@/app/shared.module.css";

interface Veterinaire {
  _id: string;
  nom: string;
  telephone?: string;
  email?: string;
  zoneCouverture?: string;
  specialite?: string;
}

interface Liaison {
  _id: string;
  veterinaireId: Veterinaire;
}

export default function VeterinairesPage() {
  const { fermeId } = useParams<{ fermeId: string }>();
  const [repertoire, setRepertoire] = useState<Veterinaire[]>([]);
  const [liaisons, setLiaisons] = useState<Liaison[]>([]);
  const [chargement, setChargement] = useState(true);
  const [afficherForm, setAfficherForm] = useState(false);

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [zoneCouverture, setZoneCouverture] = useState("");
  const [specialite, setSpecialite] = useState("");

  function charger() {
    return Promise.all([
      fetch("/api/veterinaires").then((r) => r.json()),
      fetch(`/api/fermes/${fermeId}/veterinaires`).then((r) => r.json()),
    ]).then(([repertoireData, liaisonsData]) => {
      setRepertoire(repertoireData);
      setLiaisons(liaisonsData);
    });
  }

  useEffect(() => {
    charger().finally(() => setChargement(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fermeId]);

  const idsLies = new Set(liaisons.map((l) => l.veterinaireId._id));

  async function creerVeterinaire(e: FormEvent) {
    e.preventDefault();
    const reponse = await fetch("/api/veterinaires", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, telephone, email, zoneCouverture, specialite }),
    });
    const nouveau = await reponse.json();
    setRepertoire((prev) => [...prev, nouveau].sort((a, b) => a.nom.localeCompare(b.nom)));
    setNom(""); setTelephone(""); setEmail(""); setZoneCouverture(""); setSpecialite("");
    setAfficherForm(false);
  }

  async function lierVeterinaire(veterinaireId: string) {
    await fetch(`/api/fermes/${fermeId}/veterinaires`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ veterinaireId }),
    });
    await charger();
  }

  async function delierVeterinaire(veterinaireId: string) {
    await fetch(`/api/fermes/${fermeId}/veterinaires/${veterinaireId}`, { method: "DELETE" });
    await charger();
  }

  if (chargement) return <div className="container"><p style={{ padding: "2rem" }}>Chargement...</p></div>;

  return (
    <div className="container">
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}><Logo /></Link>
      </header>

      <div className={styles.breadcrumb}>
        <Link href="/dashboard">Mes fermes</Link> / <Link href={`/fermes/${fermeId}`}>Ferme</Link> / Vétérinaires
      </div>

      <div className={styles.titleRow}>
        <h1>Vétérinaires de la ferme</h1>
        <button className={styles.newBtn} onClick={() => setAfficherForm((v) => !v)}>
          + Ajouter au répertoire
        </button>
      </div>

      {afficherForm && (
        <form className={styles.form} onSubmit={creerVeterinaire}>
          <div className={styles.field}><label>Nom</label><input required value={nom} onChange={(e) => setNom(e.target.value)} /></div>
          <div className={styles.field}><label>Téléphone (WhatsApp)</label><input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+225..." /></div>
          <div className={styles.field}><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className={styles.field}><label>Zone couverte</label><input value={zoneCouverture} onChange={(e) => setZoneCouverture(e.target.value)} /></div>
          <div className={styles.field}><label>Spécialité</label><input value={specialite} onChange={(e) => setSpecialite(e.target.value)} placeholder="aviculture" /></div>
          <button className={styles.newBtn} type="submit">Ajouter</button>
        </form>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Suivant cette ferme ({liaisons.length})</div>
        {liaisons.length === 0 ? (
          <div className={styles.empty}>Aucun vétérinaire rattaché pour l&apos;instant.</div>
        ) : (
          <div className={styles.grid}>
            {liaisons.map((l) => (
              <div key={l._id} className={styles.card}>
                <span className={styles.cardTitle}>{l.veterinaireId.nom}</span>
                <span className={styles.cardMeta}>{l.veterinaireId.specialite || "Vétérinaire"} · {l.veterinaireId.zoneCouverture || "—"}</span>
                {l.veterinaireId.telephone && <span className={styles.cardMeta}>📱 {l.veterinaireId.telephone}</span>}
                {l.veterinaireId.email && <span className={styles.cardMeta}>✉️ {l.veterinaireId.email}</span>}
                <button className={styles.dangerBtn} onClick={() => delierVeterinaire(l.veterinaireId._id)}>
                  Retirer de cette ferme
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Répertoire public</div>
        <div className={styles.grid}>
          {repertoire.filter((v) => !idsLies.has(v._id)).map((v) => (
            <div key={v._id} className={styles.card}>
              <span className={styles.cardTitle}>{v.nom}</span>
              <span className={styles.cardMeta}>{v.specialite || "Vétérinaire"} · {v.zoneCouverture || "—"}</span>
              <button className={styles.linkBtn} onClick={() => lierVeterinaire(v._id)}>
                + Ajouter à cette ferme
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
