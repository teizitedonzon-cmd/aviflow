import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import Bande from "@/models/Bande";
import Salle from "@/models/Salle";
import FicheBilanJournalier from "@/models/FicheBilanJournalier";

type Params = { params: Promise<{ id: string }> };

async function trouverFicheAutorisee(id: string, producteurId: string) {
  const fiche = await FicheBilanJournalier.findById(id);
  if (!fiche) return null;
  const salle = await Salle.findById(fiche.salleId);
  if (!salle) return null;
  const bande = await Bande.findById(salle.bandeId);
  if (!bande) return null;
  const ferme = await Ferme.findOne({ _id: bande.fermeId, producteurId });
  return ferme ? fiche : null;
}

export async function PUT(request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  await connectToDatabase();
  const ficheExistante = await trouverFicheAutorisee(id, producteurId);

  if (!ficheExistante) {
    return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  for (const champ of ["mortalite", "alimentConsommeKg", "eauConsommeeL", "traitements", "observations", "productionOeufs"]) {
    if (body[champ] !== undefined) updates[champ] = body[champ];
  }
  const fiche = await FicheBilanJournalier.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  return NextResponse.json(fiche);
}

export async function DELETE(_request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  const ficheExistante = await trouverFicheAutorisee(id, producteurId);

  if (!ficheExistante) {
    return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });
  }

  await FicheBilanJournalier.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
