import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import { FermeVeterinaire } from "@/models/Veterinaire";

type Params = { params: Promise<{ id: string; veterinaireId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id, veterinaireId } = await params;
  await connectToDatabase();

  const ferme = await Ferme.findOne({ _id: id, producteurId });
  if (!ferme) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  await FermeVeterinaire.findOneAndUpdate({ fermeId: id, veterinaireId }, { actif: false });
  return NextResponse.json({ success: true });
}
