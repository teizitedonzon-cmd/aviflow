import { Schema, models, model, Types } from "mongoose";

export interface ISalle {
  _id: string;
  nom: string;
  capacite: number;
  /** Nombre de sujets réellement placés dans cette salle à sa création. */
  effectifInitial: number;
  /** Effectif restant après les mortalités effectivement enregistrées. */
  effectifVivant: number;
  equipements?: string;
  bandeId: Types.ObjectId;
  createdAt: Date;
}

const SalleSchema = new Schema<ISalle>(
  {
    nom: { type: String, required: true },
    capacite: { type: Number, required: true, min: 1 },
    // 0 est permis uniquement pour une ancienne salle migrée alors que toute
    // la bande était déjà distribuée. Les nouvelles salles reçoivent >= 1 sujet.
    effectifInitial: { type: Number, required: true, min: 0 },
    effectifVivant: { type: Number, required: true, min: 0 },
    equipements: { type: String },
    bandeId: { type: Schema.Types.ObjectId, ref: "Bande", required: true, index: true },
  },
  { timestamps: true }
);

export default models.Salle || model<ISalle>("Salle", SalleSchema);
