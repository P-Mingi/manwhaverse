# 🎨 PRODUCT DESIGN v2 — ManhwaVerse
> Design System complet · Notation cristal + /10 · Bilingue FR/EN · Mars 2026

---

## 🏷️ Identité validée

- **Nom :** ManhwaVerse
- **Tagline :** "Your manhwa universe, one scroll at a time." (double sens : scroll vertical webtoon + navigation web)
- **Scope :** Manhwa (priorité absolue) + Manhua (présent, discret)
- **Notation :** Score /10 (DB + Schema.org) + cristal liquide animé (visuel)
- **Reader intégré :** Non — on est le méta-layer au-dessus des plateformes

---

## 🧠 Philosophie Design

**Mantra :** *"Le premier site de manhwa qui ressemble à ce que les lecteurs méritent."*

Ni le dark gaming générique, ni le blanc clinique des agrégateurs. ManhwaVerse est un **journal culturel vivant** — l'élégance éditoriale de Letterboxd fusionnée avec la densité d'AniList, repensée pour le format vertical coréen.

**3 piliers de chaque décision design :**
1. **Découverte** — est-ce que ça aide à trouver le prochain titre ?
2. **Identité** — est-ce que ça renforce l'ego du lecteur ?
3. **Communauté** — est-ce que ça crée du lien ?

Si une feature ne sert aucun des trois → elle n'existe pas.

---

## 🎨 Direction Artistique

### Palette de couleurs

```css
:root {
  /* Fonds */
  --bg-base:        #0D0D0F;   /* fond principal — noir chaud, jamais pur */
  --bg-surface:     #13141A;   /* cards, panels */
  --bg-elevated:    #1C1E27;   /* hover states, modals */
  --bg-border:      #252836;   /* bordures subtiles */

  /* Cristal — système de notation */
  --crystal-gold:   #C9A84C;   /* score élevé ≥ 8/10 */
  --crystal-blue:   #4A9EFF;   /* score moyen 6-7.9/10 */
  --crystal-red:    #E05252;   /* score bas < 6/10 */
  --crystal-void:   #555970;   /* pas encore noté */

  /* Labels kanji */
  --encre-gold:     #C9A84C;   /* 墨 ENCRÉ — ≥ 8/10 */
  --trace-blue:     #4A9EFF;   /* 線 TRACÉ — 6-7.9 */
  --brouillon-red:  #E05252;   /* 廃 BROUILLON — < 6 */
  --vierge-grey:    #555970;   /* 白 VIERGE — pas noté */

  /* Texte */
  --text-primary:   #E8E4D9;   /* crème chaud — jamais blanc pur */
  --text-secondary: #8B8FA8;
  --text-muted:     #4A4E63;

  /* Typographie */
  --font-display:   'Playfair Display', Georgia, serif;
  --font-body:      'DM Sans', system-ui, sans-serif;
  --font-mono:      'JetBrains Mono', monospace;

  /* Espacement base 4px */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-6: 24px;  --space-8: 32px;
  --space-12: 48px; --space-16: 64px;

  /* Radius */
  --radius-sm: 2px;   /* tags, badges */
  --radius-md: 6px;   /* cards */
  --radius-lg: 12px;  /* modals */

  /* Transitions */
  --t-fast:   0.12s ease;
  --t-normal: 0.22s ease;
  --t-slow:   0.4s ease;
}
```

### Typographie

| Rôle | Police | Usage |
|---|---|---|
| Titres / Display | Playfair Display | Noms de titres, H1, hero |
| Corps | DM Sans | UI, descriptions, navigation |
| Scores / Labels / Mono | JetBrains Mono | Chiffres, tags, metadata |
| Kanji | Noto Serif JP | Labels 墨 線 廃 白 |

---

## 💎 Système de Notation — "Le Cristal" + /10

### Concept dual (UX + SEO)

**Le cristal = l'âme visuelle.** Le /10 = la donnée structurée pour Google (Schema.org `aggregateRating`). Les deux coexistent et se renforcent.

```
Score utilisateur /10 → Cristal liquide animé + label kanji
Exemple : 8.5/10 → Cristal doré aux 85%, label 墨 ENCRÉ
```

### Les 4 états du cristal

