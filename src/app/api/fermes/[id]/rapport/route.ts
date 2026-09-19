// import { NextResponse } from "next/server";
// import { renderToBuffer } from "@react-pdf/renderer";
// import fs from "fs";
// import path from "path";
// import { connectToDatabase } from "@/lib/mongodb";
// import { getProducteurIdOuNull } from "@/lib/session";
// import Ferme from "@/models/Ferme";
// import Bande from "@/models/Bande";
// import Salle from "@/models/Salle";
// import FicheBilanJournalier from "@/models/FicheBilanJournalier";
// import { RapportJournalier, DetailSalle } from "@/lib/pdf/RapportJournalier";

// function chargerLogoBase64(): string | undefined {
//   try {
//     const cheminLogo = path.join(process.cwd(), "public", "logo.png");
//     if (!fs.existsSync(cheminLogo)) return undefined;
//     const buffer = fs.readFileSync(cheminLogo);
//     return `data:image/png;base64,${buffer.toString("base64")}`;
//   } catch {
//     return undefined;
//   }
// }

// type Params = { params: Promise<{ id: string }> };

// export async function GET(request: Request, { params }: Params) {
//   const producteurId = await getProducteurIdOuNull();
//   if (!producteurId) {
//     return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
//   }

//   const { id } = await params;
//   const { searchParams } = new URL(request.url);
//   const dateStr = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
//   const dateCible = new Date(`${dateStr}T00:00:00.000Z`);
//   const finJournee = new Date(`${dateStr}T23:59:59.999Z`);

//   await connectToDatabase();

//   const ferme = await Ferme.findOne({ _id: id, producteurId });
//   if (!ferme) {
//     return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
//   }

//   const bandes = await Bande.find({ fermeId: id, statut: "en_cours" });

//   const detailSalles: DetailSalle[] = [];
//   let effectifTotalVivant = 0;
//   let mortaliteTotaleJour = 0;
//   let mortaliteTotaleCumulee = 0;
//   let effectifInitialTotal = 0;
//   let alimentTotalKg = 0;
//   let eauTotaleL = 0;
//   let productionOeufsTotale = 0;

//   for (const bande of bandes) {
//     const salles = await Salle.find({ bandeId: bande._id });

//     for (const salle of salles) {
//       // Mortalité cumulée jusqu'à la date cible (incluse) pour calculer l'effectif vivant
//       const fichesJusquaDate = await FicheBilanJournalier.find({
//         salleId: salle._id,
//         date: { $lte: finJournee },
//       });
//       const mortaliteCumulee = fichesJusquaDate.reduce((acc, f) => acc + f.mortalite, 0);
//       const effectifVivant = Math.max(bande.effectifInitial - mortaliteCumulee, 0);

//       const ficheDuJour = await FicheBilanJournalier.findOne({
//         salleId: salle._id,
//         date: { $gte: dateCible, $lte: finJournee },
//       });

//       const alimentKg = ficheDuJour?.alimentConsommeKg;
//       const eauL = ficheDuJour?.eauConsommeeL;
//       const oeufs = ficheDuJour?.productionOeufs;

//       detailSalles.push({
//         nomSalle: salle.nom,
//         nomBande: bande.nom,
//         typeElevage: bande.typeElevage,
//         effectifVivant,
//         mortaliteJour: ficheDuJour?.mortalite ?? 0,
//         alimentConsommeKg: alimentKg,
//         eauConsommeeL: eauL,
//         alimentParTeteG: alimentKg != null && effectifVivant > 0 ? (alimentKg * 1000) / effectifVivant : undefined,
//         eauParTeteMl: eauL != null && effectifVivant > 0 ? (eauL * 1000) / effectifVivant : undefined,
//         productionOeufs: oeufs,
//         tauxPonte: oeufs != null && effectifVivant > 0 ? (oeufs / effectifVivant) * 100 : undefined,
//         traitements: ficheDuJour?.traitements,
//         observations: ficheDuJour?.observations,
//         ficheSaisie: !!ficheDuJour,
//       });

//       effectifTotalVivant += effectifVivant;
//       mortaliteTotaleJour += ficheDuJour?.mortalite ?? 0;
//       mortaliteTotaleCumulee += mortaliteCumulee;
//       effectifInitialTotal += bande.effectifInitial;
//       alimentTotalKg += alimentKg ?? 0;
//       eauTotaleL += eauL ?? 0;
//       productionOeufsTotale += oeufs ?? 0;
//     }
//   }

//   const tauxMortaliteCumule = effectifInitialTotal > 0 ? (mortaliteTotaleCumulee / effectifInitialTotal) * 100 : 0;

//   const dateLisible = new Date(dateStr).toLocaleDateString("fr-FR", {
//     day: "2-digit", month: "long", year: "numeric",
//   });

