# 🗺️ ROADMAP COMPLÈTE MANHWAVERSE — Du seeding au lancement et au-delà

---

## PHASE 0 — INFRASTRUCTURE SCORING (faire AVANT le seeding)
> Branch : `feat/scoring-system`
> Prompt : `PROMPT_SCORING_SYSTEM.md` (déjà créé)

Implémenter le scoring engine avec les phases Bootstrap → Growing → Mature. Sans ça, les données du seeding n'auront aucun impact visible sur le site.

---

## PHASE 1 — SEEDING : 1000 comptes IA
> Branch : `feat/seed-community`

### Objectif
Créer 1000 comptes réalistes qui génèrent assez d'activité pour que :
- **100+ manhwas** aient ≥ 50 votes (phase Mature = scores 100% ManhwaVerse)
- **500+ manhwas** aient ≥ 10 votes (phase Growing = blend MV + AniList)
- Le site ait des reviews, réactions, favoris, votes personnages, activité communautaire

### Stratégie de génération des comptes

#### 1.1 — Profils des 1000 comptes

Chaque compte a un **archétype** qui détermine ses goûts et son comportement :

```typescript
// /scripts/seed/archetypes.ts

const ARCHETYPES = [
  {
    name: 'ACTION_JUNKIE',
    weight: 0.25, // 25% des comptes = 250 comptes
    description: 'Fan de manhwa action/fantasy, note haut les OP MC et les systèmes',
    preferredGenres: ['Action', 'Fantasy', 'Adventure'],
    preferredTropes: ['System', 'OP MC', 'Gates & Dungeons', 'Reincarnation'],
    avgScore: 7.5,
    scoreVariance: 1.5,
    librarySize: { min: 30, max: 150 },
    reviewProbability: 0.15, // 15% de chance d'écrire une review par titre
  },
  {
    name: 'ROMANCE_READER',
    weight: 0.20, // 200 comptes
    description: 'Fan de romance, slice of life, drama',
    preferredGenres: ['Romance', 'Drama', 'Slice of Life'],
    preferredTropes: ['Romance', 'School', 'Female Lead'],
    avgScore: 7.0,
    scoreVariance: 1.8,
    librarySize: { min: 20, max: 120 },
    reviewProbability: 0.20,
  },
  {
    name: 'MURIM_ENTHUSIAST',
    weight: 0.10, // 100 comptes
    description: 'Spécialiste murim et arts martiaux',
    preferredGenres: ['Action', 'Adventure'],
    preferredTropes: ['Murim / Martial Arts', 'Regression', 'Tower Climbing'],
    avgScore: 7.8,
    scoreVariance: 1.2,
    librarySize: { min: 40, max: 200 },
    reviewProbability: 0.12,
  },
  {
    name: 'CRITICAL_REVIEWER',
    weight: 0.10, // 100 comptes
    description: 'Note sévèrement, écrit des reviews longues et argumentées',
    preferredGenres: ['Drama', 'Psychological', 'Thriller'],
    preferredTropes: ['Dark & Mature', 'Politics & Intrigue', 'Villain MC'],
    avgScore: 6.0,
    scoreVariance: 2.0,
    librarySize: { min: 50, max: 250 },
    reviewProbability: 0.35,
  },
  {
    name: 'CASUAL_READER',
    weight: 0.20, // 200 comptes
    description: 'Lit un peu de tout, note rarement en dessous de 6',
    preferredGenres: ['Action', 'Comedy', 'Romance', 'Fantasy'],
    preferredTropes: [],
    avgScore: 7.2,
    scoreVariance: 1.0,
    librarySize: { min: 10, max: 60 },
    reviewProbability: 0.05,
  },
  {
    name: 'BINGE_READER',
    weight: 0.10, // 100 comptes
    description: 'Lit énormément, bibliothèque massive, note vite',
    preferredGenres: ['Action', 'Fantasy', 'Adventure', 'Comedy'],
    preferredTropes: ['Reincarnation', 'System', 'Isekai / Other World'],
    avgScore: 7.0,
    scoreVariance: 1.5,
    librarySize: { min: 100, max: 400 },
    reviewProbability: 0.03,
  },
  {
    name: 'MANHUA_SPECIALIST',
    weight: 0.05, // 50 comptes
    description: 'Lit principalement des manhua chinois',
    preferredGenres: ['Action', 'Fantasy', 'Romance'],
    preferredTropes: ['Reincarnation', 'OP MC', 'Murim / Martial Arts'],
    avgScore: 6.8,
    scoreVariance: 1.8,
    librarySize: { min: 30, max: 150 },
    reviewProbability: 0.08,
  },
]
```

