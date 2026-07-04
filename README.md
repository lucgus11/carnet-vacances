# 🌴 Carnet de Vacances — PWA hors-ligne

Un carnet de vacances digital, style bullet journal, qui fonctionne **100% hors-ligne**
et **sans base de données externe**. Toutes les données restent sur l'appareil de
l'utilisateur (IndexedDB via Dexie.js).

## ✨ Fonctionnalités

- **Multi-voyages** : crée autant de voyages que tu veux (titre, lieu, dates).
  Le nombre de jours et la structure des journées sont générés automatiquement.
- **Cahier journalier** : navigue entre les jours (onglets + flèches précédent/suivant),
  chaque jour a sa date affichée automatiquement, un champ "Lieu", 3 smileys d'humeur
  (content / neutre / triste, choix unique) et 3 zones de texte pour les repas
  (Matin / Midi / Soir).
- **Sauvegarde automatique en temps réel** à chaque frappe (debounce ~500ms), rien à cliquer.
- **100% hors-ligne** : Service Worker (Workbox via `vite-plugin-pwa`) qui pré-cache toute
  l'application. Une fois ouverte une première fois, l'app s'installe et fonctionne sans
  aucun réseau (mobile ou desktop).
- **Export PDF** : génère un PDF complet du carnet (page de garde + une page par jour),
  entièrement côté client avec `jsPDF`, aucune donnée envoyée à un serveur.

## 🛠️ Stack technique

- **Vite + React 18 + TypeScript** (`strict: true`)
- **Dexie.js** (IndexedDB typé) + `dexie-react-hooks` pour les live queries
- **vite-plugin-pwa** (Workbox) pour le Service Worker et le manifest PWA
- **jsPDF** pour l'export PDF côté client
- Police manuscrite **Kalam** (titres/accents) + **Karla** (texte, très lisible)

## 📂 Architecture du projet

```
carnet-vacances/
├── index.html
├── vercel.json                 # config déploiement Vercel
├── vite.config.ts              # config Vite + plugin PWA (manifest, service worker)
├── tsconfig.json / tsconfig.node.json
├── package.json
├── public/
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── scripts/
│   └── gen_icons.py            # script optionnel pour régénérer les icônes
└── src/
    ├── main.tsx                # point d'entrée React
    ├── App.tsx                 # routage simple (accueil / journal)
    ├── types.ts                # interfaces Voyage / Journee / Mood
    ├── db.ts                   # config Dexie (IndexedDB)
    ├── vite-env.d.ts
    ├── styles/
    │   └── global.css          # design "cahier" (papier, reliure, washi tape)
    ├── utils/
    │   ├── dateUtils.ts         # calcul des jours entre 2 dates, formatage FR
    │   └── pdfExport.ts         # génération du PDF avec jsPDF
    └── components/
        ├── HomeScreen.tsx       # liste des voyages + création
        ├── TripForm.tsx         # formulaire nouveau voyage
        ├── JournalScreen.tsx    # écran "cahier" d'un voyage
        ├── DayNav.tsx           # navigation entre les jours
        ├── DayEditor.tsx        # édition d'une journée (autosave)
        └── MoodPicker.tsx       # 3 smileys cliquables
```

## 🚀 Installation & développement local

Prérequis : Node.js 18+ et npm.

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
# → ouvre http://localhost:5173

# 3. Build de production
npm run build

# 4. Prévisualiser le build de production
npm run preview
```

> Le Service Worker est actif même en développement (`devOptions.enabled: true` dans
> `vite.config.ts`), ce qui permet de tester le mode hors-ligne directement avec `npm run dev`.

### Tester le mode hors-ligne

1. `npm run build && npm run preview`
2. Ouvrir l'app dans le navigateur, la laisser charger une fois (le Service Worker s'installe).
3. Couper le réseau (mode avion, ou onglet Network → Offline dans les DevTools).
4. Recharger la page : elle doit continuer à fonctionner normalement.

## ☁️ Déploiement sur Vercel via GitHub

1. **Créer le dépôt GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit — Carnet de Vacances PWA"
   git branch -M main
   git remote add origin https://github.com/<ton-compte>/carnet-vacances.git
   git push -u origin main
   ```

2. **Connecter à Vercel**
   - Va sur [vercel.com](https://vercel.com), clique sur **"Add New… → Project"**.
   - Importe le dépôt GitHub que tu viens de créer.
   - Vercel détecte automatiquement le framework **Vite** (grâce à `vercel.json` et
     `package.json`). Les paramètres par défaut suffisent :
     - Build Command : `npm run build`
     - Output Directory : `dist`
   - Clique sur **Deploy**. En une à deux minutes, l'app est en ligne.

3. **Mises à jour futures** : chaque `git push` sur `main` déclenche automatiquement un
   nouveau déploiement Vercel.

## 🔒 Confidentialité & stockage

Aucune donnée n'est envoyée à un serveur : voyages, journées, humeurs et textes de repas
sont stockés uniquement dans l'IndexedDB du navigateur de l'utilisateur (base
`CarnetVacancesDB`). Supprimer les données du site dans le navigateur effacera
définitivement le carnet — il n'existe pas de sauvegarde cloud dans cette version.

## 🎨 Régénérer les icônes PWA (optionnel)

Les icônes fournies dans `public/icons/` sont déjà prêtes à l'emploi. Pour les régénérer
ou les personnaliser (nécessite Python + Pillow) :

```bash
pip install pillow
python3 scripts/gen_icons.py
```
