import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#1f2a24" },
  headerBand: {
    backgroundColor: "#2f6d3c", color: "white", padding: 16, borderRadius: 6,
    marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 12,
  },
  headerLogo: { width: 36, height: 36 },
  headerTitle: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  headerSub: { fontSize: 10, opacity: 0.9 },
  sectionTitle: {
    fontSize: 13, fontWeight: 700, color: "#204d29", marginTop: 18, marginBottom: 8,
    borderBottom: "1.5 solid #2f6d3c", paddingBottom: 4,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  statBox: { backgroundColor: "#f7f8f4", border: "1 solid #e2e5df", borderRadius: 6, padding: 8, width: "23%" },
  statLabel: { fontSize: 7.5, color: "#5b6660", textTransform: "uppercase", marginBottom: 3 },
  statValue: { fontSize: 14, fontWeight: 700, color: "#204d29" },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 150, color: "#5b6660" },
  value: { fontWeight: 700 },
  footer: {
    position: "absolute", bottom: 24, left: 32, right: 32, fontSize: 8, color: "#5b6660",
    borderTop: "1 solid #e2e5df", paddingTop: 6, flexDirection: "row", justifyContent: "space-between",
  },
});

export interface RapportSalleProps {
  nomFerme: string;
  nomBande: string;
  nomSalle: string;
  typeElevage: "chair" | "ponte";
  dateRapport: string;
  effectifVivant: number;
  mortaliteJour: number;
  tauxMortaliteCumule: number;
  alimentConsommeKg?: number;
  eauConsommeeL?: number;
  productionOeufs?: number;
  tauxPonte?: number;
  traitements?: string;
  observations?: string;
  ficheSaisie: boolean;
  logoBase64?: string;
}

export function RapportSalle(props: RapportSalleProps) {
  const {
    nomFerme, nomBande, nomSalle, typeElevage, dateRapport, effectifVivant, mortaliteJour,
    tauxMortaliteCumule, alimentConsommeKg, eauConsommeeL, productionOeufs, tauxPonte,
    traitements, observations, ficheSaisie, logoBase64,
  } = props;

  return (
    <Document title={`Bilan journalier - ${nomSalle} - ${dateRapport}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          {logoBase64 && <Image src={logoBase64} style={styles.headerLogo} />}
          <View>
            <Text style={styles.headerTitle}>{nomSalle}</Text>
            <Text style={styles.headerSub}>{nomFerme} · {nomBande} · Bilan du {dateRapport}</Text>
          </View>
        </View>

        {!ficheSaisie && (
          <Text style={{ color: "#c0392b", marginBottom: 10 }}>
            Aucune fiche n&apos;a été saisie pour cette date.
          </Text>
        )}

        <Text style={styles.sectionTitle}>Bilan du jour</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Effectif vivant</Text>
            <Text style={styles.statValue}>{effectifVivant}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Mortalité du jour</Text>
            <Text style={styles.statValue}>{mortaliteJour}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Taux mortalité cumulé</Text>
            <Text style={styles.statValue}>{tauxMortaliteCumule.toFixed(1)}%</Text>
          </View>
          {typeElevage === "ponte" && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Taux de ponte</Text>
              <Text style={styles.statValue}>{tauxPonte?.toFixed(1) ?? "—"}%</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Détail</Text>
        <View style={styles.row}><Text style={styles.label}>Aliment consommé</Text><Text style={styles.value}>{alimentConsommeKg != null ? `${alimentConsommeKg} kg` : "—"}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Eau consommée</Text><Text style={styles.value}>{eauConsommeeL != null ? `${eauConsommeeL} L` : "—"}</Text></View>
        {typeElevage === "ponte" && (
          <View style={styles.row}><Text style={styles.label}>Production d&apos;œufs</Text><Text style={styles.value}>{productionOeufs ?? "—"}</Text></View>
        )}
        <View style={styles.row}><Text style={styles.label}>Traitements</Text><Text style={styles.value}>{traitements || "—"}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Observations</Text><Text style={styles.value}>{observations || "—"}</Text></View>

        <View style={styles.footer} fixed>
          <Text>Généré par AviFlow</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}