#### 1.2 — Génération des profils utilisateurs

```typescript
// /scripts/seed/generate-users.ts

interface SeedUser {
  username: string
  email: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  locale: 'fr' | 'en'
  archetype: string
  is_seed: boolean  // TOUJOURS true — pour pouvoir les retirer plus tard
  created_at: Date  // Étalé sur 2-3 mois
}

// Règles pour les usernames :
// - Mix de styles : weeb (naruto_fan_42), normal (alex_reads), korean-inspired (manhwa_devourer)
// - Pas de pattern évident (pas user_001, user_002...)
// - 60% anglais, 40% français (pour matcher le public cible)

// Bio examples par archétype :
// ACTION_JUNKIE: "Solo Leveling got me into manhwa. Now I can't stop. 📖⚔️"
// ROMANCE_READER: "Je lis surtout des romances et des slice of life. Mon guilty pleasure."
// CRITICAL_REVIEWER: "I rate based on writing quality, art, and originality. No hype bias."

// Avatar : utiliser DiceBear API (https://api.dicebear.com/7.x/avataaars/svg?seed=username)
// Gratuit, déterministe, varié

// Dates de création : étalées sur les 90 derniers jours
// Distribution : plus de comptes créés récemment (simule une croissance)
// Semaine -12 à -8 : 100 comptes (les "early adopters")
// Semaine -8 à -4 : 300 comptes
// Semaine -4 à -1 : 400 comptes
// Cette semaine : 200 comptes
```

#### 1.3 — Génération des bibliothèques

```typescript
// /scripts/seed/generate-libraries.ts

// Pour chaque compte, générer une bibliothèque basée sur son archétype :

// 1. SÉLECTION DES TITRES
// - 70% des titres viennent des genres/tropes préférés de l'archétype
// - 30% aléatoires (pour la diversité)
// - Les manhwas populaires (ext_popularity_anilist élevé) ont plus de chances d'être sélectionnés
//   → Simule le fait que tout le monde a lu Solo Leveling

// 2. STATUTS RÉALISTES
// Distribution des statuts par bibliothèque :
const STATUS_DISTRIBUTION = {
  COMPLETED: 0.35,    // 35% terminés
  READING: 0.25,      // 25% en cours
  PLAN_TO_READ: 0.25, // 25% à lire
  ON_HOLD: 0.08,      // 8% en pause
  DROPPED: 0.05,      // 5% abandonné
  REREADING: 0.02,    // 2% en relecture
}

// 3. PROGRESSION RÉALISTE
// - COMPLETED → progress = chapter_count
// - READING → progress = random entre 10% et 90% du chapter_count
// - PLAN_TO_READ → progress = 0
// - ON_HOLD → progress = random entre 20% et 60%
// - DROPPED → progress = random entre 5% et 40%

// 4. DATES RÉALISTES
// - started_at = entre la date de création du compte et maintenant
// - completed_at = après started_at (si COMPLETED)
// - Les titres terminés récents ont des dates plus récentes
```

#### 1.4 — Génération des scores

**C'est le plus critique.** Les scores doivent être réalistes et alignés sur AniList sans être identiques.

