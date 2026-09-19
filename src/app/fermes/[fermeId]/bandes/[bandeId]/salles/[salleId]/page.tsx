// "use client";

// import { useEffect, useState, FormEvent } from "react";
// import { useParams } from "next/navigation";
// import Link from "next/link";
// import { Logo } from "@/components/Logo";
// import styles from "@/app/shared.module.css";
// import {
//   CourbeCroissance,
//   CourbeMortaliteCumulee,
//   CourbeTauxPonte,
//   CourbeConsommationParTete,
// } from "@/components/StatsCharts";
// import { ajouterFicheEnAttente } from "@/lib/offlineQueue";

// interface Fiche {
//   _id: string;
//   date: string;
//   mortalite: number;
//   alimentConsommeKg?: number;
//   eauConsommeeL?: number;
//   traitements?: string;
//   observations?: string;
//   productionOeufs?: number;
// }

// interface Pesee {
//   _id: string;
//   date: string;
//   poidsMoyenGrammes: number;
// }

// interface Salle {
//   _id: string;
//   nom: string;
//   capacite: number;
// }

// interface Bande {
//   _id: string;
//   nom: string;
//   typeElevage: "chair" | "ponte";
//   effectifInitial: number;
// }

// function aujourdHui() {
//   return new Date().toISOString().slice(0, 10);
// }

// export default function SallePage() {
//   const { fermeId, bandeId, salleId } = useParams<{ fermeId: string; bandeId: string; salleId: string }>();

//   const [salle, setSalle] = useState<Salle | null>(null);
//   const [bande, setBande] = useState<Bande | null>(null);
//   const [fiches, setFiches] = useState<Fiche[]>([]);
//   const [pesees, setPesees] = useState<Pesee[]>([]);
//   const [chargement, setChargement] = useState(true);
//   const [erreur, setErreur] = useState<string | null>(null);

//   // Formulaire fiche du jour
//   const [date, setDate] = useState(aujourdHui());
//   const [mortalite, setMortalite] = useState("0");
//   const [alimentConsommeKg, setAlimentConsommeKg] = useState("");
//   const [eauConsommeeL, setEauConsommeeL] = useState("");
//   const [traitements, setTraitements] = useState("");
//   const [observations, setObservations] = useState("");
//   const [productionOeufs, setProductionOeufs] = useState("");

//   // Formulaire pesée
//   const [datePesee, setDatePesee] = useState(aujourdHui());
//   const [poidsMoyenGrammes, setPoidsMoyenGrammes] = useState("");

//   function chargerDonnees() {
//     return Promise.all([
//       fetch(`/api/salles/${salleId}`).then((r) => r.json()),
//       fetch(`/api/fiches?salleId=${salleId}`).then((r) => r.json()),
//       fetch(`/api/pesees?salleId=${salleId}`).then((r) => r.json()),
//     ]).then(([salleData, fichesData, peseesData]) => {
//       setSalle(salleData);
//       setFiches(fichesData);
//       setPesees(peseesData);
//     });
//   }

//   useEffect(() => {
//     fetch(`/api/bandes/${bandeId}`).then((r) => r.json()).then(setBande);
//     chargerDonnees().finally(() => setChargement(false));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [salleId, bandeId]);

//   async function soumettreFiche(e: FormEvent) {
//     e.preventDefault();
//     setErreur(null);

//     const payload = {
//       salleId,
//       date,
//       mortalite: Number(mortalite || 0),
//       alimentConsommeKg: alimentConsommeKg ? Number(alimentConsommeKg) : undefined,
//       eauConsommeeL: eauConsommeeL ? Number(eauConsommeeL) : undefined,
//       traitements: traitements || undefined,
//       observations: observations || undefined,
//       productionOeufs: productionOeufs ? Number(productionOeufs) : undefined,
//     };

//     try {
//       const reponse = await fetch("/api/fiches", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!reponse.ok) {
//         const data = await reponse.json();
//         setErreur(data.error ?? "Erreur lors de l'enregistrement");
//         return;
//       }
//       await chargerDonnees();
//     } catch {
//       // Pas de réseau : on enregistre localement, synchronisation automatique au retour de connexion
//       ajouterFicheEnAttente(payload);
//       setErreur(null);
//       alert("Pas de connexion : la fiche est enregistrée hors-ligne et sera synchronisée automatiquement.");
//     }

//     setMortalite("0");
//     setAlimentConsommeKg("");
//     setEauConsommeeL("");
//     setTraitements("");
//     setObservations("");
//     setProductionOeufs("");
//   }

