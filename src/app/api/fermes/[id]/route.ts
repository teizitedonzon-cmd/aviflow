import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  const ferme = await Ferme.findOne({ _id: id, producteurId });

  if (!ferme) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  return NextResponse.json(ferme);
}

export async function PUT(request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { nom, localisation } = await request.json();

  await connectToDatabase();
  const ferme = await Ferme.findOneAndUpdate(
    { _id: id, producteurId },
    { nom, localisation },
    { new: true }
  );

  if (!ferme) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  return NextResponse.json(ferme);
}

export async function DELETE(_request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();
  const ferme = await Ferme.findOneAndDelete({ _id: id, producteurId });

  if (!ferme) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
