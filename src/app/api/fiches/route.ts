import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import Bande from "@/models/Bande";
import Salle from "@/models/Salle";
import FicheBilanJournalier from "@/models/FicheBilanJournalier";
import { envoyerAlertePush } from "@/lib/webpush";
import { migrerEffectifsSalles } from "@/lib/repartirEffectifs";

// Seuil au-delà duquel une mortalité journalière est considérée anormale
const SEUIL_TAUX_MORTALITE_JOUR = 0.01; // 1% de l'effectif vivant en une journée

async function verifierProprieteSalle(salleId: string, producteurId: string) {
  const salle = await Salle.findById(salleId);
  if (!salle) return false;
  const bande = await Bande.findById(salle.bandeId);
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
  const salleId = searchParams.get("salleId");
  if (!salleId) {
    return NextResponse.json({ error: "Le paramètre salleId est requis" }, { status: 400 });
  }

  await connectToDatabase();

  if (!(await verifierProprieteSalle(salleId, producteurId))) {
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
  }

  const sallePourMigration = await Salle.findById(salleId).select("bandeId").lean();
  if (sallePourMigration) await migrerEffectifsSalles(sallePourMigration.bandeId.toString());

  const fiches = await FicheBilanJournalier.find({ salleId }).sort({ date: 1 });
  return NextResponse.json(fiches);
}

export async function POST(request: Request) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { salleId, date, mortalite, alimentConsommeKg, eauConsommeeL, traitements, observations, productionOeufs } = body;

  if (!salleId || !date) {
    return NextResponse.json({ error: "salleId et date sont requis" }, { status: 400 });
  }

  await connectToDatabase();

  if (!(await verifierProprieteSalle(salleId, producteurId))) {
    return NextResponse.json({ error: "Salle introuvable" }, { status: 404 });
  }

  const sallePourMigration = await Salle.findById(salleId).select("bandeId").lean();
  if (sallePourMigration) await migrerEffectifsSalles(sallePourMigration.bandeId.toString());
  const mortaliteNombre = Number(mortalite ?? 0);
  if (!Number.isInteger(mortaliteNombre) || mortaliteNombre < 0) {
    return NextResponse.json({ error: "La mortalité doit être un nombre entier positif" }, { status: 400 });
  }

  try {
    const fiche = await FicheBilanJournalier.create({
      salleId,
      date,
      mortalite: mortaliteNombre,
      alimentConsommeKg,
      eauConsommeeL,
      traitements,
      observations,
      productionOeufs,
    });

    // Décrément atomique : impossible d'enregistrer plus de morts que de sujets vivants.
    if (mortaliteNombre > 0) {
      const salleMiseAJour = await Salle.findOneAndUpdate(
        { _id: salleId, effectifVivant: { $gte: mortaliteNombre } },
        { $inc: { effectifVivant: -mortaliteNombre } },
        { new: true }
      );
      if (!salleMiseAJour) {
        await FicheBilanJournalier.findByIdAndDelete(fiche._id);
        return NextResponse.json(
          { error: "La mortalité saisie dépasse l'effectif vivant de la salle" },
          { status: 400 }
        );
      }
    }

    // Alerte automatique si la mortalité du jour dépasse le seuil défini
    if (mortaliteNombre > 0) {
      const salle = await Salle.findById(salleId);
      const bande = await Bande.findById(salle.bandeId);
      const ferme = await Ferme.findById(bande.fermeId);

      const fichesAnterieures = await FicheBilanJournalier.find({
        salleId,
        date: { $lt: new Date(date) },
      });
      const mortaliteAnterieure = fichesAnterieures.reduce((acc, f) => acc + f.mortalite, 0);
      const effectifVivantAvant = Math.max(bande.effectifInitial - mortaliteAnterieure, 1);
      const tauxJour = mortaliteNombre / effectifVivantAvant;

      if (tauxJour > SEUIL_TAUX_MORTALITE_JOUR) {
        await envoyerAlertePush(
          ferme.producteurId.toString(),
          "⚠️ Mortalité anormale détectée",
          `${salle.nom} (${bande.nom}) : ${mortaliteNombre} morts aujourd'hui, soit ${(tauxJour * 100).toFixed(1)}% de l'effectif vivant.`
        );
      }
    }

    return NextResponse.json(fiche, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json(
        { error: "Une fiche existe déjà pour cette salle à cette date" },
        { status: 409 }
      );
    }
    throw error;
  }
}
