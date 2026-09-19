import { Schema, models, model, Types } from "mongoose";

export interface IPesee {
  _id: string;
  date: Date;
  poidsMoyenGrammes: number;
  salleId: Types.ObjectId;
  createdAt: Date;
}

const PeseeSchema = new Schema<IPesee>(
  {
    date: { type: Date, required: true },
    poidsMoyenGrammes: { type: Number, required: true, min: 0 },
    salleId: { type: Schema.Types.ObjectId, ref: "Salle", required: true, index: true },
  },
  { timestamps: true }
);

// Lecture principale : toutes les pesées d'une salle dans l'ordre chronologique.
PeseeSchema.index({ salleId: 1, date: 1 });

export default models.Pesee || model<IPesee>("Pesee", PeseeSchema);
