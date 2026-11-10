import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Producteur from "@/models/Producteur";

export async function POST(request: Request) {
  try {
    const { nom, email, password } = await request.json();

    if (!nom || !email || !password) {
      return NextResponse.json(
        { error: "Nom, email et mot de passe sont requis" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const emailNormalise = email.toLowerCase().trim();
    const existant = await Producteur.findOne({ email: emailNormalise });

    if (existant) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email" },
        { status: 409 }
      );
    }

    const passwordHache = await bcrypt.hash(password, 10);

    const producteur = await Producteur.create({
      nom,
      email: emailNormalise,
      password: passwordHache,
    });

    return NextResponse.json(
      { id: producteur._id, nom: producteur.nom, email: producteur.email },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur inscription:", error);

    const message =
      error instanceof Error && error.message
        ? error.message
        : "Une erreur est survenue lors de l'inscription";

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV !== "production"
            ? `Erreur inscription: ${message}`
            : "Une erreur est survenue lors de l'inscription",
      },
      { status: 500 }
    );
  }
}
