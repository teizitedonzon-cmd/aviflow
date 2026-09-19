const CLE_FILE_ATTENTE = "avigestion_fiches_en_attente";

export interface FicheEnAttente {
  id: string; // identifiant temporaire local
  payload: Record<string, unknown>;
}

function lireFile(): FicheEnAttente[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CLE_FILE_ATTENTE) || "[]");
  } catch {
    return [];
  }
}

function ecrireFile(file: FicheEnAttente[]) {
  localStorage.setItem(CLE_FILE_ATTENTE, JSON.stringify(file));
}

export function ajouterFicheEnAttente(payload: Record<string, unknown>) {
  const file = lireFile();
  file.push({ id: crypto.randomUUID(), payload });
  ecrireFile(file);
}

export function nombreFichesEnAttente() {
  return lireFile().length;
}

export async function synchroniserFilesEnAttente(): Promise<number> {
  const file = lireFile();
  if (file.length === 0) return 0;

  let succes = 0;
  const restantes: FicheEnAttente[] = [];

  for (const item of file) {
    try {
      const reponse = await fetch("/api/fiches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
      });
      if (reponse.ok || reponse.status === 409) {
        // 409 = déjà synchronisée par ailleurs, on considère que c'est traité
        succes++;
      } else {
        restantes.push(item);
      }
    } catch {
      restantes.push(item); // toujours hors-ligne, on la garde pour plus tard
    }
  }

  ecrireFile(restantes);
  return succes;
}