```
墨 ENCRÉ   (≥ 8.0)  → Bulle pleine, or translucide, reflets lumineux animés
線 TRACÉ   (6.0-7.9) → Bulle aux 2/3, bleu cristallin, légèrement trouble
廃 BROUILLON (< 6.0) → Bulle à 40%, rouge diffus, surface irrégulière
白 VIERGE  (pas noté) → Bulle vide, contour irisé, shimmer subtil
```

### Slider de notation

Le slider est l'interaction de notation. Au lieu d'un clic sur une étoile, l'utilisateur **glisse** et voit le cristal se remplir en temps réel.

```
UX du slider :
┌─────────────────────────────────────────────────────┐
│                                                     │
│   [CRISTAL ANIMÉ — se remplit en live]              │
│                                                     │
│   ○──────────────────────●────────────────────○     │
│   0                     8.5                   10    │
│                                                     │
│            8.5 / 10  ·  墨 ENCRÉ                    │
│                                                     │
└─────────────────────────────────────────────────────┘

Feedback haptique sur mobile au moment du changement de label.
Le cristal change de couleur progressivement au passage des seuils.
```

### Implémentation CSS cristal

```css
/* Option CSS pure — performant, mobile-friendly */
@keyframes crystalFill {
  0%   { clip-path: inset(100% 0 0 0 round 50%); opacity: 0.2; }
  60%  { clip-path: inset(calc(var(--fill) + 4%) 0 0 0 round 50%); opacity: 0.9; }
  80%  { clip-path: inset(calc(var(--fill) - 1%) 0 0 0 round 50%); opacity: 0.95; }
  100% { clip-path: inset(var(--fill) 0 0 0 round 50%); opacity: 1; }
}
/* --fill = 100% - score% : score 8.5 → --fill: 15% */

@keyframes crystalShimmer {
  0%, 100% { filter: brightness(1) saturate(1); }
  50%       { filter: brightness(1.15) saturate(1.2); }
}

.crystal {
  animation: crystalFill 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards,
             crystalShimmer 3s ease-in-out infinite 1.2s;
}
```

### Tailles contextuelles

```
XS (32px)  → Dans les listes, tableaux, search results
SM (48px)  → Cards de grille standard
MD (72px)  → Cards featured, top 5
LG (96px)  → Header fiche titre
XL (128px) → Hero section home, profil utilisateur
```

---

## 🎯 Magic Moment — Dès la Première Seconde

Le magic moment doit être **immédiat, visuel, émotionnel**. Pas après 5 clicks — à l'arrivée sur la home.

### Inspirations des meilleurs onboardings du web

**Spotify** — dès l'inscription, il te demande 3 artistes que tu aimes et te génère une playlist. Tu comprends la valeur avant même d'explorer.
**Duolingo** — te fait faire une leçon AVANT de créer un compte. Tu es engagé avant de t'inscrire.
**Letterboxd** — la home non-connectée montre des films avec des reviews poétiques. Tu veux immédiatement avoir ce profil.
**Notion** — templates pré-remplis qui simulent ce que ton espace pourrait être.

### Onboarding ManhwaVerse (3 étapes max, 60 secondes)

```
ÉTAPE 1 — "Qu'est-ce que tu as déjà lu ?"
├── 12 covers de manhwas populaires affichées (Solo Leveling, ToG, ORV...)
├── Click pour marquer comme "Lu" → animation cristal apparaît sur la cover
├── Texte : "Clique sur les manhwas que tu connais"
└── Skip disponible mais peu visible

ÉTAPE 2 — "Qu'est-ce que tu aimes ?"
├── 8 tropes affichés comme tags visuels avec icônes
│   [⚔️ Action] [💕 Romance] [🔄 Regression] [🏰 Murim]...
├── Multi-select, minimum 2 requis
└── Texte : "On va trouver tes prochains coups de cœur"

ÉTAPE 3 — "Voici ta bibliothèque personnalisée"
├── Home pré-peuplée avec des recommandations basées sur les 2 étapes
├── Section "Commence par ceux-là" — 6 titres ultra-ciblés
├── Le profil affiche déjà les cristaux des titres marqués en étape 1
└── CTA final : "Crée ton compte pour sauvegarder" (pas forcé avant)
```

