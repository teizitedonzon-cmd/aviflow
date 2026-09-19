"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);

    const resultat = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setChargement(false);

    if (resultat?.error) {
      setErreur("Email ou mot de passe incorrect");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}><Logo /></div>
        <p className={styles.subtitle}>Connectez-vous pour gérer vos fermes</p>

        {erreur && <div className={styles.error}>{erreur}</div>}

        <form onSubmit={handleSubmit}>
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
          <div className={styles.field}>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className={styles.submit} type="submit" disabled={chargement}>
            {chargement ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className={styles.footerLink}>
          Pas encore de compte ? <Link href="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
