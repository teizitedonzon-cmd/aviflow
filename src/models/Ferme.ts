import { Schema, models, model, Types } from "mongoose";

export interface IFerme {
  _id: string;
  nom: string;
  localisation?: string;
  producteurId: Types.ObjectId;
  createdAt: Date;
}

const FermeSchema = new Schema<IFerme>(
  {
    nom: { type: String, required: true },
    localisation: { type: String },
    producteurId: { type: Schema.Types.ObjectId, ref: "Producteur", required: true, index: true },
  },
  { timestamps: true }
);

export default models.Ferme || model<IFerme>("Ferme", FermeSchema);
