import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import Bande from "@/models/Bande";

async function verifierProprieteFerme(fermeId: string, producteurId: string) {
  const ferme = await Ferme.findOne({ _id: fermeId, producteurId });
  return !!ferme;
}

export async function GET(request: Request) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fermeId = searchParams.get("fermeId");
  if (!fermeId) {
    return NextResponse.json({ error: "Le paramètre fermeId est requis" }, { status: 400 });
  }

  await connectToDatabase();

  if (!(await verifierProprieteFerme(fermeId, producteurId))) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  const bandes = await Bande.find({ fermeId }).sort({ dateMiseEnPlace: -1 });
  return NextResponse.json(bandes);
}

export async function POST(request: Request) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { fermeId, nom, race, typeElevage, effectifInitial, dateMiseEnPlace, poidsInitial, fournisseur } = body;

  if (!fermeId || !nom || !race || !typeElevage || !effectifInitial || !dateMiseEnPlace) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  await connectToDatabase();

  if (!(await verifierProprieteFerme(fermeId, producteurId))) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  const bande = await Bande.create({
    fermeId,
    nom,
    race,
    typeElevage,
    effectifInitial,
    dateMiseEnPlace,
    poidsInitial,
    fournisseur,
  });

  return NextResponse.json(bande, { status: 201 });
}