//   const buffer = await renderToBuffer(
//     RapportJournalier({
//       nomFerme: ferme.nom,
//       localisation: ferme.localisation,
//       dateRapport: dateLisible,
//       effectifTotalVivant,
//       mortaliteTotaleJour,
//       tauxMortaliteCumule,
//       alimentTotalKg,
//       eauTotaleL,
//       productionOeufsTotale,
//       salles: detailSalles,
//       logoBase64: chargerLogoBase64(),
//     })
//   );

//   return new NextResponse(new Uint8Array(buffer), {
//     headers: {
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename="bilan-${ferme.nom.replace(/\s+/g, "_")}-${dateStr}.pdf"`,
//     },
//   });
// }


import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/mongodb";
import { getProducteurIdOuNull } from "@/lib/session";
import Ferme from "@/models/Ferme";
import Bande from "@/models/Bande";
import Salle from "@/models/Salle";
import FicheBilanJournalier from "@/models/FicheBilanJournalier";
import { RapportJournalier, DetailSalle } from "@/lib/pdf/RapportJournalier";

function chargerLogoBase64(): string | undefined {
  try {
    const cheminLogo = path.join(process.cwd(), "public", "logo.png");
    if (!fs.existsSync(cheminLogo)) return undefined;
    const buffer = fs.readFileSync(cheminLogo);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return undefined;
  }
}

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const producteurId = await getProducteurIdOuNull();
  if (!producteurId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const dateCible = new Date(`${dateStr}T00:00:00.000Z`);
  const finJournee = new Date(`${dateStr}T23:59:59.999Z`);

  await connectToDatabase();

  const ferme = await Ferme.findOne({ _id: id, producteurId });
  if (!ferme) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  const bandes = await Bande.find({ fermeId: id, statut: "en_cours" });

  const detailSalles: DetailSalle[] = [];
  let effectifTotalVivant = 0;
  let mortaliteTotaleJour = 0;
  let mortaliteTotaleCumulee = 0;
  let effectifInitialTotal = 0;
  let alimentTotalKg = 0;
  let eauTotaleL = 0;
  let productionOeufsTotale = 0;

  for (const bande of bandes) {
    const salles = await Salle.find({ bandeId: bande._id });

    for (const salle of salles) {
      const fichesJusquaDate = await FicheBilanJournalier.find({
        salleId: salle._id,
        date: { $lte: finJournee },
      });
      const mortaliteCumulee = fichesJusquaDate.reduce((acc, f) => acc + f.mortalite, 0);
      const effectifVivant = Math.max(salle.effectifInitial - mortaliteCumulee, 0);

      const ficheDuJour = await FicheBilanJournalier.findOne({
        salleId: salle._id,
        date: { $gte: dateCible, $lte: finJournee },
      });

      const alimentKg = ficheDuJour?.alimentConsommeKg;
      const eauL = ficheDuJour?.eauConsommeeL;
      const oeufs = ficheDuJour?.productionOeufs;

      detailSalles.push({
        nomSalle: salle.nom,
        nomBande: bande.nom,
        typeElevage: bande.typeElevage,
        effectifVivant,
        mortaliteJour: ficheDuJour?.mortalite ?? 0,
        alimentConsommeKg: alimentKg,
        eauConsommeeL: eauL,
        alimentParTeteG: alimentKg != null && effectifVivant > 0 ? (alimentKg * 1000) / effectifVivant : undefined,
        eauParTeteMl: eauL != null && effectifVivant > 0 ? (eauL * 1000) / effectifVivant : undefined,
        productionOeufs: oeufs,
        tauxPonte: oeufs != null && effectifVivant > 0 ? (oeufs / effectifVivant) * 100 : undefined,
        traitements: ficheDuJour?.traitements,
        observations: ficheDuJour?.observations,
        ficheSaisie: !!ficheDuJour,
      });

      effectifTotalVivant += effectifVivant;
      mortaliteTotaleJour += ficheDuJour?.mortalite ?? 0;
      mortaliteTotaleCumulee += mortaliteCumulee;
      effectifInitialTotal += salle.effectifInitial;
      alimentTotalKg += alimentKg ?? 0;
      eauTotaleL += eauL ?? 0;
      productionOeufsTotale += oeufs ?? 0;
    }
  }

  const tauxMortaliteCumule = effectifInitialTotal > 0 ? (mortaliteTotaleCumulee / effectifInitialTotal) * 100 : 0;

  const dateLisible = new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const buffer = await renderToBuffer(
    RapportJournalier({
      nomFerme: ferme.nom,
      localisation: ferme.localisation,
      dateRapport: dateLisible,
      effectifTotalVivant,
      mortaliteTotaleJour,
      tauxMortaliteCumule,
      alimentTotalKg,
      eauTotaleL,
      productionOeufsTotale,
      salles: detailSalles,
      logoBase64: chargerLogoBase64(),
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bilan-${ferme.nom.replace(/\s+/g, "_")}-${dateStr}.pdf"`,
    },
  });
}