//   async function soumettrePesee(e: FormEvent) {
//     e.preventDefault();
//     await fetch("/api/pesees", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ salleId, date: datePesee, poidsMoyenGrammes: Number(poidsMoyenGrammes) }),
//     });
//     setPoidsMoyenGrammes("");
//     await chargerDonnees();
//   }

//   if (chargement) return <div className="container"><p style={{ padding: "2rem" }}>Chargement...</p></div>;

//   const mortaliteCumulee = fiches.reduce((acc, f) => acc + f.mortalite, 0);
//   const effectifInitial = bande?.effectifInitial ?? 1;
//   const effectifVivant = Math.max(effectifInitial - mortaliteCumulee, 0);
//   const tauxMortalite = ((mortaliteCumulee / effectifInitial) * 100).toFixed(1);

//   return (
//     <div className="container">
//       <header className={styles.header}>
//         <Link href="/dashboard" className={styles.brand}><Logo /></Link>
//       </header>

//       <div className={styles.breadcrumb}>
//         <Link href="/dashboard">Mes fermes</Link> / <Link href={`/fermes/${fermeId}`}>Ferme</Link> /{" "}
//         <Link href={`/fermes/${fermeId}/bandes/${bandeId}`}>{bande?.nom}</Link> / {salle?.nom}
//       </div>

//       <div className={styles.titleRow}>
//         <h1>{salle?.nom}</h1>
//       </div>

//       <div className={styles.statsRow}>
//         <div className={styles.statCard}>
//           <div className={styles.statLabel}>Effectif vivant</div>
//           <div className={styles.statValue}>{effectifVivant}</div>
//         </div>
//         <div className={styles.statCard}>
//           <div className={styles.statLabel}>Mortalité cumulée</div>
//           <div className={styles.statValue}>{mortaliteCumulee}</div>
//         </div>
//         <div className={styles.statCard}>
//           <div className={styles.statLabel}>Taux de mortalité</div>
//           <div className={styles.statValue}>{tauxMortalite}%</div>
//         </div>
//         <div className={styles.statCard}>
//           <div className={styles.statLabel}>Capacité de la salle</div>
//           <div className={styles.statValue}>{salle?.capacite}</div>
//         </div>
//       </div>

//       <div className={styles.section}>
//         <div className={styles.sectionTitle}>Fiche de bilan du jour</div>
//         {erreur && <p style={{ color: "var(--color-danger)", marginBottom: "0.75rem" }}>{erreur}</p>}
//         <form className={styles.form} onSubmit={soumettreFiche}>
//           <div className={styles.field}>
//             <label>Date</label>
//             <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
//           </div>
//           <div className={styles.field}>
//             <label>Mortalité</label>
//             <input type="number" min={0} value={mortalite} onChange={(e) => setMortalite(e.target.value)} />
//           </div>
//           <div className={styles.field}>
//             <label>Aliment (kg)</label>
//             <input type="number" min={0} step="0.1" value={alimentConsommeKg} onChange={(e) => setAlimentConsommeKg(e.target.value)} />
//           </div>
//           <div className={styles.field}>
//             <label>Eau (L)</label>
//             <input type="number" min={0} step="0.1" value={eauConsommeeL} onChange={(e) => setEauConsommeeL(e.target.value)} />
//           </div>
//           {bande?.typeElevage === "ponte" && (
//             <div className={styles.field}>
//               <label>Œufs produits</label>
//               <input type="number" min={0} value={productionOeufs} onChange={(e) => setProductionOeufs(e.target.value)} />
//             </div>
//           )}
//           <div className={styles.field}>
//             <label>Traitements</label>
//             <input value={traitements} onChange={(e) => setTraitements(e.target.value)} />
//           </div>
//           <div className={styles.field}>
//             <label>Observations</label>
//             <input value={observations} onChange={(e) => setObservations(e.target.value)} />
//           </div>
//           <button className={styles.newBtn} type="submit">Enregistrer</button>
//         </form>
//       </div>

//       <div className={styles.section}>
//         <div className={styles.sectionTitle}>Pesée (fréquence libre)</div>
//         <form className={styles.form} onSubmit={soumettrePesee}>
//           <div className={styles.field}>
//             <label>Date</label>
//             <input type="date" required value={datePesee} onChange={(e) => setDatePesee(e.target.value)} />
//           </div>
//           <div className={styles.field}>
//             <label>Poids moyen (g)</label>
//             <input type="number" required min={0} value={poidsMoyenGrammes} onChange={(e) => setPoidsMoyenGrammes(e.target.value)} />
//           </div>
//           <button className={styles.newBtn} type="submit">Ajouter la pesée</button>
//         </form>
//       </div>

