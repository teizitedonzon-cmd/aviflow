import { Schema, models, model, Types } from "mongoose";

export interface IVeterinaire {
  _id: string;
  nom: string;
  telephone?: string;
  email?: string;
  zoneCouverture?: string;
  specialite?: string;
  visiblePublic: boolean;
  createdAt: Date;
}

const VeterinaireSchema = new Schema<IVeterinaire>(
  {
    nom: { type: String, required: true },
    telephone: { type: String },
    email: { type: String },
    zoneCouverture: { type: String },
    specialite: { type: String },
    visiblePublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Veterinaire =
  models.Veterinaire || model<IVeterinaire>("Veterinaire", VeterinaireSchema);

export interface IFermeVeterinaire {
  _id: string;
  fermeId: Types.ObjectId;
  veterinaireId: Types.ObjectId;
  actif: boolean;
}

const FermeVeterinaireSchema = new Schema<IFermeVeterinaire>({
  fermeId: { type: Schema.Types.ObjectId, ref: "Ferme", required: true },
  veterinaireId: { type: Schema.Types.ObjectId, ref: "Veterinaire", required: true },
  actif: { type: Boolean, default: true },
});
FermeVeterinaireSchema.index({ fermeId: 1, veterinaireId: 1 }, { unique: true });

export const FermeVeterinaire =
  models.FermeVeterinaire || model<IFermeVeterinaire>("FermeVeterinaire", FermeVeterinaireSchema);