**Règle d'or :** L'utilisateur doit avoir de la valeur AVANT de créer un compte. L'inscription vient naturellement quand il veut sauvegarder.

### La home pour les non-connectés

```
Pas une page marketing vide.
Une démonstration vivante du produit :

├── Classement en temps réel (visible sans compte)
├── Reviews de la communauté (les plus belles, style Letterboxd)
├── Stats live : "4 827 manhwas · 89 204 reviews · Mis à jour il y a 3min"
├── Cristaux animés sur les covers → tu comprends le système visuellement
└── "Rejoins 12 389 lecteurs" → social proof immédiat
```

---

### 1. 🏠 Home — "Le Feed Culturel"

```
STRUCTURE VERTICALE :

┌── HERO ──────────────────────────────────────────────────────────┐
│                                                                  │
│  ManhwaVerse                                                     │
│  Track, discover and share the manhwa you love.                  │
│                                                                  │
│  [Commencer →]   [Voir le classement]                            │
│                                                                  │
│  ── Stats live ──────────────────────────────────────────────    │
│  4 827 manhwas · 12 389 lecteurs · 89 204 reviews               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌── TOP MANHWAS CETTE SEMAINE ─────────────────────────────────────┐
│  5 large cards horizontales avec cristal + cover + score         │
│  [Voir le classement complet →]                                  │
└──────────────────────────────────────────────────────────────────┘

┌── DÉCOUVERTE PAR TROPE ──────────────────────────────────────────┐
│  [Regression] [System] [Isekai] [Murim] [Villain MC]            │
│  Tags cliquables → page dédiée                                   │
└──────────────────────────────────────────────────────────────────┘

┌── ACTIVITÉ COMMUNAUTÉ ───────────────────────────────────────────┐
│  Reviews récentes · Listes créées · Titres ajoutés cette semaine │
└──────────────────────────────────────────────────────────────────┘

┌── HIDDEN GEMS ───────────────────────────────────────────────────┐
│  Titres avec < 500 lecteurs mais score ≥ 8/10                    │
│  Rotation hebdomadaire automatique                               │
└──────────────────────────────────────────────────────────────────┘
```

---

### 2. 📚 Fiche Titre — Le Cœur SEO

```
┌── HERO BANNER ────────────────────────────────────────────────────┐
│  Cover blurée pleine largeur + overlay 70%                        │
│                                                                   │
│  [Cover 140px]  Solo Leveling          [CRISTAL LG 96px]         │
│                 Chugong · Dubu          9.2 / 10                 │
│                 2018 – 2021 · Manhwa    墨 ENCRÉ                  │
│                 Action · Fantasy                                  │
│                 179 chapitres · Corée                             │
│                                                                   │
│  [+ Ajouter à ma liste]  [Lire →]  [♥ 24K]                      │
└──────────────────────────────────────────────────────────────────┘

┌── TABS ───────────────────────────────────────────────────────────┐
│  [Infos] [Reviews] [Communauté] [Similaires] [Listes]            │
└──────────────────────────────────────────────────────────────────┘

TAB INFOS :
├── Synopsis (avec bouton "Voir plus" si > 3 lignes)
├── Tropes tagués par la communauté (#regression #system #op-mc)
├── Informations éditeur (statut, fréquence, plateforme origin)
├── Liens de lecture (plateformes légales, badge Officiel ✓)
└── Adaptation (anime, live-action si existe)

TAB REVIEWS :
├── Tri : Populaires / Récentes / Amis
├── Filtre : Spoilers ON/OFF (toggle global)
├── Review featured (plus likée)
├── Micro-reviews (< 280 chars) et longues reviews séparées
└── Bouton "Écrire une review"

TAB SIMILAIRES :
├── Algorithme similarité (tropes + genres + score)
├── "Parce que tu aimes [X trope]"
└── Listes communautaires qui incluent ce titre
```

---

### 3. 👤 Profil Utilisateur — L'Identité du Lecteur

