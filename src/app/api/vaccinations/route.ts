import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import Bande from "@/models/Bande";
import CalendrierVaccination from "@/models/CalendrierVaccination";

async function verifierProprieteBande(bandeId: string, producteurId: string) {
  const bande = await Bande.findById(bandeId);
  if (!bande) return null;
  const ferme = await Ferme.findOne({ _id: bande.fermeId, producteurId });
  return ferme ? bande : null;
}

export async function GET(request: Request) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bandeId = searchParams.get("bandeId");
  if (!bandeId) {
    return NextResponse.json({ error: "Le paramètre bandeId est requis" }, { status: 400 });
  }

  await connectToDatabase();

  if (!(await verifierProprieteBande(bandeId, producteurId))) {
    return NextResponse.json({ error: "Bande introuvable" }, { status: 404 });
  }

  const entrees = await CalendrierVaccination.find({ bandeId }).sort({ jourAge: 1 });
  return NextResponse.json(entrees);
}

export async function POST(request: Request) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { bandeId, jourAge, libelle } = await request.json();
  if (!bandeId || jourAge === undefined || !libelle) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  await connectToDatabase();

  if (!(await verifierProprieteBande(bandeId, producteurId))) {
    return NextResponse.json({ error: "Bande introuvable" }, { status: 404 });
  }

  const entree = await CalendrierVaccination.create({ bandeId, jourAge, libelle });
  return NextResponse.json(entree, { status: 201 });
}
