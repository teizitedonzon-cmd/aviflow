import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import { FermeVeterinaire } from "@/models/Veterinaire";

type Params = { params: Promise<{ id: string }> };

async function verifierProprieteFerme(fermeId: string, producteurId: string) {
  const ferme = await Ferme.findOne({ _id: fermeId, producteurId });
  return !!ferme;
}

export async function GET(_request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();

  if (!(await verifierProprieteFerme(id, producteurId))) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  const liaisons = await FermeVeterinaire.find({ fermeId: id, actif: true }).populate("veterinaireId");
  return NextResponse.json(liaisons);
}

export async function POST(request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { veterinaireId } = await request.json();

  await connectToDatabase();

  if (!(await verifierProprieteFerme(id, producteurId))) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  const liaison = await FermeVeterinaire.findOneAndUpdate(
    { fermeId: id, veterinaireId },
    { actif: true },
    { upsert: true, new: true }
  ).populate("veterinaireId");

  return NextResponse.json(liaison, { status: 201 });
}