```
┌── HEADER PROFIL ─────────────────────────────────────────────────┐
│  [Avatar]  @username                                             │
│            Lecteur depuis Mars 2025                              │
│            "Ma bio personnalisée..."                             │
│                                                                  │
│  [CRISTAL XL 128px — score moyen donné : 7.8/10]                │
│                                                                  │
│  147 titres · 89 reviews · 12 listes · 234 followers            │
└──────────────────────────────────────────────────────────────────┘

┌── TASTE CARD (partageable) ──────────────────────────────────────┐
│  Genre favori : Action (67%)  ·  Trope favori : Regression       │
│  Temps de lecture estimé : 340h  ·  Score moyen donné : 7.8     │
│  [Partager ma Taste Card →]  ← génère une image OG               │
└──────────────────────────────────────────────────────────────────┘

┌── BIBLIOTHÈQUE ──────────────────────────────────────────────────┐
│  Tabs : [📖 En cours (12)] [✅ Terminé (89)] [⏸ Pause (8)]      │
│         [📋 À lire (44)] [❌ Abandonné (7)]                      │
│  Vue : [Grille] [Liste]                                          │
│  Tri : [Score donné] [Date ajout] [Alphabétique]                 │
└──────────────────────────────────────────────────────────────────┘

┌── STATS VISUELLES ───────────────────────────────────────────────┐
│  Graphique donut genres · Heatmap des lectures (GitHub style)    │
│  Evolution du score moyen dans le temps                          │
│  Classement dans la communauté (top X% des lecteurs)             │
└──────────────────────────────────────────────────────────────────┘
```

---

### 4. 🔍 Recherche & Découverte

```
RECHERCHE PLEIN ÉCRAN (overlay au clic) :
├── Barre de recherche centrale, auto-focus
├── Résultats en temps réel (Meilisearch)
├── Tendances de la semaine sous la barre
└── Filtres rapides : [Terminé] [En cours] [Note > 8]

RECHERCHE AVANCÉE PAR TROPES :
┌─────────────────────────────────────────────────────────────────┐
│ TYPE DE HÉROS          MÉCANIQUE NARRATIVE     AMBIANCE         │
│ ○ Overpowered MC      ○ Regression             ○ Dark & Gritty │
│ ○ Underdog → Strong   ○ System / Gacha         ○ Light & Fun   │
│ ○ Villain MC          ○ Reincarnation          ○ Romance focus │
│ ○ Female Lead         ○ Dungeon                ○ Political     │
│                       ○ Murim                                   │
│                                                                  │
│ STATUT : [Terminé] [En cours]   CHAPITRES : ──●── 50-200       │
│ NOTE MINIMUM : ──●── 7.5/10     EXCLURE déjà lus : [ON]        │
│                                                                  │
│ URL partageable générée automatiquement pour chaque filtre       │
└──────────────────────────────────────────────────────────────────┘

"SURPRISE ME" BUTTON :
→ Génère une reco basée sur l'historique (si connecté)
  ou sur les top Hidden Gems (si non connecté)
→ Animation : cristal qui apparaît depuis le centre
```

---

### 5. 💬 Communauté

```
FORUM STRUCTURÉ (pas Discord — garde le trafic on-site) :
├── Discussions par titre (fil dédié, spoilers isolés par arc)
├── "What are you reading this week?" — thread auto hebdomadaire
├── Listes thématiques créées par les users
└── "Cherche une reco" — thread avec tag de tropes

LISTES COMMUNAUTAIRES :
├── Créées par n'importe qui
├── Votées par la communauté
├── Les meilleures → landing pages SEO automatiques
└── Format : titre + description + manhwas ordonnés + commentaire par item

ACTIVITY FEED :
├── Amis ont ajouté / terminé / noté
├── Reviews likées par la communauté
└── Listes créées récemment
```

---

### 6. 🏆 Classements — Moteur SEO

```
PAGES DE CLASSEMENT :
├── /top — Classement général tous manhwas
├── /top/action — Par genre
├── /top/regression — Par trope (★ SEO gold)
├── /top/completed — Terminés seulement
├── /top/2024 — Par année de sortie
└── /top/hidden-gems — Note ≥ 8, < 1000 lecteurs

FILTRES CLASSEMENT :
├── Type : [Manhwa] [Manhua]
├── Statut : [Tous] [En cours] [Terminé]
├── Époque : [Tous] [2020+] [2015-2019] [Classic]
├── Tri : [Score] [Popularité] [Récent] [Controverse]
└── Vue : [Grille] [Liste compacte]
```

---

### 7. 🎮 Gamification & Engagement

