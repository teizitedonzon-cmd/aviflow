import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message || message.length < 3) {
      return NextResponse.json({ error: "Le message est vide." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const preferredModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const modelsToTry = [preferredModel, "gemini-2.0-flash", "gemini-1.5-flash"].filter(Boolean);

    if (!apiKey) {
      return NextResponse.json({
        answer:
          "La clé Gemini n’est pas configurée. Ajoute GEMINI_API_KEY dans ton fichier .env.local pour activer l’assistant SOS.",
      });
    }

    let lastError = "Erreur Gemini API";

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Tu es un assistant IA généraliste utile, bienveillant et très clair.
Règles :
- Réponds en français.
- Tu peux répondre à toutes les questions, y compris l’élevage, la vie quotidienne, le travail, les outils, les conseils pratiques, etc.
- Donne des réponses concrètes, simples et utiles.
- Si la question est confuse, reformule-la avec un conseil pratique.
Question de l’utilisateur : ${message}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          const answer =
            data?.candidates?.[0]?.content?.parts
              ?.map((part: { text?: string }) => part?.text || "")
              .join(" ") || "Je n’ai pas pu générer de réponse pour le moment.";

          return NextResponse.json({ answer });
        }

        lastError = data?.error?.message || `HTTP ${response.status}`;
        console.error("Gemini request failed for model:", model, response.status, data);
      } catch (innerError) {
        console.error("Gemini fetch exception for model:", model, innerError);
        lastError = innerError instanceof Error ? innerError.message : "Erreur de connexion à Gemini";
      }
    }

    throw new Error(lastError);
  } catch (error) {
    console.error("SOS assistant error:", error);
    return NextResponse.json(
      {
        answer:
          "Le service Gemini a refusé la requête. Vérifie ta clé API et le nom du modèle, puis rechargera l’application.",
      },
      { status: 200 }
    );
  }
}
