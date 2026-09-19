import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import { Veterinaire } from "@/models/Veterinaire";

// GET: répertoire public de vétérinaires (visible par tout producteur connecté)
export async function GET() {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  await connectToDatabase();
  const veterinaires = await Veterinaire.find({ visiblePublic: true }).sort({ nom: 1 });
  return NextResponse.json(veterinaires);
}

// POST: ajouter un nouveau vétérinaire au répertoire (n'importe quel producteur peut en référencer un)
export async function POST(request: Request) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { nom, telephone, email, zoneCouverture, specialite } = await request.json();
  if (!nom) {
    return NextResponse.json({ error: "Le nom du vétérinaire est requis" }, { status: 400 });
  }

  await connectToDatabase();
  const veterinaire = await Veterinaire.create({ nom, telephone, email, zoneCouverture, specialite });
  return NextResponse.json(veterinaire, { status: 201 });
}
