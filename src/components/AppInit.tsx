"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { synchroniserFilesEnAttente } from "@/lib/offlineQueue";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function activerNotificationsPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const registration = await navigator.serviceWorker.ready;
  const abonnementExistant = await registration.pushManager.getSubscription();
  if (abonnementExistant) return;

  const { publicKey } = await fetch("/api/push/vapid-public-key").then((r) => r.json());
  if (!publicKey) return; // clés VAPID non configurées côté serveur

  const abonnement = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(abonnement.toJSON()),
  });
}

export function AppInit() {
  const { status } = useSession();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Échec de l'enregistrement du service worker:", err);
      });
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

    activerNotificationsPush().catch((err) => console.error("Push non activé:", err));

    synchroniserFilesEnAttente();
    const handler = () => synchroniserFilesEnAttente();
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, [status]);

  return null;
}
