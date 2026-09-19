# AviFlow — Gestion avicole quotidienne

Application de gestion, traçabilité et suivi sanitaire pour producteurs avicoles :
Producteur → Ferme(s) → Bande(s) → Salle(s) → Fiches de bilan journalier.

## Stack technique

- Next.js 16 (App Router) + TypeScript + React
- CSS Modules natif (pas de Tailwind)
- MongoDB (Mongoose) — hébergement gratuit via MongoDB Atlas
- NextAuth (authentification par email/mot de passe)
- Recharts (statistiques et courbes)
- react-pdf (génération des rapports PDF)
- web-push (notifications push, PWA)

## Fonctionnalités incluses

- Comptes producteurs multi-fermes (tableau de bord global)
- Hiérarchie Ferme → Bande → Salle
- Fiche de bilan journalier (mortalité, aliment, eau, traitements, observations, œufs) avec historique et blocage anti-doublon (une fiche par salle et par jour)
- Pesées à fréquence libre + courbe de croissance
- Statistiques : courbe de croissance, taux de mortalité cumulé, taux de ponte, aliment/eau par tête
- Calendrier de vaccination personnalisable par bande (jour d'âge, statut fait/à faire/en retard)
- Alertes push automatiques en cas de mortalité anormale (seuil : 1 %/jour, ajustable dans src/app/api/fiches/route.ts)
- Mode hors-ligne basique (service worker + file d'attente locale, synchronisation automatique au retour du réseau)
- Répertoire de vétérinaires + rattachement par ferme
- Rapport PDF journalier (bilan global de la ferme puis détail par salle), téléchargeable et partageable par WhatsApp/email (lien manuel, aucun coût)

## Installation locale

```bash
npm install
cp .env.local.example .env.local
# remplissez .env.local (voir ci-dessous)
npm run dev
```

L'application est disponible sur http://localhost:3000.

## Configuration des variables d'environnement

### 1. MongoDB Atlas (gratuit)

1. Créez un compte sur https://cloud.mongodb.com
2. Créez un cluster gratuit (M0)
3. Dans "Database Access", créez un utilisateur avec mot de passe
4. Dans "Network Access", autorisez 0.0.0.0/0 (ou l'IP de Vercel une fois déployé)
5. Copiez l'URI de connexion dans MONGODB_URI

### 2. NextAuth

Générez un secret aléatoire :
```bash
openssl rand -base64 32
```
Collez-le dans NEXTAUTH_SECRET.

### 3. Notifications push (optionnel)

```bash
npx web-push generate-vapid-keys
```
Copiez la clé publique dans NEXT_PUBLIC_VAPID_PUBLIC_KEY et la clé privée dans VAPID_PRIVATE_KEY.
Sans ces clés, l'application fonctionne normalement — seules les alertes push sont désactivées.

## Déploiement sur Vercel

1. Poussez le projet sur un dépôt GitHub
2. Sur https://vercel.com, importez le dépôt
3. Dans les paramètres du projet Vercel, ajoutez les mêmes variables d'environnement que dans .env.local (avec NEXTAUTH_URL = l'URL de production, ex: https://votre-app.vercel.app)
4. Déployez

## Structure du projet

```
src/
  app/                    # Pages (App Router) et routes API
    api/                  # Toutes les routes API (fermes, bandes, salles, fiches...)
    dashboard/            # Tableau de bord multi-fermes
    fermes/[fermeId]/     # Ferme > Bandes > Salles > Fiches, vétérinaires, rapport PDF
    login/ register/      # Authentification
  components/             # Composants réutilisables (graphiques, init PWA)
  lib/                    # Connexion DB, auth, PDF, push, file d'attente hors-ligne
  models/                 # Schémas Mongoose
public/
  sw.js                   # Service worker (cache + notifications push)
  manifest.json           # Manifeste PWA
```

## Ajouter votre logo

Un seul fichier à déposer :

```
public/logo.png
```

- Format recommandé : PNG carré (ex: 512×512px), fond transparent
- Il sera automatiquement utilisé à 3 endroits, sans aucune autre modification :
  1. L'en-tête de l'application (`src/components/Logo.tsx`, utilisé sur toutes les pages)
  2. L'icône de l'app installée en PWA (`public/manifest.json`)
  3. L'en-tête du rapport PDF envoyé aux vétérinaires (`src/app/api/fermes/[id]/rapport/route.ts`, qui lit `public/logo.png` automatiquement s'il existe)

Si aucun fichier n'est présent, l'app affiche simplement le nom "AviFlow" sans logo — rien ne casse.

## Pistes d'évolution (non incluses dans ce MVP)

- Envoi automatique du PDF en pièce jointe par email (ex: via Resend) plutôt qu'un lien manuel
- Intégration WhatsApp Business API pour un envoi 100 % automatisé (payant)
- Icônes PWA personnalisées (actuellement un placeholder dans public/manifest.json)
- Alertes prédictives plus avancées (comparaison à des courbes de référence par race)
