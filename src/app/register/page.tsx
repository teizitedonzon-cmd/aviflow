"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PasswordField } from "@/components/PasswordField";
import styles from "../login/page.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);

    const reponse = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, email, password }),
    });

    if (!reponse.ok) {
      const data = await reponse.json();
      setErreur(data.error ?? "Une erreur est survenue");
      setChargement(false);
      return;
    }

    // Connexion automatique après inscription
    await signIn("credentials", { email, password, redirect: false });
    setChargement(false);
    router.push("/dashboard");
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}><Logo /></div>
        <p className={styles.subtitle}>Créez votre compte producteur</p>

        {erreur && <div className={styles.error}>{erreur}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="nom">Nom complet</label>
            <input id="nom" required value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <PasswordField
            id="password"
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button className={styles.submit} type="submit" disabled={chargement}>
            {chargement ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className={styles.footerLink}>
          Déjà un compte ? <Link href="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