```typescript
// /scripts/seed/generate-scores.ts

function generateScore(
  manhwa: ManhwaData,
  archetype: Archetype,
): number | null {
  // Seuls les COMPLETED et certains READING notent
  // 80% des COMPLETED notent, 30% des READING notent
  
  // Score de base = score AniList converti en /10
  // AniList est en /100, on divise par 10
  const anilistScore = manhwa.ext_score_anilist // déjà en /10
  if (!anilistScore) return null
  
  // Ajustement par archétype
  // - Si le manhwa match les genres préférés → bonus +0.3 à +0.8
  // - Si le manhwa ne match pas → malus -0.3 à -0.5
  const genreMatch = manhwa.genres.some(g => archetype.preferredGenres.includes(g))
  const tropeMatch = manhwa.tropes.some(t => archetype.preferredTropes.includes(t))
  
  let adjustment = 0
  if (genreMatch && tropeMatch) adjustment = randomBetween(0.3, 0.8)
  else if (genreMatch || tropeMatch) adjustment = randomBetween(0, 0.4)
  else adjustment = randomBetween(-0.5, 0.1)
  
  // Variance individuelle (personnalité du compte)
  const personalVariance = gaussianRandom(0, archetype.scoreVariance * 0.5)
  
  // Score final
  let score = anilistScore + adjustment + personalVariance
  
  // Clamper entre 1 et 10
  score = Math.max(1, Math.min(10, score))
  
  // Arrondir au 0.5 le plus proche (comme les vrais utilisateurs)
  score = Math.round(score * 2) / 2
  
  return score
}
```

**Objectif de distribution des votes :**

```
Tier 1 (top 50 manhwas par popularité AniList)  → 80-150 votes chacun → Phase MATURE
Tier 2 (top 51-200)                              → 30-80 votes         → Phase GROWING/MATURE
Tier 3 (top 201-500)                             → 10-30 votes         → Phase GROWING
Tier 4 (top 501-1000)                            → 3-10 votes          → Phase BOOTSTRAP
Tier 5 (reste)                                    → 0-3 votes           → Phase BOOTSTRAP
```

Ceci garantit tes objectifs : 100+ manhwas en phase Mature, 500+ en Growing.

#### 1.5 — Génération des reviews

```typescript
// /scripts/seed/generate-reviews.ts

// Deux types de reviews :
// 1. Avis rapides (is_micro = true) : 1-2 phrases, 80% des reviews
// 2. Critiques longues (is_micro = false) : 200-800 mots, 20% des reviews

// Les reviews sont générées par l'IA (Claude API) avec un prompt spécifique :
// - Le prompt inclut le titre, le genre, le score donné par l'utilisateur, et l'archétype
// - L'IA génère une review qui sonne comme un vrai fan, pas comme un bot
// - Variété de tons : enthousiaste, critique, nuancé, drôle, nostalgique

// IMPORTANT : ne PAS générer toutes les reviews d'un coup
// Étaler les reviews sur la même période que les dates d'activité
// Les reviews longues viennent surtout des CRITICAL_REVIEWER

// Template de prompt pour Claude API :
const REVIEW_PROMPT = `
Tu es {username}, un lecteur de manhwa avec le profil suivant : {archetype_description}.
Tu as lu "{manhwa_title}" ({genres}) et tu lui as donné {score}/10.

Écris un avis {micro ? "rapide (1-2 phrases)" : "détaillé (200-400 mots)"} sur ce manhwa.
Ton avis doit :
- Être en {locale === 'fr' ? 'français' : 'anglais'}
- Refléter ton score ({score}/10) — si c'est élevé sois enthousiaste, si c'est bas sois critique
- Mentionner des aspects spécifiques (art, histoire, personnages)
- Avoir un ton naturel, comme un vrai post sur un forum
- NE PAS mentionner AniList, MyAnimeList, ou d'autres plateformes
- NE PAS commencer par "En tant que..." ou "Je suis un fan de..."
`

// Score dimensions (pour les reviews longues) :
// - score_story : score ± random(-1, +1)
// - score_art : score ± random(-1.5, +1.5) — l'art est plus subjectif
// - score_characters : score ± random(-1, +1)
// - score_world : score ± random(-0.5, +0.5)
```

