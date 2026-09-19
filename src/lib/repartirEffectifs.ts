// import Bande from "@/models/Bande";
// import Salle from "@/models/Salle";
// import FicheBilanJournalier from "@/models/FicheBilanJournalier";

// /** Répare les salles créées avant l'ajout d'effectifInitial. */
// export async function migrerEffectifsSalles(bandeId: string) {
//   const bande = await Bande.findById(bandeId).select("effectifInitial").lean();
//   if (!bande) return;

//   const salles = await Salle.find({ bandeId }).sort({ createdAt: 1 }).lean();
//   // Une salle créée avec la nouvelle règle reçoit toujours au moins un sujet.
//   // Une valeur absente ou à 0 révèle donc une ancienne répartition incomplète.
//   if (salles.every((salle) => salle.effectifInitial !== undefined && salle.effectifInitial > 0 && salle.effectifVivant !== undefined)) return;

//   let restant = bande.effectifInitial;
//   const mortalites = await FicheBilanJournalier.aggregate<{ _id: unknown; total: number }>([
//     { $match: { salleId: { $in: salles.map((salle) => salle._id) } } },
//     { $group: { _id: "$salleId", total: { $sum: "$mortalite" } } },
//   ]);
//   const mortalitesParSalle = new Map(mortalites.map((item) => [item._id.toString(), item.total]));
//   const operations = salles.map((salle) => {
//     const effectifInitial = Math.min(salle.capacite, Math.max(restant, 0));
//     restant -= effectifInitial;
//     const effectifVivant = Math.max(effectifInitial - (mortalitesParSalle.get(salle._id.toString()) ?? 0), 0);
//     return {
//       updateOne: {
//         filter: { _id: salle._id },
//         update: { $set: { effectifInitial, effectifVivant } },
//       },
//     };
//   });
//   if (operations.length) await Salle.bulkWrite(operations);
// }

import Bande from "@/models/Bande";
import Salle from "@/models/Salle";
import FicheBilanJournalier from "@/models/FicheBilanJournalier";
import { Types } from "mongoose";

/** Répare les salles créées avant l'ajout d'effectifInitial. */
export async function migrerEffectifsSalles(bandeId: string) {
  const bande = await Bande.findById(bandeId).select("effectifInitial").lean();
  if (!bande) return;

  const salles = await Salle.find({ bandeId }).sort({ createdAt: 1 }).lean();
  // Une salle créée avec la nouvelle règle reçoit toujours au moins un sujet.
  // Une valeur absente ou à 0 révèle donc une ancienne répartition incomplète.
  if (
    salles.every(
      (salle) =>
        salle.effectifInitial !== undefined &&
        salle.effectifInitial > 0 &&
        salle.effectifVivant !== undefined
    )
  )
    return;

  let restant = bande.effectifInitial;
  const mortalites = await FicheBilanJournalier.aggregate<{
    _id: Types.ObjectId;
    total: number;
  }>([
    { $match: { salleId: { $in: salles.map((salle) => salle._id) } } },
    { $group: { _id: "$salleId", total: { $sum: "$mortalite" } } },
  ]);

  const mortalitesParSalle = new Map(
    mortalites.map((item) => [item._id.toString(), item.total])
  );

  const operations = salles.map((salle) => {
    const effectifInitial = Math.min(salle.capacite, Math.max(restant, 0));
    restant -= effectifInitial;
    const effectifVivant = Math.max(
      effectifInitial - (mortalitesParSalle.get(salle._id.toString()) ?? 0),
      0
    );
    return {
      updateOne: {
        filter: { _id: salle._id },
        update: { $set: { effectifInitial, effectifVivant } },
      },
    };
  });

  if (operations.length) await Salle.bulkWrite(operations);
}