```
READER CLASS (classe évolutive affichée sur le profil) :
├── ⚔️ The Completionist — > 90% completion rate
├── 🔍 The Explorer — 5+ genres différents lus
├── 👑 The Gatekeeper — reviews très influentes
├── 📚 The Binge Reader — sessions de 10+ chapitres
└── 💎 The Hidden Gem Hunter — découverte de titres rares

ACHIEVEMENTS :
├── "First Blood" — premier manhwa terminé
├── "Thousand Pages" — 1000 chapitres lus
├── "Night Reader" — 50% des sessions entre 22h-3h
├── "Critic's Eye" — review avec 100+ likes
└── "Trendsetter" — noter un manhwa avant qu'il soit populaire

READING CHALLENGES (annuels/mensuels) :
├── "12 Manhwas en 12 mois" — badge fin d'année
├── "Genre Explorer" — lire dans 6 genres différents
└── "Hidden Gem Month" — terminer 3 titres < 500 lecteurs
```

---

---

### 8. 📝 Blog Éditorial — Articles avec Données Vivantes

**Concept différenciateur :** les articles "Best of" intègrent des `<ManhwaCard>` dynamiques avec les scores communautaires en temps réel. L'article ne vieillit jamais — les données se mettent à jour automatiquement.

**Stack :** MDX pour le contenu + Server Components pour les cartes dynamiques. Chaque article est une page statique avec des îlots de données vivantes.

**SEO :** chaque article = page indexée + FAQ Schema.org + données structurées. L'IA génère le draft (15 min), l'humain édite (20 min), résultat indétectable et défendable.

**URL structure :**
```
/blog/best-regression-manhwa       EN
/blog/best-completed-manhwa        EN
/fr/blog/meilleur-manhwa-2025      FR
/fr/blog/manhwa-regression         FR
```

---

### 9. 📊 Stats AniList-inspired (améliorées)

**Score Distribution** — graphique bulles colorées rouge→or selon le score. Hauteur = nombre de votes à ce niveau. Montre la distribution complète, pas juste la moyenne.

**Status Distribution** — compteurs colorés (En cours / Terminé / À lire / Abandonné) avec barre de progression proportionnelle.

**Tags avec pourcentage** — chaque trope affiché avec son score de pertinence : `upvotes / (upvotes + downvotes) × 100`. Trié par pertinence décroissante. Identique à AniList mais avec les tropes manhwa-specific.

**Score History** — graphique linéaire de l'évolution du score dans le temps. Unique vs AniList. "Ce manhwa a gagné +1.2 points depuis l'adaptation anime."

**Synonymes + Relations** — section "Informations" avec tous les noms alternatifs et les liens vers adaptations/prequels/sequels.



**Bottom navigation (pas hamburger) :**
```
[🏠 Home] [🔍 Search] [📚 Ma liste] [👥 Feed] [👤 Profil]
```

- Mode sombre par défaut (obligatoire pour ce public)
- PWA avant app native
- Swipe gestures sur les listes
- Touch targets minimum 44px
- Feedback haptique sur les interactions clés (notation, ajout à bibliothèque)

---

## ✨ Animations Signature

| Interaction | Animation | Durée |
|---|---|---|
| Cristal révélé | Fill bottom→top | 1200ms |
| Score counter | Count-up | 800ms |
| Card hover | translateY(-4px) + glow | 220ms |
| Changement de label | Couleur transition + shimmer | 400ms |
| Page load cards | Stagger reveal (60ms/card) | 400ms |
| Ajout bibliothèque | Cristal pulse + feedback | 300ms |
| Modal open | Fade + slide up | 300ms |

---

## 🔍 SEO UX — Règles d'or

- **H1 unique** sur chaque page, contenant le mot-clé principal
- **Breadcrumb** visible et cliquable partout
- **Structured Data** Schema.org sur chaque fiche (Book, AggregateRating)
- **"Dernière mise à jour"** affiché sur chaque fiche (fraîcheur Google)
- **Pagination** avec URL distincte (`/top/action?page=2`)
- **Listes communautaires** → landing pages SEO automatiques
- **Alt text** systématique sur les covers
- **Open Graph** customisé par page (pour les partages sociaux)

---

*v2.0 — Mars 2026 · Inspiré de : Letterboxd · AniList · MangaScore Design System*