#### 1.6 — Génération des réactions coréennes

```typescript
// /scripts/seed/generate-reactions.ts

// Chaque compte a une probabilité de réagir à un manhwa qu'il a lu
// Probabilité : 40% pour les titres notés ≥ 8, 20% pour les autres

// Mapping score → réactions probables :
// Score 9-10 : 대박 (60%), 미쳤 (40%), 죽겠 (30%)
// Score 7-8  : 감동 (30%), 대박 (20%)
// Score 5-6  : 킹받 (20%), 헐 (15%)
// Score 1-4  : 킹받 (40%), 헐 (30%)

// Un utilisateur peut avoir 1-3 réactions par manhwa
```

#### 1.7 — Génération des votes personnage favori

```typescript
// /scripts/seed/generate-character-votes.ts

// Pour chaque titre avec des personnages importés :
// - 60% des lecteurs qui ont noté ≥ 7 votent pour un personnage
// - Le personnage MAIN a ~50% des votes
// - Les SUPPORTING se partagent le reste (pondéré par leur popularité AniList)
```

#### 1.8 — Génération des relations sociales (follows)

```typescript
// /scripts/seed/generate-follows.ts

// Chaque compte suit 5-30 autres comptes
// Les comptes du même archétype se suivent plus (communauté)
// Les CRITICAL_REVIEWER sont plus suivis (influenceurs)
// Créer des petits clusters de "amis" qui se suivent mutuellement
```

#### 1.9 — Génération des favoris

```typescript
// /scripts/seed/generate-favorites.ts

// 20% des titres notés ≥ 8 sont mis en favoris
// 5% des titres notés 7 sont mis en favoris
// 0% en dessous de 7
```

### Le script principal

```typescript
// /scripts/seed/run-seed.ts

async function main() {
  console.log('🌱 Starting ManhwaVerse community seed...\n')
  
  // Étape 1 : Créer les 1000 comptes
  console.log('1/8 Creating 1000 user accounts...')
  const users = await generateUsers(1000)
  console.log(`   ✅ ${users.length} users created\n`)
  
  // Étape 2 : Générer les bibliothèques
  console.log('2/8 Generating libraries...')
  const libraries = await generateLibraries(users)
  console.log(`   ✅ ${libraries.length} library entries created\n`)
  
  // Étape 3 : Générer les scores
  console.log('3/8 Generating scores...')
  const scores = await generateScores(users, libraries)
  console.log(`   ✅ ${scores.length} scores generated\n`)
  
  // Étape 4 : Recalculer les moyennes par manhwa
  console.log('4/8 Recalculating manhwa averages...')
  await recalculateManhwaAverages()
  console.log('   ✅ Averages recalculated\n')
  
  // Étape 5 : Générer les reviews (avec Claude API)
  console.log('5/8 Generating reviews...')
  const reviews = await generateReviews(users, libraries, scores)
  console.log(`   ✅ ${reviews.length} reviews generated\n`)
  
  // Étape 6 : Générer les réactions coréennes
  console.log('6/8 Generating Korean reactions...')
  const reactions = await generateReactions(users, libraries, scores)
  console.log(`   ✅ ${reactions.length} reactions generated\n`)
  
  // Étape 7 : Générer les votes personnages + favoris + follows
  console.log('7/8 Generating votes, favorites, follows...')
  const votes = await generateCharacterVotes(users, libraries, scores)
  const favs = await generateFavorites(users, libraries, scores)
  const follows = await generateFollows(users)
  console.log(`   ✅ ${votes} votes, ${favs} favorites, ${follows} follows\n`)
  
  // Étape 8 : Recalculer les scores display_*
  console.log('8/8 Recalculating display scores...')
  await recalculateAllScores()
  await recalculateTrendingScores()
  console.log('   ✅ Display scores recalculated\n')
  
  // Stats finales
  const matureCount = await prisma.manhwa.count({ where: { display_score_phase: 'MATURE' } })
  const growingCount = await prisma.manhwa.count({ where: { display_score_phase: 'GROWING' } })
  
  console.log('🎉 Seed complete!')
  console.log(`   Manhwas in MATURE phase: ${matureCount}`)
  console.log(`   Manhwas in GROWING phase: ${growingCount}`)
  console.log(`   Total library entries: ${libraries.length}`)
  console.log(`   Total reviews: ${reviews.length}`)
}
```

