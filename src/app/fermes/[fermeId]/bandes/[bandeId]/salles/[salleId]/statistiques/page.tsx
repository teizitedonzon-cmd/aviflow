"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BoutonRetour } from "@/components/BoutonRetour";
import styles from "@/app/shared.module.css";
import { SalleNav } from "@/components/SalleNav";
import {
  CourbeCroissance, CourbeMortaliteCumulee, CourbeTauxPonte, CourbeConsommationParTete,
} from "@/components/StatsCharts";

interface Fiche { date: string; mortalite: number; alimentConsommeKg?: number; eauConsommeeL?: number; productionOeufs?: number; }
interface Pesee { date: string; poidsMoyenGrammes: number; }
interface Salle { effectifInitial: number; }
interface Bande { typeElevage: "chair" | "ponte"; }

export default function StatistiquesPage() {
  const { bandeId, salleId } = useParams<{ bandeId: string; salleId: string }>();
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [pesees, setPesees] = useState<Pesee[]>([]);
  const [salle, setSalle] = useState<Salle | null>(null);
  const [bande, setBande] = useState<Bande | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/salles/${salleId}`).then((r) => r.json()),
      fetch(`/api/bandes/${bandeId}`).then((r) => r.json()),
      fetch(`/api/fiches?salleId=${salleId}`).then((r) => r.json()),
      fetch(`/api/pesees?salleId=${salleId}`).then((r) => r.json()),
    ]).then(([s, b, f, p]) => { setSalle(s); setBande(b); setFiches(f); setPesees(p); })
      .finally(() => setChargement(false));
  }, [salleId, bandeId]);

  if (chargement) return <div className="container"><p style={{ padding: "2rem" }}>Chargement...</p></div>;

  const effectifInitial = salle?.effectifInitial ?? 1;

  return (
    <div className="container">
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}><Logo /></Link>
      </header>
      <SalleNav />

      <div className={styles.titleRow}>
        <h1>Statistiques</h1>
        <BoutonRetour />
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <CourbeCroissance pesees={pesees} />
        <CourbeMortaliteCumulee fiches={fiches} effectifInitial={effectifInitial} />
        {bande?.typeElevage === "ponte" && <CourbeTauxPonte fiches={fiches} effectifInitial={effectifInitial} />}
        <CourbeConsommationParTete fiches={fiches} effectifInitial={effectifInitial} />
      </div>
    </div>
  );
}