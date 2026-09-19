import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";

export async function GET() {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  await connectToDatabase();
  const fermes = await Ferme.find({ producteurId }).sort({ createdAt: -1 });
  return NextResponse.json(fermes);
}

export async function POST(request: Request) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { nom, localisation } = await request.json();
  if (!nom) {
    return NextResponse.json({ error: "Le nom de la ferme est requis" }, { status: 400 });
  }

  await connectToDatabase();
  const ferme = await Ferme.create({ nom, localisation, producteurId });
  return NextResponse.json(ferme, { status: 201 });
}