### Champ `is_seed` sur User

```prisma
model User {
  // ... champs existants ...
  is_seed     Boolean   @default(false)  // true pour les comptes générés
}
```

Ce champ permet de :
- Filtrer les comptes seed dans l'admin
- Les retirer progressivement quand la vraie communauté prend le relais
- Exclure leurs stats des métriques business (vrais users vs seed)

### Script de nettoyage (pour plus tard)

```typescript
// /scripts/seed/cleanup-seed.ts
// Quand tu as assez de vrais users, retirer progressivement les comptes seed
// Ne pas tout supprimer d'un coup — retirer 10% par semaine pour une transition douce

async function cleanupSeedUsers(percentage: number = 10) {
  const seedUsers = await prisma.user.findMany({
    where: { is_seed: true },
    take: Math.ceil(percentage / 100 * 1000),
    orderBy: { created_at: 'asc' }, // Retirer les plus anciens d'abord
  })
  
  for (const user of seedUsers) {
    // Supprimer toutes les données de ce user
    await prisma.userLibrary.deleteMany({ where: { user_id: user.id } })
    await prisma.review.deleteMany({ where: { user_id: user.id } })
    await prisma.manhwaReaction.deleteMany({ where: { user_id: user.id } })
    await prisma.characterVote.deleteMany({ where: { user_id: user.id } })
    await prisma.user.delete({ where: { id: user.id } })
  }
  
  // Recalculer les scores après suppression
  await recalculateAllScores()
}
```

---

## PHASE 2 — FEATURES PRÉ-LANCEMENT
> Déjà promptées, à exécuter après le seeding

### 2.1 — Corrections fiche manhwa
- Prompt : `PROMPT_AGENT_CORRECTIONS_V3.md`
- Titre visible, cover pas coupée, WhereToRead sidebar, i18n

### 2.2 — Quick Dropdown + List Editor Modal
- Prompt : `FIX_LIBRARY_DROPDOWN_TO_MODAL.md`

### 2.3 — Homepage upgrade
- Prompt : `PROMPT_HOMEPAGE_UPGRADE.md` + `PROMPT_HOMEPAGE_RANKING.md`
- Sections catégorisées, barre de filtres, hover popup, quick actions, classement podium

### 2.4 — Features pre-launch
- Prompt : `PROMPT_PRE_LAUNCH_FEATURES.md`
- Réactions coréennes, vote personnage, controversy score, polls, articles/blog

### 2.5 — Library + Reviews upgrade
- Prompt : `PROMPT_LIBRARY_REVIEWS_UPGRADE.md`
- Reviews longues mini-blog avec page dédiée

---

## PHASE 3 — PAGES SEO SUPPLÉMENTAIRES (post-lancement immédiat)

Ces pages sont faciles à créer car les données existent déjà via AniList.

### 3.1 — Pages People / Auteurs

```
Route : /people
Route : /people/[slug]

Contenu :
- Liste de tous les auteurs/illustrateurs importés
- Page individuelle : photo, bio, liste de leurs œuvres
- Filtres : par rôle (Author, Illustrator, Original Story)

Données : déjà dans la table Staff via AniList enrichment
SEO : "Chu-Gong manhwa" = page indexée
```

### 3.2 — Pages Characters

```
Route : /character (liste)
Route : /character/[slug]

Contenu :
- Liste de tous les personnages importés
- Page individuelle : portrait, description, manhwa d'apparition, rôle
- Vote favori (lié à la feature de vote personnage)

Données : déjà dans la table Character via AniList
SEO : "Sung Jin-Woo" = page indexée
```

