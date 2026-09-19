import mongoose, { Schema, models, model } from "mongoose";

export interface IProducteur {
  _id: string;
  nom: string;
  email: string;
  password: string;
  createdAt: Date;
}

const ProducteurSchema = new Schema<IProducteur>(
  {
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // haché avec bcrypt
  },
  { timestamps: true }
);

export default models.Producteur || model<IProducteur>("Producteur", ProducteurSchema);
