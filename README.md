# Accueil — intranet personnel

Page d'accueil personnelle (raccourcis, météo, notes, Kanban) construite avec React, Vite et Tailwind CSS. Toutes les données (liens, catégories, notes, tâches, apparence) sont stockées uniquement dans le `localStorage` du navigateur — aucune donnée n'est envoyée à un serveur, à l'exception de : l'API publique et gratuite [Open-Meteo](https://open-meteo.com/) pour la météo, et le service de favicons de Google pour l'icône des raccourcis.

**En ligne :** https://evanteq.github.io/personnal-intra/ (déployé automatiquement à chaque push sur `main` via GitHub Actions).

## Démarrer en local

```bash
npm install
npm run dev
```

Puis ouvrir l'URL affichée (par défaut http://localhost:5173).

## Pages

- **Accueil** : récap (météo + fuseaux horaires, statistiques, raccourcis rapides, tâches à faire, dernière note).
- **Raccourcis** : cartes cliquables par catégories, favicon automatique, ajout/édition/suppression, réorganisation par glisser-déposer.
- **Notes** : plusieurs notes (créer/sélectionner/supprimer), sauvegarde automatique.
- **To-Do** : tableau Kanban à 3 colonnes (À faire / En cours / Terminé), glisser-déposer entre colonnes.

Personnalisation (couleur d'accent, image de fond, thème clair/sombre, ville pour la météo) via le panneau Paramètres (icône engrenage).

## Déploiement

Le dépôt est configuré pour se déployer automatiquement sur GitHub Pages à chaque push sur `main` (voir `.github/workflows/deploy.yml`). Pour déployer ailleurs, `npm run build` produit un site statique dans `dist/`.

## Stack

React 19, Vite, Tailwind CSS v4, lucide-react — sans backend.
