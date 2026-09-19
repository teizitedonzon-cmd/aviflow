import { NextResponse } from "next/server";
import mongoose from "mongoose";
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
  const capaciteNombre = Number(capacite);
  if (!bandeId || !nom?.trim() || !Number.isInteger(capaciteNombre) || capaciteNombre < 1) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  await connectToDatabase();
  const session = await mongoose.startSession();

  try {
    let salleCreee: unknown = null;
    let erreur: string | null = null;

    await session.withTransaction(async () => {
      const bande = await Bande.findById(bandeId).session(session);
      if (!bande) {
        erreur = "Bande introuvable";
        return;
      }

      const ferme = await Ferme.findOne({ _id: bande.fermeId, producteurId }).session(session);
      if (!ferme) {
        erreur = "Bande introuvable";
        return;
      }

      const salles = await Salle.find({ bandeId }).select("effectifInitial").session(session);
      const effectifDejaAttribue = salles.reduce((total, salle) => total + (salle.effectifInitial ?? 0), 0);
      const effectifRestant = bande.effectifInitial - effectifDejaAttribue;

      if (effectifRestant <= 0) {
        erreur = "Tous les sujets de cette bande sont déjà attribués à des salles";
        return;
      }

      const effectifInitial = Math.min(capaciteNombre, effectifRestant);
      salleCreee = await Salle.create([{
        bandeId,
        nom: nom.trim(),
        capacite: capaciteNombre,
        effectifInitial,
        equipements: typeof equipements === "string" ? equipements.trim() || undefined : undefined,
      }], { session }).then(([salle]) => salle);
    });

    if (erreur) {
      return NextResponse.json({ error: erreur }, { status: 400 });
    }
    return NextResponse.json(salleCreee, { status: 201 });
  } finally {
    await session.endSession();
  }
}