//       <div className={styles.section}>
//         <div className={styles.sectionTitle}>Statistiques</div>
//         <div className={styles.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
//           <CourbeCroissance pesees={pesees} />
//           <CourbeMortaliteCumulee fiches={fiches} effectifInitial={effectifInitial} />
//           {bande?.typeElevage === "ponte" && (
//             <CourbeTauxPonte fiches={fiches} effectifInitial={effectifInitial} />
//           )}
//           <CourbeConsommationParTete fiches={fiches} effectifInitial={effectifInitial} />
//         </div>
//       </div>

//       <div className={styles.section}>
//         <div className={styles.sectionTitle}>Historique des fiches ({fiches.length})</div>
//         {fiches.length === 0 ? (
//           <div className={styles.empty}>Aucune fiche saisie pour le moment.</div>
//         ) : (
//           <div style={{ overflowX: "auto" }}>
//             <table className={styles.table}>
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Mortalité</th>
//                   <th>Aliment (kg)</th>
//                   <th>Eau (L)</th>
//                   <th>Œufs</th>
//                   <th>Traitements</th>
//                   <th>Observations</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {[...fiches].reverse().map((f) => (
//                   <tr key={f._id}>
//                     <td>{new Date(f.date).toLocaleDateString("fr-FR")}</td>
//                     <td>{f.mortalite}</td>
//                     <td>{f.alimentConsommeKg ?? "—"}</td>
//                     <td>{f.eauConsommeeL ?? "—"}</td>
//                     <td>{f.productionOeufs ?? "—"}</td>
//                     <td>{f.traitements ?? "—"}</td>
//                     <td>{f.observations ?? "—"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import styles from "@/app/shared.module.css";
import { SalleNav } from "@/components/SalleNav";

interface Fiche { mortalite: number; }
interface Salle { _id: string; nom: string; capacite: number; effectifInitial: number; effectifVivant: number; }
interface Bande { _id: string; nom: string; }

export default function SalleDashboardPage() {
  const { fermeId, bandeId, salleId } = useParams<{ fermeId: string; bandeId: string; salleId: string }>();
  const [salle, setSalle] = useState<Salle | null>(null);
  const [bande, setBande] = useState<Bande | null>(null);
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/salles/${salleId}`).then((r) => r.json()),
      fetch(`/api/bandes/${bandeId}`).then((r) => r.json()),
      fetch(`/api/fiches?salleId=${salleId}`).then((r) => r.json()),
    ]).then(([s, b, f]) => { setSalle(s); setBande(b); setFiches(f); }).finally(() => setChargement(false));
  }, [salleId, bandeId]);

  if (chargement) return <div className="container"><p style={{ padding: "2rem" }}>Chargement...</p></div>;

  const effectifInitial = salle?.effectifInitial ?? 0;
  const effectifVivantEnregistre = salle?.effectifVivant;
  const mortaliteCumulee = fiches.reduce((acc, f) => acc + f.mortalite, 0);
  const effectifVivant = effectifVivantEnregistre ?? Math.max(effectifInitial - mortaliteCumulee, 0);
  const tauxMortalite = effectifInitial > 0
    ? ((mortaliteCumulee / effectifInitial) * 100).toFixed(1)
    : "—";

  return (
    <div className="container">
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand}><Logo /></Link>
      </header>
      <SalleNav />

      <div className={styles.breadcrumb}>
        <Link href="/dashboard">Mes fermes</Link> / <Link href={`/fermes/${fermeId}`}>Ferme</Link> /{" "}
        <Link href={`/fermes/${fermeId}/bandes/${bandeId}`}>{bande?.nom}</Link> / {salle?.nom}
      </div>

      <div className={styles.titleRow}><h1>{salle?.nom}</h1></div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Effectif vivant</div>
          <div className={styles.statValue}>{effectifVivant}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Mortalité cumulée</div>
          <div className={styles.statValue}>{mortaliteCumulee}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Taux de mortalité</div>
          <div className={styles.statValue}>{tauxMortalite}%</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Capacité de la salle</div>
          <div className={styles.statValue}>{salle?.capacite}</div>
        </div>
      </div>
    </div>
  );
}
