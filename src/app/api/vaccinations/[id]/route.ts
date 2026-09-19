import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import Bande from "@/models/Bande";
import CalendrierVaccination from "@/models/CalendrierVaccination";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { statut } = await request.json();

  await connectToDatabase();

  const entree = await CalendrierVaccination.findById(id);
  if (!entree) {
    return NextResponse.json({ error: "Entrée introuvable" }, { status: 404 });
  }

  const bande = await Bande.findById(entree.bandeId);
  const ferme = bande ? await Ferme.findOne({ _id: bande.fermeId, producteurId }) : null;
  if (!ferme) {
    return NextResponse.json({ error: "Entrée introuvable" }, { status: 404 });
  }

  entree.statut = statut;
  entree.dateReelle = statut === "fait" ? new Date() : undefined;
  await entree.save();

  return NextResponse.json(entree);
}

export async function DELETE(_request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();

  const entree = await CalendrierVaccination.findById(id);
  if (!entree) {
    return NextResponse.json({ error: "Entrée introuvable" }, { status: 404 });
  }

  const bande = await Bande.findById(entree.bandeId);
  const ferme = bande ? await Ferme.findOne({ _id: bande.fermeId, producteurId }) : null;
  if (!ferme) {
    return NextResponse.json({ error: "Entrée introuvable" }, { status: 404 });
  }

  await CalendrierVaccination.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
