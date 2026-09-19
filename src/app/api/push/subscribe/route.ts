import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import PushSubscription from "@/models/PushSubscription";

export async function POST(request: Request) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { endpoint, keys } = await request.json();
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Abonnement invalide" }, { status: 400 });
  }

  await connectToDatabase();
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { producteurId, endpoint, keys },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}
