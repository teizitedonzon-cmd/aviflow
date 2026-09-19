import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Producteur from "@/models/Producteur";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        await connectToDatabase();

        const producteur = await Producteur.findOne({
          email: credentials.email.toLowerCase().trim(),
        });

        if (!producteur) {
          throw new Error("Aucun compte ne correspond à cet email");
        }

        const motDePasseValide = await bcrypt.compare(
          credentials.password,
          producteur.password
        );

        if (!motDePasseValide) {
          throw new Error("Mot de passe incorrect");
        }

        return {
          id: producteur._id.toString(),
          name: producteur.nom,
          email: producteur.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
