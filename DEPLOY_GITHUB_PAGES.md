# Déployer `index.html` sur GitHub Pages

Ce guide explique comment publier le site client (`index.html`) sur GitHub Pages, comment héberger des images dans le dépôt, et fournit un petit script pour pousser rapidement.

## Pré-requis
- Avoir un dépôt GitHub lié (tu as déjà poussé `main`).
- `index.html` doit être à la racine du dépôt (c'est le cas).

## Etapes rapides (UI)
1. Ouvre la page du dépôt sur GitHub.
2. Va dans `Settings` → `Pages`.
3. Sous `Build and deployment` → `Source`, choisis `Deploy from a branch`.
4. Sélectionne `branch: main` et `folder: / (root)` puis `Save`.
5. Coche `Enforce HTTPS` si disponible.
6. Attends 1–5 minutes, GitHub te donnera une URL publique du type `https://<user>.github.io/<repo>/`.

## Héberger des images dans le dépôt (recommandé pour petit catalogue)
- Crée un dossier `images/` à la racine du dépôt.
- Ajoute tes fichiers images (`rose.jpg`, `orchid.png`, ...).
- Dans `index.html` et dans les documents Firestore (champ `img`), utilise des URLs relatives ou absolues vers GitHub Pages :

Exemple d'URL publique après déploiement :
`https://<user>.github.io/<repo>/images/rose.jpg`

Pendant le développement tu peux référencer localement `/images/rose.jpg` — GitHub Pages servira la même URL une fois publié.

## Utiliser Google Drive (alternative)
- Possible mais pas recommandé pour upload depuis l'app.
- Voir les limites listées dans le guide (bande passante, partage manuel).

## Automatiser : script PowerShell d'aide
Utilise le script `scripts/deploy_pages.ps1` (fourni) pour ajouter/committer/pusher rapidement.

## Vérifier que Firestore reçoit les commandes
1. Ouvre le site publié et passe une commande test.
2. Vérifie la console `Firestore` dans Firebase Console → collection `commandes`.
3. Vérifie l'app gérante (si elle est connectée) : elle doit recevoir la nouvelle commande via `onSnapshot`.

---
Si tu veux, j'ajoute aussi un workflow GitHub Actions pour déployer automatiquement, ou je crée le dossier `images/` et j'ajoute une image d'exemple.
