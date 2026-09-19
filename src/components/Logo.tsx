import Image from "next/image";

/**
 * Pour changer le logo de l'application :
 * 1. Placez votre fichier image dans le dossier `public/` du projet
 *    (ex: public/logo.png), idéalement en PNG carré, fond transparent.
 * 2. Mettez à jour le nom de fichier ci-dessous si besoin.
 * 3. C'est tout — ce composant est utilisé partout dans l'en-tête de l'app.
 */
const NOM_FICHIER_LOGO = "logo.png";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
      <Image
        src={`/${NOM_FICHIER_LOGO}`}
        alt="AviFlow"
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
        // Si le fichier n'existe pas encore, on masque l'image plutôt que d'afficher une icône cassée
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <span>AviFlow</span>
    </span>
  );
}
