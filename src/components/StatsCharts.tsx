"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Fiche {
  date: string;
  mortalite: number;
  alimentConsommeKg?: number;
  eauConsommeeL?: number;
  productionOeufs?: number;
}

interface Pesee {
  date: string;
  poidsMoyenGrammes: number;
}

const COLOR_PRIMARY = "#2f6d3c";
const COLOR_ACCENT = "#d97706";

function formatDateCourt(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      padding: "1.25rem",
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.95rem" }}>{title}</div>
      <ResponsiveContainer width="100%" height={220}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

export function CourbeCroissance({ pesees }: { pesees: Pesee[] }) {
  const data = pesees.map((p) => ({ date: formatDateCourt(p.date), poids: p.poidsMoyenGrammes }));
  return (
    <ChartCard title="Courbe de croissance (poids moyen en g)">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e5df" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Line type="monotone" dataKey="poids" stroke={COLOR_PRIMARY} strokeWidth={2} dot={false} />
      </LineChart>
    </ChartCard>
  );
}

export function CourbeMortaliteCumulee({ fiches, effectifInitial }: { fiches: Fiche[]; effectifInitial: number }) {
  let cumul = 0;
  const data = fiches.map((f) => {
    cumul += f.mortalite;
    return {
      date: formatDateCourt(f.date),
      taux: Number(((cumul / effectifInitial) * 100).toFixed(2)),
    };
  });
  return (
    <ChartCard title="Taux de mortalité cumulé (%)">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e5df" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Line type="monotone" dataKey="taux" stroke="#c0392b" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartCard>
  );
}

export function CourbeTauxPonte({ fiches, effectifInitial }: { fiches: Fiche[]; effectifInitial: number }) {
  let mortaliteCumulee = 0;
  const data = fiches.map((f) => {
    mortaliteCumulee += f.mortalite;
    const effectifVivant = Math.max(effectifInitial - mortaliteCumulee, 1);
    const taux = f.productionOeufs != null ? (f.productionOeufs / effectifVivant) * 100 : null;
    return { date: formatDateCourt(f.date), taux: taux != null ? Number(taux.toFixed(1)) : null };
  });
  return (
    <ChartCard title="Taux de ponte (%)">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e5df" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Line type="monotone" dataKey="taux" stroke={COLOR_ACCENT} strokeWidth={2} dot={false} connectNulls />
      </LineChart>
    </ChartCard>
  );
}

export function CourbeConsommationParTete({ fiches, effectifInitial }: { fiches: Fiche[]; effectifInitial: number }) {
  let mortaliteCumulee = 0;
  const data = fiches.map((f) => {
    mortaliteCumulee += f.mortalite;
    const effectifVivant = Math.max(effectifInitial - mortaliteCumulee, 1);
    return {
      date: formatDateCourt(f.date),
      alimentG: f.alimentConsommeKg != null ? Number(((f.alimentConsommeKg * 1000) / effectifVivant).toFixed(1)) : null,
      eauMl: f.eauConsommeeL != null ? Number(((f.eauConsommeeL * 1000) / effectifVivant).toFixed(1)) : null,
    };
  });
  return (
    <ChartCard title="Aliment (g) et eau (ml) par sujet / jour">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e5df" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Line type="monotone" dataKey="alimentG" name="Aliment (g/tête)" stroke={COLOR_PRIMARY} strokeWidth={2} dot={false} connectNulls />
        <Line type="monotone" dataKey="eauMl" name="Eau (ml/tête)" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
      </LineChart>
    </ChartCard>
  );
}