### 3.3 — Pages Publishers / Companies

```
Route : /publisher (liste)
Route : /publisher/[slug]

Contenu :
- Liste des éditeurs/studios (Kakao, Naver, Tapas, Tappytoon...)
- Page individuelle : description, logo, liste de tous les manhwas publiés

Données : à enrichir via AniList (champ studio/publisher)
SEO : "Kakao manhwa list" = page indexée
```

### 3.4 — Relations animé + light novel (enrichir les fiches)

```
Sur chaque fiche manhwa, s'assurer que les relations sont bien affichées :

📺 ADAPTATIONS ANIMÉ
   Solo Leveling (TV, 2024) — 12 épisodes
   Solo Leveling Season 2 (TV, 2025) — en cours

📖 SOURCE
   Only I Level Up (Light Novel) par Chu-Gong — 270 chapitres

Données : déjà dans ManhwaRelation via AniList (types: ADAPTATION, SOURCE)
Juste s'assurer que l'affichage est clair avec des icônes distinctes
```

### 3.5 — Pages Help / About / FAQ

```
/about         → Présentation de ManhwaVerse, l'équipe, la mission
/help          → Centre d'aide
/faq           → Questions fréquentes
/contact       → Formulaire de contact
/report        → Signaler un problème / contenu
/privacy       → Politique de confidentialité (obligatoire RGPD)
/terms         → Conditions d'utilisation
```

---

## PHASE 4 — SYSTÈME DE NEWS + BLOG PUISSANT (mois 1-2)

### 4.1 — News automatiques IA

```
Workflow :
1. Un script scrape les sources de news manhwa (RSS feeds)
   - Anime News Network
   - Crunchyroll News
   - MyAnimeList News
   - Webtoon/Tapas announcements

2. L'IA inetenr a l'ide réécrit chaque news en FR et EN
   - Réécriture complète (pas de copie)
   - Ajout de contexte ManhwaVerse (liens vers les fiches)
   - Ton éditorial propre à ManhwaVerse

3. L'admin valide et publie (pas de publication auto)

Route : /news
Route : /news/[slug]

Type dans ArticleCategory : NEWS
```

### 4.2 — Blog utilisateurs (UGC)

```
Les utilisateurs peuvent écrire et publier des articles :
- Soumission par l'utilisateur
- Review par l'admin (modération avant publication)
- Les meilleurs articles apparaissent sur la homepage
- Chaque article = une page SEO avec maillage interne

Route : /blog (tous les articles)
Route : /blog/user/[username] (articles d'un utilisateur)

Système de karma/réputation pour les auteurs fréquents
Badge "Contributeur" sur le profil
```

### 4.3 — Événements manhwa

```
Route : /events

Contenu : conventions, expos, meet-ups liés au manhwa
Peut être un type d'article (ArticleCategory: EVENT)
Champs : date, lieu, lien, description, image

Simple et éditorial — pas besoin d'un système complexe
```

---

## PHASE 5 — STORE AFFILIÉ (mois 3-6)

### 5.1 — Phase 1 : Liens Amazon dans "Lire ce manhwa"

```
Ajouter un lien Amazon affilié pour les éditions physiques :

📖 Lire ce manhwa
   🇫🇷 Français
   [Delitoon] [Webtoon FR]
   
   📦 Édition physique
   [Acheter sur Amazon FR →] ← lien affilié tag=manhwaverse-21
   [Acheter sur Amazon US →] ← lien affilié tag=manhwaverse-20
```

### 5.2 — Phase 2 : Page store dédiée (mois 6+)

```
Route : /store

Catégories :
- Manhwa physiques (éditions reliées)
- Light novels
- Figurines & goodies
- Posters & artbooks

Tout en affiliation (Amazon, CDJapan, etc.)
Pas de stock propre — juste des liens affiliés
```

---

## PHASE 6 — FEATURES COMMUNAUTAIRES AVANCÉES (mois 6+, quand 25k+ users)

### 6.1 — Fan Art Gallery

