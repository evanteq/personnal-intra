# Accueil — intranet personnel

Page d'accueil locale (raccourcis, météo, notes, to-do) construite avec React, Vite et Tailwind CSS. Toutes les données (liens, catégories, notes, tâches, apparence) sont stockées uniquement dans le `localStorage` du navigateur — aucune donnée n'est envoyée à un serveur, à l'exception des appels à l'API publique et gratuite [Open-Meteo](https://open-meteo.com/) pour la météo (prévisions + recherche de ville).

## Démarrer

```bash
npm install
npm run dev
```

Puis ouvrir l'URL affichée (par défaut http://localhost:5173). Pour en faire votre page d'accueil de tous les jours, mettez cette URL en favori ou en page de démarrage du navigateur pendant que `npm run dev` tourne.

## Fonctionnalités

- **Raccourcis** : cartes cliquables regroupées par catégories, avec ajout/édition/suppression et réorganisation par glisser-déposer.
- **Personnalisation** : couleur d'accent et image de fond (upload local ou URL), via le panneau Paramètres (icône engrenage).
- **Horloge** : heure/date locale, plus les heures de Shanghai et Los Angeles en temps réel.
- **Météo** : température et condition actuelles via géolocalisation du navigateur (avec repli sur Paris), ou une ville choisie dans les Paramètres.
- **Notes** : bloc-notes libre, sauvegardé automatiquement.
- **To-do list** : tâches avec case à cocher et filtres (toutes / en cours / terminées).

## Stack

React 19, Vite, Tailwind CSS v4, lucide-react — sans backend.
