import { Schema, models, model, Types } from "mongoose";

export interface IFicheBilanJournalier {
  _id: string;
  date: Date;
  mortalite: number;
  alimentConsommeKg?: number;
  eauConsommeeL?: number;
  traitements?: string;
  observations?: string;
  productionOeufs?: number;
  salleId: Types.ObjectId;
  createdAt: Date;
}

const FicheBilanJournalierSchema = new Schema<IFicheBilanJournalier>(
  {
    date: { type: Date, required: true },
    mortalite: { type: Number, default: 0, min: 0 },
    alimentConsommeKg: { type: Number, min: 0 },
    eauConsommeeL: { type: Number, min: 0 },
    traitements: { type: String },
    observations: { type: String },
    productionOeufs: { type: Number, min: 0 },
    salleId: { type: Schema.Types.ObjectId, ref: "Salle", required: true, index: true },
  },
  { timestamps: true }
);

// Une seule fiche par salle et par jour : empêche la double saisie
FicheBilanJournalierSchema.index({ salleId: 1, date: 1 }, { unique: true });

export default models.FicheBilanJournalier ||
  model<IFicheBilanJournalier>("FicheBilanJournalier", FicheBilanJournalierSchema);
