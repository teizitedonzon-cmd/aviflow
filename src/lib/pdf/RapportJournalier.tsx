import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#1f2a24" },
  headerBand: {
    backgroundColor: "#2f6d3c",
    color: "white",
    padding: 16,
    borderRadius: 6,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLogo: { width: 36, height: 36 },
  headerTexts: { flexDirection: "column" },
  headerTitle: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  headerSub: { fontSize: 10, opacity: 0.9 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#204d29",
    marginTop: 18,
    marginBottom: 8,
    borderBottom: "1.5 solid #2f6d3c",
    paddingBottom: 4,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  statBox: {
    backgroundColor: "#f7f8f4",
    border: "1 solid #e2e5df",
    borderRadius: 6,
    padding: 8,
    width: "23%",
  },
  statLabel: { fontSize: 7.5, color: "#5b6660", textTransform: "uppercase", marginBottom: 3 },
  statValue: { fontSize: 14, fontWeight: 700, color: "#204d29" },
  salleBox: {
    border: "1 solid #e2e5df",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  salleTitle: { fontSize: 11, fontWeight: 700, marginBottom: 6, color: "#2f6d3c" },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 130, color: "#5b6660" },
  value: { fontWeight: 700 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#5b6660",
    borderTop: "1 solid #e2e5df",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export interface DetailSalle {
  nomSalle: string;
  nomBande: string;
  typeElevage: "chair" | "ponte";
  effectifVivant: number;
  mortaliteJour: number;
  alimentConsommeKg?: number;
  eauConsommeeL?: number;
  alimentParTeteG?: number;
  eauParTeteMl?: number;
  productionOeufs?: number;
  tauxPonte?: number;
  traitements?: string;
  observations?: string;
  ficheSaisie: boolean;
}

export interface RapportJournalierProps {
  nomFerme: string;
  localisation?: string;
  dateRapport: string; // format lisible
  effectifTotalVivant: number;
  mortaliteTotaleJour: number;
  tauxMortaliteCumule: number;
  alimentTotalKg: number;
  eauTotaleL: number;
  productionOeufsTotale: number;
  salles: DetailSalle[];
  logoBase64?: string; // data URI (ex: "data:image/png;base64,...."), optionnel
}

export function RapportJournalier(props: RapportJournalierProps) {
  const {
    nomFerme, localisation, dateRapport, effectifTotalVivant, mortaliteTotaleJour,
    tauxMortaliteCumule, alimentTotalKg, eauTotaleL, productionOeufsTotale, salles, logoBase64,
  } = props;

  return (
    <Document title={`Bilan journalier - ${nomFerme} - ${dateRapport}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          {logoBase64 && <Image src={logoBase64} style={styles.headerLogo} />}
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>{nomFerme}</Text>
            <Text style={styles.headerSub}>
              {localisation ? `${localisation} · ` : ""}Bilan journalier du {dateRapport}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Bilan global de la ferme</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Effectif vivant</Text>
            <Text style={styles.statValue}>{effectifTotalVivant}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Mortalité du jour</Text>
            <Text style={styles.statValue}>{mortaliteTotaleJour}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Taux mortalité cumulé</Text>
            <Text style={styles.statValue}>{tauxMortaliteCumule.toFixed(1)}%</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Aliment total</Text>
            <Text style={styles.statValue}>{alimentTotalKg.toFixed(1)} kg</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Eau totale</Text>
            <Text style={styles.statValue}>{eauTotaleL.toFixed(1)} L</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Œufs produits</Text>
            <Text style={styles.statValue}>{productionOeufsTotale}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Détail par salle</Text>
        {salles.map((s, i) => (
          <View key={i} style={styles.salleBox} wrap={false}>
            <Text style={styles.salleTitle}>{s.nomSalle} — {s.nomBande} ({s.typeElevage})</Text>
            {!s.ficheSaisie && (
              <Text style={{ color: "#c0392b", marginBottom: 4 }}>Aucune fiche saisie pour cette date</Text>
            )}
            <View style={styles.row}><Text style={styles.label}>Effectif vivant</Text><Text style={styles.value}>{s.effectifVivant}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Mortalité du jour</Text><Text style={styles.value}>{s.mortaliteJour}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Aliment consommé</Text><Text style={styles.value}>{s.alimentConsommeKg != null ? `${s.alimentConsommeKg} kg (${s.alimentParTeteG?.toFixed(1)} g/tête)` : "—"}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Eau consommée</Text><Text style={styles.value}>{s.eauConsommeeL != null ? `${s.eauConsommeeL} L (${s.eauParTeteMl?.toFixed(1)} ml/tête)` : "—"}</Text></View>
            {s.typeElevage === "ponte" && (
              <View style={styles.row}><Text style={styles.label}>Production d&apos;œufs</Text><Text style={styles.value}>{s.productionOeufs ?? "—"} ({s.tauxPonte?.toFixed(1) ?? "—"}%)</Text></View>
            )}
            <View style={styles.row}><Text style={styles.label}>Traitements</Text><Text style={styles.value}>{s.traitements || "—"}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Observations</Text><Text style={styles.value}>{s.observations || "—"}</Text></View>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text>Généré par AviFlow</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
