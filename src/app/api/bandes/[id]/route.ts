import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import Bande from "@/models/Bande";

type Params = { params: Promise<{ id: string }> };

async function trouverBandeAutorisee(id: string, producteurId: string) {
  const bande = await Bande.findById(id);
  if (!bande) return null;
  const ferme = await Ferme.findOne({ _id: bande.fermeId, producteurId });
  return ferme ? bande : null;
}

export async function GET(_request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  const bande = await trouverBandeAutorisee(id, producteurId);

  if (!bande) {
    return NextResponse.json({ error: "Bande introuvable" }, { status: 404 });
  }

  return NextResponse.json(bande);
}

export async function PUT(request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const updates = await request.json();

  await connectToDatabase();
  const bandeExistante = await trouverBandeAutorisee(id, producteurId);

  if (!bandeExistante) {
    return NextResponse.json({ error: "Bande introuvable" }, { status: 404 });
  }

  const bande = await Bande.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json(bande);
}

export async function DELETE(_request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  const bandeExistante = await trouverBandeAutorisee(id, producteurId);

  if (!bandeExistante) {
    return NextResponse.json({ error: "Bande introuvable" }, { status: 404 });
  }

  await Bande.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
