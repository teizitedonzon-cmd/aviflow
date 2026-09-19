import { Schema, models, model, Types } from "mongoose";

export type StatutVaccination = "a_faire" | "fait" | "manque";

export interface ICalendrierVaccination {
  _id: string;
  bandeId: Types.ObjectId;
  jourAge: number; // jour depuis la mise en place de la bande
  libelle: string; // ex: "Vaccin Newcastle"
  statut: StatutVaccination;
  dateReelle?: Date;
}

const CalendrierVaccinationSchema = new Schema<ICalendrierVaccination>({
  bandeId: { type: Schema.Types.ObjectId, ref: "Bande", required: true, index: true },
  jourAge: { type: Number, required: true },
  libelle: { type: String, required: true },
  statut: { type: String, enum: ["a_faire", "fait", "manque"], default: "a_faire" },
  dateReelle: { type: Date },
});

export default models.CalendrierVaccination ||
  model<ICalendrierVaccination>("CalendrierVaccination", CalendrierVaccinationSchema);
