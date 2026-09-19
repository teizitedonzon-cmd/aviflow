import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import Bande from "@/models/Bande";
import Salle from "@/models/Salle";

async function verifierProprieteBande(bandeId: string, producteurId: string) {
  const bande = await Bande.findById(bandeId);
  if (!bande) return false;
  const ferme = await Ferme.findOne({ _id: bande.fermeId, producteurId });
  return !!ferme;
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

  const salles = await Salle.find({ bandeId }).sort({ createdAt: 1 });
  return NextResponse.json(salles);
}

export async function POST(request: Request) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { bandeId, nom, capacite, equipements } = await request.json();
  if (!bandeId || !nom || !capacite) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  await connectToDatabase();

  if (!(await verifierProprieteBande(bandeId, producteurId))) {
    return NextResponse.json({ error: "Bande introuvable" }, { status: 404 });
  }

  const salle = await Salle.create({ bandeId, nom, capacite, equipements });
  return NextResponse.json(salle, { status: 201 });
}
