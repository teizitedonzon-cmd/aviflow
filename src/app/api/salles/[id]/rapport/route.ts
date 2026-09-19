import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import Bande from "@/models/Bande";
import Salle from "@/models/Salle";
import FicheBilanJournalier from "@/models/FicheBilanJournalier";
import { RapportSalle } from "@/lib/pdf/RapportSalle";

type Params = { params: Promise<{ id: string }> };

function chargerLogoBase64(): string | undefined {
  try {
    const cheminLogo = path.join(process.cwd(), "public", "logo.png");
    if (!fs.existsSync(cheminLogo)) return undefined;
    return `data:image/png;base64,${fs.readFileSync(cheminLogo).toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function GET(request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const dateCible = new Date(`${dateStr}T00:00:00.000Z`);
  const finJournee = new Date(`${dateStr}T23:59:59.999Z`);

  await connectToDatabase();

  const salle = await Salle.findById(id);
  if (!salle) return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });

  const bande = await Bande.findById(salle.bandeId);
  if (!bande) return NextResponse.json({ error: "Bande introuvable" }, { status: 404 });

  const ferme = await Ferme.findOne({ _id: bande.fermeId, producteurId });
  if (!ferme) return NextResponse.json({ error: "Accès refusé" }, { status: 404 });

  const fichesJusquaDate = await FicheBilanJournalier.find({ salleId: id, date: { $lte: finJournee } });
  const mortaliteCumulee = fichesJusquaDate.reduce((acc, f) => acc + f.mortalite, 0);
  const effectifVivant = Math.max(salle.effectifInitial - mortaliteCumulee, 0);
  const tauxMortaliteCumule = salle.effectifInitial > 0 ? (mortaliteCumulee / salle.effectifInitial) * 100 : 0;

  const ficheDuJour = await FicheBilanJournalier.findOne({ salleId: id, date: { $gte: dateCible, $lte: finJournee } });

  const dateLisible = new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  const buffer = await renderToBuffer(
    RapportSalle({
      nomFerme: ferme.nom,
      nomBande: bande.nom,
      nomSalle: salle.nom,
      typeElevage: bande.typeElevage,
      dateRapport: dateLisible,
      effectifVivant,
      mortaliteJour: ficheDuJour?.mortalite ?? 0,
      tauxMortaliteCumule,
      alimentConsommeKg: ficheDuJour?.alimentConsommeKg,
      eauConsommeeL: ficheDuJour?.eauConsommeeL,
      productionOeufs: ficheDuJour?.productionOeufs,
      tauxPonte: ficheDuJour?.productionOeufs != null && effectifVivant > 0
        ? (ficheDuJour.productionOeufs / effectifVivant) * 100 : undefined,
      traitements: ficheDuJour?.traitements,
      observations: ficheDuJour?.observations,
      ficheSaisie: !!ficheDuJour,
      logoBase64: chargerLogoBase64(),
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bilan-${salle.nom.replace(/\s+/g, "_")}-${dateStr}.pdf"`,
    },
  });
}