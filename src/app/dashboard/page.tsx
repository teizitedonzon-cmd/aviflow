"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import styles from "./page.module.css";

interface Ferme {
  _id: string;
  nom: string;
  localisation?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [fermes, setFermes] = useState<Ferme[]>([]);
  const [chargement, setChargement] = useState(true);
  const [afficherForm, setAfficherForm] = useState(false);
  const [nom, setNom] = useState("");
  const [localisation, setLocalisation] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/fermes")
      .then((res) => res.json())
      .then((data) => setFermes(data))
      .finally(() => setChargement(false));
  }, [status]);

  async function creerFerme(e: FormEvent) {
    e.preventDefault();
    const reponse = await fetch("/api/fermes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, localisation }),
    });
    const nouvelleFerme = await reponse.json();
    setFermes((prev) => [nouvelleFerme, ...prev]);
    setNom("");
    setLocalisation("");
    setAfficherForm(false);
  }

  if (status === "loading" || chargement) {
    return <div className="container"><p style={{ padding: "2rem" }}>Chargement...</p></div>;
  }

  return (
    <div className="container app-page">
      <header className={styles.header}>
        <div className={styles.brand}><Logo /></div>
        <div className={styles.headerRight}>
          <span className={styles.userBadge}>{session?.user?.name}</span>
          <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: "/login" })}>
            Déconnexion
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Accueil</p>
          <h1>Suivi de ferme</h1>
        </div>
        <button className={styles.newBtn} onClick={() => setAfficherForm((v) => !v)}>
          + Nouvelle ferme
        </button>
      </section>

      <div className={styles.quickActions}>
        <button type="button" className={styles.primaryAction} onClick={() => setAfficherForm((v) => !v)}>
          Ajouter
        </button>
        <button type="button" className={styles.secondaryAction} onClick={() => window.location.reload()}>
          Rafraîchir
        </button>
      </div>

      {afficherForm && (
        <form className={styles.form} onSubmit={creerFerme}>
          <div className={styles.field}>
            <label>Nom de la ferme</label>
            <input required value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Localisation</label>
            <input value={localisation} onChange={(e) => setLocalisation(e.target.value)} />
          </div>
          <button className={styles.newBtn} type="submit">Créer</button>
        </form>
      )}

      {fermes.length === 0 ? (
        <div className={styles.empty}>
          Vous n&apos;avez pas encore de ferme. Créez-en une pour commencer.
        </div>
      ) : (
        <div className={styles.grid}>
          {fermes.map((ferme) => (
            <Link key={ferme._id} href={`/fermes/${ferme._id}`} className={styles.card}>
              <span className={styles.cardTitle}>{ferme.nom}</span>
              <span className={styles.cardMeta}>{ferme.localisation || "Localisation non renseignée"}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
