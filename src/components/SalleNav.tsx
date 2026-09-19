"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import styles from "@/app/shared.module.css";

export function SalleNav() {
  const { fermeId, bandeId, salleId } = useParams<{ fermeId: string; bandeId: string; salleId: string }>();
  const pathname = usePathname();
  const base = `/fermes/${fermeId}/bandes/${bandeId}/salles/${salleId}`;

  const onglets = [
    { href: base, label: "🏠 Tableau de bord" },
    { href: `${base}/saisir`, label: "📝 Saisir" },
    { href: `${base}/pesee`, label: "⚖️ Pesée" },
    { href: `${base}/statistiques`, label: "📊 Statistique" },
    { href: `${base}/historique`, label: "🕒 Historique" },
    { href: `${base}/rapport`, label: "📄 Rapport" },
  ];

  return (
    <nav className={styles.tabBar}>
      {onglets.map((onglet) => (
        <Link
          key={onglet.href}
          href={onglet.href}
          className={pathname === onglet.href ? `${styles.tab} ${styles.tabActive}` : styles.tab}
        >
          {onglet.label}
        </Link>
      ))}
    </nav>
  );
}