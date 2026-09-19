import webpush from "web-push";
import { connectToDatabase } from "@/lib/mongodb";
import PushSubscription from "@/models/PushSubscription";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

let configure = false;
function assurerConfiguration() {
  if (configure) return;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn(
      "Clés VAPID manquantes: les notifications push sont désactivées. Voir .env.local.example."
    );
    return;
  }
  webpush.setVapidDetails("mailto:contact@example.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configure = true;
}

export async function envoyerAlertePush(producteurId: string, titre: string, corps: string) {
  assurerConfiguration();
  if (!configure) return;

  await connectToDatabase();
  const abonnements = await PushSubscription.find({ producteurId });

  await Promise.all(
    abonnements.map(async (abonnement) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: abonnement.endpoint,
            keys: abonnement.keys,
          },
          JSON.stringify({ title: titre, body: corps })
        );
      } catch (error) {
        console.error("Échec envoi push:", error);
        // Abonnement expiré ou invalide : on le supprime silencieusement
        await PushSubscription.findByIdAndDelete(abonnement._id);
      }
    })
  );
}
