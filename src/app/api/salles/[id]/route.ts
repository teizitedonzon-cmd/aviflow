import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import Bande from "@/models/Bande";
import Salle from "@/models/Salle";
import FicheBilanJournalier from "@/models/FicheBilanJournalier";
import Pesee from "@/models/Pesee";

type Params = { params: Promise<{ id: string }> };

async function trouverSalleAutorisee(id: string, producteurId: string) {
  const salle = await Salle.findById(id);
  if (!salle) return null;
  const bande = await Bande.findById(salle.bandeId);
  if (!bande) return null;
  const ferme = await Ferme.findOne({ _id: bande.fermeId, producteurId });
  return ferme ? salle : null;
}

export async function GET(_request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  const salle = await trouverSalleAutorisee(id, producteurId);

  if (!salle) {
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
  }

  return NextResponse.json(salle);
}

export async function PUT(request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  await connectToDatabase();
  const salleExistante = await trouverSalleAutorisee(id, producteurId);

  if (!salleExistante) {
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
  }

  const updates: Record<string, string | number | undefined> = {};
  if (typeof body.nom === "string" && body.nom.trim()) updates.nom = body.nom.trim();
  if (typeof body.equipements === "string") updates.equipements = body.equipements.trim() || undefined;
  if (body.capacite !== undefined) {
    const capacite = Number(body.capacite);
    if (!Number.isInteger(capacite) || capacite < salleExistante.effectifInitial) {
      return NextResponse.json(
        { error: "La capacité doit être un entier au moins égal à l'effectif attribué" },
        { status: 400 }
      );
    }
    updates.capacite = capacite;
  }

  const salle = await Salle.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  return NextResponse.json(salle);
}

export async function DELETE(_request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  const salleExistante = await trouverSalleAutorisee(id, producteurId);

  if (!salleExistante) {
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
  }

  await Promise.all([
    FicheBilanJournalier.deleteMany({ salleId: id }),
    Pesee.deleteMany({ salleId: id }),
  ]);
  await Salle.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
