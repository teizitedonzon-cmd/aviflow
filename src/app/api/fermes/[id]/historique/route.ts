import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import Bande from "@/models/Bande";
import Salle from "@/models/Salle";
import FicheBilanJournalier from "@/models/FicheBilanJournalier";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();

  const ferme = await Ferme.findOne({ _id: id, producteurId });
  if (!ferme) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  const bandes = await Bande.find({ fermeId: id });
  const bandesParId = new Map(bandes.map((b) => [b._id.toString(), b]));

  const salles = await Salle.find({ bandeId: { $in: bandes.map((b) => b._id) } });
  const sallesParId = new Map(salles.map((s) => [s._id.toString(), s]));

  const fiches = await FicheBilanJournalier.find({
    salleId: { $in: salles.map((s) => s._id) },
  }).sort({ date: 1 });

  // Regroupement par date : totaux de toute la ferme, tous salles/bandes confondus
  const parDate = new Map<string, {
    date: string; mortalite: number; alimentKg: number; eauL: number; oeufs: number;
  }>();

  for (const f of fiches) {
    const cle = new Date(f.date).toISOString().slice(0, 10);
    const entree = parDate.get(cle) ?? { date: cle, mortalite: 0, alimentKg: 0, eauL: 0, oeufs: 0 };
    entree.mortalite += f.mortalite;
    entree.alimentKg += f.alimentConsommeKg ?? 0;
    entree.eauL += f.eauConsommeeL ?? 0;
    entree.oeufs += f.productionOeufs ?? 0;
    parDate.set(cle, entree);
  }

  const historique = Array.from(parDate.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Détail brut également renvoyé, utile pour un futur filtre par bande/salle
  const detail = fiches.map((f) => {
    const salle = sallesParId.get(f.salleId.toString());
    const bande = salle ? bandesParId.get(salle.bandeId.toString()) : undefined;
    return {
      date: f.date,
      nomSalle: salle?.nom ?? "—",
      nomBande: bande?.nom ?? "—",
      mortalite: f.mortalite,
      alimentConsommeKg: f.alimentConsommeKg,
      eauConsommeeL: f.eauConsommeeL,
      productionOeufs: f.productionOeufs,
      traitements: f.traitements,
      observations: f.observations,
    };
  });

  return NextResponse.json({ historique, detail });
}