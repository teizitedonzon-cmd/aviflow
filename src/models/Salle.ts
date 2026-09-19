import { Schema, models, model, Types } from "mongoose";

export interface ISalle {
  _id: string;
  nom: string;
  capacite: number;
  equipements?: string;
  bandeId: Types.ObjectId;
  createdAt: Date;
}

const SalleSchema = new Schema<ISalle>(
  {
    nom: { type: String, required: true },
    capacite: { type: Number, required: true, min: 1 },
    equipements: { type: String },
    bandeId: { type: Schema.Types.ObjectId, ref: "Bande", required: true, index: true },
  },
  { timestamps: true }
);

export default models.Salle || model<ISalle>("Salle", SalleSchema);
