import { Schema, models, model, Types } from "mongoose";

export type TypeElevage = "chair" | "ponte";
export type StatutBande = "en_cours" | "cloturee";

export interface IBande {
  _id: string;
  nom: string;
  race: string;
  typeElevage: TypeElevage;
  effectifInitial: number;
  dateMiseEnPlace: Date;
  poidsInitial?: number;
  fournisseur?: string;
  statut: StatutBande;
  fermeId: Types.ObjectId;
  createdAt: Date;
}

const BandeSchema = new Schema<IBande>(
  {
    nom: { type: String, required: true },
    race: { type: String, required: true },
    typeElevage: { type: String, enum: ["chair", "ponte"], required: true },
    effectifInitial: { type: Number, required: true, min: 1 },
    dateMiseEnPlace: { type: Date, required: true },
    poidsInitial: { type: Number },
    fournisseur: { type: String },
    statut: { type: String, enum: ["en_cours", "cloturee"], default: "en_cours" },
    fermeId: { type: Schema.Types.ObjectId, ref: "Ferme", required: true, index: true },
  },
  { timestamps: true }
);

export default models.Bande || model<IBande>("Bande", BandeSchema);
