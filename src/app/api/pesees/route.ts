import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import Bande from "@/models/Bande";
import Salle from "@/models/Salle";
import Pesee from "@/models/Pesee";

async function verifierProprieteSalle(salleId: string, producteurId: string) {
  const salle = await Salle.findById(salleId);
  if (!salle) return false;
  const bande = await Bande.findById(salle.bandeId);
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
  const salleId = searchParams.get("salleId");
  if (!salleId) {
    return NextResponse.json({ error: "Le paramètre salleId est requis" }, { status: 400 });
  }

  await connectToDatabase();

  if (!(await verifierProprieteSalle(salleId, producteurId))) {
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
  }

  const pesees = await Pesee.find({ salleId }).sort({ date: 1 });
  return NextResponse.json(pesees);
}

export async function POST(request: Request) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { salleId, date, poidsMoyenGrammes } = await request.json();
  if (!salleId || !date || !poidsMoyenGrammes) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  await connectToDatabase();

  if (!(await verifierProprieteSalle(salleId, producteurId))) {
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
  }

  const pesee = await Pesee.create({ salleId, date, poidsMoyenGrammes });
  return NextResponse.json(pesee, { status: 201 });
}