```
Route : /artwork

Les utilisateurs postent leurs fan arts liés aux manhwas.
Utiliser le système de blog existant avec un tag #fanart.
Page dédiée qui filtre les posts avec images.
Bon pour le SEO images (Google Images).
```

### 6.2 — Listes thématiques publiques (inspiré Letterboxd)

```
Route : /lists
Route : /lists/[slug]

Les utilisateurs créent des listes publiques :
- "Les 20 manhwa qui m'ont fait pleurer"
- "Manhwa à lire avant de mourir"
- "Meilleurs manhwa murim pour débutants"

Chaque liste = une page SEO
Les meilleures listes remontent sur la homepage
Système de like sur les listes
```

### 6.3 — Reading Challenges annuels (inspiré Goodreads)

```
Route : /challenge/2026

"Lire 50 manhwa en 2026"
L'utilisateur fixe son objectif
Barre de progression visible sur son profil
Badge de complétion

Engagement + rétention
```

### 6.4 — Journal de lecture (inspiré Letterboxd)

```
Route : /profile/[username]/journal

Log chaque titre lu avec une date
"12 mars — Terminé Solo Leveling ★ 9"
"10 mars — Commencé Tower of God"

Comme un diary de lecture public
```

### 6.5 — Clubs (inspiré MAL) — quand 50k+ users

```
Route : /clubs
Route : /clubs/[slug]

Groupes d'intérêt créés par les utilisateurs :
- "Fans de Romance Isekai"
- "Le club des 1000 manhwa lus"
- "Murim Addicts"

Discussion interne, events, challenges
```

### 6.6 — PWA (Progressive Web App)

```
Avant une app native, transformer le site en PWA :
- Manifest.json
- Service worker pour le offline basique
- Installable sur mobile ("Ajouter à l'écran d'accueil")

Coût : quasi 0
Bénéfice : expérience "app-like" sur mobile
```

---

## RÉCAPITULATIF — ORDRE D'EXÉCUTION

```
MAINTENANT (cette semaine) :
├── Scoring Engine (PROMPT_SCORING_SYSTEM.md)
├── Script de seeding 1000 comptes (ce document)
└── Recalcul des scores display_*

AVANT LANCEMENT :
├── Corrections fiche manhwa (V3)
├── Quick Dropdown + List Editor Modal
├── Homepage upgrade + Ranking
├── Features pre-launch (réactions, votes, polls)
├── Pages help/about/FAQ/contact
└── Relations animé/LN sur les fiches

LANCEMENT :
├── Le site est live avec 1000 comptes seed
├── 100+ manhwas en phase Mature (scores MV)
├── Contenu communautaire visible (reviews, réactions, polls)
└── 10 articles blog publiés (SEO initial)

MOIS 1-2 (post-lancement) :
├── Pages People / Characters / Publishers
├── News automatiques IA
├── Blog utilisateurs (UGC)
├── Liens Amazon affiliés
└── Événements manhwa

MOIS 3-6 :
├── Fan Art Gallery
├── Listes thématiques publiques
├── Reading Challenges
├── Journal de lecture
├── Store affilié page dédiée
└── PWA

MOIS 6+ (quand 25k+ users) :
├── Clubs
├── Reading Rooms / Chat (si nécessaire)
└── App native (si revenus le justifient)
```

---

## NOTES IMPORTANTES

### Ce qu'on NE FAIT PAS (décisions fermes) :
- ❌ Reddit interne / forums par manhwa (Discord suffit)
- ❌ Hébergement d'auteurs indépendants (autre métier)
- ❌ Répertorier les scans individuels (zone grise légale)
- ❌ App native (trop tôt, PWA d'abord)
- ❌ Clubs (trop tôt, besoin de 50k+ users)

### Le seeding est TEMPORAIRE :
- Tous les comptes seed ont `is_seed = true`
- Script de nettoyage progressif (10% par semaine)
- Ne jamais supprimer d'un coup (transition douce)
- Objectif : retirer 100% des seed quand tu as 5000+ vrais users actifs
