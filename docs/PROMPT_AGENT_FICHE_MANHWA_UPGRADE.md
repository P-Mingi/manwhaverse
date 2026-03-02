# 🎯 MISSION — Upgrade complet de la fiche manhwa `/manhwa/[slug]`
> Branch : `feat/manhwa-detail-upgrade`
> Ne PAS changer le design system existant (dark mode, couleurs, Tailwind classes). Ajouter du CONTENU et de la STRUCTURE uniquement.

---

## ⚠️ PREMIÈRE ACTION (avant tout code)

```bash
git checkout main
git pull origin main
git checkout -b feat/manhwa-detail-upgrade
```

Tout le travail de cette mission se fait exclusivement sur cette branche. Ne jamais commit directement sur `main`. À la fin de la mission, faire un dernier commit propre et pousser :

```bash
git push origin feat/manhwa-detail-upgrade
```

---

## CONTEXTE

La fiche manhwa actuelle est fonctionnelle mais pauvre en contenu comparée à AniList. Cette mission ajoute :
1. Hero banner image
2. Navigation par onglets (Overview / Characters / Staff / Reviews / Stats)
3. Sidebar enrichie avec metadata complètes
4. Section Relations/Adaptations
5. Section Characters avec portraits
6. Section Staff détaillée
7. Onglet Stats avec graphiques (Score Distribution, Status Distribution, Rankings, Activity)
8. Bouton Favori séparé
9. Activity feed par titre
10. Reviews améliorées (titre, tri par likes)

**Règle absolue :** Garder le style visuel actuel (dark mode, typographie, couleurs existantes). On enrichit le contenu, on ne refait pas le design.

---

## ÉTAPE 0 — NOUVELLES TABLES PRISMA

### 0.1 — Table `Character` (NOUVELLE — n'existe pas encore)

```prisma
model Character {
  id            String    @id @default(cuid())
  slug          String    @unique
  
  // Noms
  name_en       String    // "Jin-U Seong"
  name_native   String?   // "성진우" (coréen)
  name_alt      String[]  // noms alternatifs
  
  // Infos
  description   String?   @db.Text
  age           String?   // "23" ou "Unknown"
  gender        String?   // "Male", "Female", "Non-binary"
  
  // Image
  image_url     String?
  
  // Source externe
  anilist_id    Int?      @unique
  
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  // Relations
  manhwa_links  ManhwaCharacter[]
  
  @@index([slug])
}

model ManhwaCharacter {
  manhwa_id     String
  manhwa        Manhwa    @relation(fields: [manhwa_id], references: [id])
  character_id  String
  character     Character @relation(fields: [character_id], references: [id])
  role          CharacterRole   // MAIN, SUPPORTING, BACKGROUND
  voice_actor   String?         // pour les adaptations anime (optionnel)
  
  @@id([manhwa_id, character_id])
  @@index([manhwa_id, role])
}

enum CharacterRole {
  MAIN
  SUPPORTING
  BACKGROUND
}
```

### 0.2 — Modifications table `Manhwa` (vérifier que ces champs existent)

Les champs suivants doivent exister (ils sont déjà dans le schéma spec) :
- `banner_url String?` ✅ déjà dans le schéma
- `favorite_count Int @default(0)` ✅ déjà dans le schéma
- `reader_count Int @default(0)` ✅ déjà dans le schéma

### 0.3 — Modifications table `Creator` (vérifier)

Le champ `anilist_id Int?` doit exister sur `Creator`. ✅ déjà dans le schéma.

### 0.4 — Ajouter la relation ManhwaCharacter à Manhwa

```prisma
// Dans le model Manhwa, ajouter :
characters    ManhwaCharacter[]
```

### 0.5 — La table `ManhwaRelation` existe déjà dans le schéma spec

```prisma
model ManhwaRelation {
  id            String    @id @default(cuid())
  source_id     String
  target_id     String
  relation_type RelationType  // ADAPTATION, SEQUEL, PREQUEL, SIDE_STORY, etc.
  
  @@unique([source_id, target_id, relation_type])
}
```

**⚠️ Vérifier si cette table existe déjà en DB.** Si non, la créer. Si elle existe dans le schéma Prisma mais pas en DB, lancer la migration.

### Migration

```bash
npx prisma migrate dev --name add-characters-and-relations
npx prisma generate
```

---

## ÉTAPE 1 — SCRIPT D'IMPORT ANILIST API

### 1.1 — Créer `/lib/ingestion/anilist-enrich.ts`

Ce script enrichit les manhwas existants avec les données manquantes depuis l'API AniList GraphQL.

**Endpoint AniList :** `https://graphql.anilist.co` (POST, pas besoin d'auth pour la lecture)

**Query GraphQL pour récupérer TOUT ce qu'il nous faut :**

```graphql
query GetManhwaDetails($anilistId: Int!) {
  Media(id: $anilistId, type: MANGA) {
    # Banner
    bannerImage
    
    # Metadata enrichie
    volumes
    startDate { year month day }
    endDate { year month day }
    source
    popularity
    favourites
    meanScore
    averageScore
    
    # Relations (adaptations, sequels, etc.)
    relations {
      edges {
        relationType
        node {
          id
          title { english romaji native }
          type
          format
          coverImage { large }
          status
        }
      }
    }
    
    # Characters
    characters(sort: [ROLE, RELEVANCE], perPage: 25) {
      edges {
        role
        node {
          id
          name { full native }
          image { large }
          description(asHtml: false)
          age
          gender
        }
      }
    }
    
    # Staff
    staff(sort: RELEVANCE, perPage: 10) {
      edges {
        role
        node {
          id
          name { full native }
          image { large }
        }
      }
    }
    
    # Stats
    stats {
      scoreDistribution { score amount }
      statusDistribution { status amount }
    }
    
    # Rankings
    rankings {
      rank
      type
      year
      allTime
      context
      season
    }
  }
}
```

### 1.2 — Logique d'import

```typescript
// /lib/ingestion/anilist-enrich.ts

import { prisma } from '@/lib/db/client'

const ANILIST_API = 'https://graphql.anilist.co'

interface AniListResponse {
  data: {
    Media: AniListMedia
  }
}

// Rate limit AniList : 90 requêtes par minute
// Implémenter un sleep de 700ms entre chaque requête

export async function enrichManhwaFromAniList(anilistId: number): Promise<void> {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: ANILIST_QUERY, // la query ci-dessus
      variables: { anilistId },
    }),
  })
  
  const json: AniListResponse = await response.json()
  const media = json.data.Media
  
  // 1. Mettre à jour le manhwa (banner, volumes, dates, popularity, favourites)
  await updateManhwaMetadata(anilistId, media)
  
  // 2. Importer les characters
  await importCharacters(anilistId, media.characters.edges)
  
  // 3. Importer les relations
  await importRelations(anilistId, media.relations.edges)
  
  // 4. Mettre à jour le staff/creators avec les rôles détaillés
  await updateStaffDetails(anilistId, media.staff.edges)
  
  // 5. Stocker les stats AniList (scoreDistribution, statusDistribution)
  // → Stocker en JSON dans un nouveau champ ou une table dédiée
}

export async function enrichAllManhwas(): Promise<void> {
  // Récupérer tous les manhwas avec un anilist_id
  const manhwas = await prisma.manhwa.findMany({
    where: { anilist_id: { not: null } },
    select: { id: true, anilist_id: true, slug: true },
  })
  
  console.log(`Enriching ${manhwas.length} manhwas from AniList...`)
  
  for (const manhwa of manhwas) {
    try {
      await enrichManhwaFromAniList(manhwa.anilist_id!)
      console.log(`✅ ${manhwa.slug}`)
      await sleep(700) // respect rate limit
    } catch (error) {
      console.error(`❌ ${manhwa.slug}:`, error)
    }
  }
}
```

### 1.3 — Fonctions d'import détaillées

```typescript
async function updateManhwaMetadata(anilistId: number, media: AniListMedia) {
  await prisma.manhwa.update({
    where: { anilist_id: anilistId },
    data: {
      banner_url: media.bannerImage ?? undefined,
      volume_count: media.volumes ?? undefined,
      // NE PAS écraser les champs déjà remplis manuellement
      // Utiliser une logique "fill only if null"
      ...(media.popularity && { reader_count: media.popularity }),
      ...(media.favourites && { favorite_count: media.favourites }),
    },
  })
}

async function importCharacters(
  anilistId: number, 
  edges: AniListCharacterEdge[]
) {
  const manhwa = await prisma.manhwa.findUnique({ 
    where: { anilist_id: anilistId },
    select: { id: true } 
  })
  if (!manhwa) return
  
  for (const edge of edges) {
    const char = edge.node
    
    // Upsert character
    const character = await prisma.character.upsert({
      where: { anilist_id: char.id },
      create: {
        slug: slugify(char.name.full),
        name_en: char.name.full,
        name_native: char.name.native ?? null,
        description: char.description ?? null,
        age: char.age ?? null,
        gender: char.gender ?? null,
        image_url: char.image?.large ?? null,
        anilist_id: char.id,
      },
      update: {
        image_url: char.image?.large ?? undefined,
        // Mettre à jour l'image si elle a changé
      },
    })
    
    // Créer le lien manhwa <-> character
    await prisma.manhwaCharacter.upsert({
      where: {
        manhwa_id_character_id: {
          manhwa_id: manhwa.id,
          character_id: character.id,
        },
      },
      create: {
        manhwa_id: manhwa.id,
        character_id: character.id,
        role: mapAniListRole(edge.role), // "MAIN" | "SUPPORTING" | "BACKGROUND"
      },
      update: {
        role: mapAniListRole(edge.role),
      },
    })
  }
}

async function importRelations(
  anilistId: number,
  edges: AniListRelationEdge[]
) {
  const sourceManhwa = await prisma.manhwa.findUnique({
    where: { anilist_id: anilistId },
    select: { id: true },
  })
  if (!sourceManhwa) return
  
  for (const edge of edges) {
    // Vérifier si le target existe dans notre DB
    const targetManhwa = await prisma.manhwa.findUnique({
      where: { anilist_id: edge.node.id },
      select: { id: true },
    })
    
    // Si le target n'est pas dans notre DB, on le skip pour l'instant
    // On pourrait créer un "stub" minimal pour les adaptations anime
    if (!targetManhwa) continue
    
    const relationType = mapAniListRelationType(edge.relationType)
    if (!relationType) continue
    
    await prisma.manhwaRelation.upsert({
      where: {
        source_id_target_id_relation_type: {
          source_id: sourceManhwa.id,
          target_id: targetManhwa.id,
          relation_type: relationType,
        },
      },
      create: {
        source_id: sourceManhwa.id,
        target_id: targetManhwa.id,
        relation_type: relationType,
      },
      update: {},
    })
  }
}

function mapAniListRole(role: string): 'MAIN' | 'SUPPORTING' | 'BACKGROUND' {
  switch (role) {
    case 'MAIN': return 'MAIN'
    case 'SUPPORTING': return 'SUPPORTING'
    default: return 'BACKGROUND'
  }
}

function mapAniListRelationType(type: string): RelationType | null {
  const map: Record<string, RelationType> = {
    'ADAPTATION': 'ADAPTATION',
    'SOURCE': 'SOURCE',
    'SEQUEL': 'SEQUEL',
    'PREQUEL': 'PREQUEL',
    'SIDE_STORY': 'SIDE_STORY',
    'ALTERNATIVE': 'ALTERNATIVE',
  }
  return map[type] ?? null
}
```

### 1.4 — Stocker les stats AniList pour l'onglet Stats

On a besoin de stocker `scoreDistribution` et `statusDistribution` quelque part. Deux options :

**Option A (recommandée) : Champ JSON sur Manhwa**

```prisma
// Ajouter au model Manhwa :
anilist_stats   Json?   // { scoreDistribution: [...], statusDistribution: [...], rankings: [...] }
```

Ce champ stocke les stats AniList brutes qu'on affichera dans l'onglet Stats. On le met à jour lors de l'enrichissement.

```typescript
await prisma.manhwa.update({
  where: { anilist_id: anilistId },
  data: {
    anilist_stats: {
      scoreDistribution: media.stats.scoreDistribution,
      statusDistribution: media.stats.statusDistribution,
      rankings: media.rankings,
    },
  },
})
```

### 1.5 — Script cron pour enrichissement régulier

```typescript
// /app/api/cron/enrich-anilist/route.ts
// Cron Vercel : tous les dimanches à 3h du matin
// Enrichit les 100 manhwas les plus populaires qui n'ont pas été mis à jour depuis 7 jours

export async function GET(request: Request) {
  // Vérifier le header d'auth cron Vercel
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  const manhwas = await prisma.manhwa.findMany({
    where: {
      anilist_id: { not: null },
      OR: [
        { banner_url: null }, // pas encore enrichi
        { updated_at: { lt: subDays(new Date(), 7) } }, // pas mis à jour depuis 7 jours
      ],
    },
    orderBy: { reader_count: 'desc' },
    take: 100,
    select: { anilist_id: true, slug: true },
  })
  
  let success = 0
  let errors = 0
  
  for (const m of manhwas) {
    try {
      await enrichManhwaFromAniList(m.anilist_id!)
      success++
      await sleep(700)
    } catch {
      errors++
    }
  }
  
  return Response.json({ success, errors, total: manhwas.length })
}
```

---

## ÉTAPE 2 — QUERIES DB (fichiers `/lib/db/`)

### 2.1 — `/lib/db/manhwa.ts` — Enrichir la query principale

```typescript
// Ajouter à la query getManhwaBySlug existante :

export async function getManhwaBySlug(slug: string) {
  return prisma.manhwa.findUnique({
    where: { slug },
    include: {
      creator_links: { 
        include: { creator: true },
      },
      genre_links: { 
        include: { genre: true },
      },
      trope_links: { 
        include: { trope: true },
        orderBy: { upvotes: 'desc' },
      },
      read_links: true,
      // NOUVEAU — Relations
      similar_to: {
        include: { 
          target: { select: { id: true, slug: true, title_en: true, cover_url: true, type: true, status: true } }
        },
        take: 6,
        orderBy: { similarity: 'desc' },
      },
    },
  })
}
```

### 2.2 — `/lib/db/character.ts` (NOUVEAU)

```typescript
export async function getCharactersByManhwaId(manhwaId: string) {
  return prisma.manhwaCharacter.findMany({
    where: { manhwa_id: manhwaId },
    include: {
      character: true,
    },
    orderBy: [
      { role: 'asc' }, // MAIN first, then SUPPORTING, then BACKGROUND
    ],
  })
}

export async function getCharacterBySlug(slug: string) {
  return prisma.character.findUnique({
    where: { slug },
    include: {
      manhwa_links: {
        include: {
          manhwa: {
            select: { id: true, slug: true, title_en: true, cover_url: true },
          },
        },
      },
    },
  })
}
```

### 2.3 — `/lib/db/relation.ts` (NOUVEAU)

```typescript
export async function getRelationsByManhwaId(manhwaId: string) {
  // Relations dans les deux sens (source et target)
  const [asSource, asTarget] = await Promise.all([
    prisma.manhwaRelation.findMany({
      where: { source_id: manhwaId },
      include: {
        target: {
          select: { 
            id: true, slug: true, title_en: true, 
            cover_url: true, type: true, status: true,
          },
        },
      },
    }),
    prisma.manhwaRelation.findMany({
      where: { target_id: manhwaId },
      include: {
        source: {
          select: { 
            id: true, slug: true, title_en: true, 
            cover_url: true, type: true, status: true,
          },
        },
      },
    }),
  ])
  
  return { asSource, asTarget }
}
```

### 2.4 — `/lib/db/stats.ts` (NOUVEAU)

```typescript
export async function getManhwaStats(manhwaId: string) {
  // Status distribution (combien de users par statut)
  const statusDistribution = await prisma.userLibrary.groupBy({
    by: ['status'],
    where: { manhwa_id: manhwaId },
    _count: true,
  })
  
  // Score distribution (répartition des notes)
  // On group par score arrondi (1-10)
  const rawScores = await prisma.userLibrary.findMany({
    where: { 
      manhwa_id: manhwaId,
      score: { not: null },
    },
    select: { score: true },
  })
  
  const scoreDistribution = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: rawScores.filter(r => Math.round(r.score!) === i + 1).length,
  }))
  
  // Activité récente (dernières 30 actions sur ce titre)
  const recentActivity = await prisma.activity.findMany({
    where: { manhwa_id: manhwaId },
    include: {
      user: { select: { username: true, avatar_url: true, display_name: true } },
    },
    orderBy: { created_at: 'desc' },
    take: 30,
  })
  
  return { statusDistribution, scoreDistribution, recentActivity }
}

export async function getManhwaRankings(manhwaId: string) {
  // Calculer le rang du manhwa dans différents classements
  const manhwa = await prisma.manhwa.findUnique({
    where: { id: manhwaId },
    select: { score_avg: true, score_count: true, reader_count: true, release_year: true },
  })
  if (!manhwa) return null
  
  const rankings: Array<{ label: string; rank: number; type: 'rating' | 'popularity' }> = []
  
  // Highest Rated All Time (parmi ceux avec 10+ votes)
  if (manhwa.score_avg && manhwa.score_count >= 10) {
    const higherRated = await prisma.manhwa.count({
      where: {
        score_count: { gte: 10 },
        score_avg: { gt: manhwa.score_avg },
        is_published: true,
      },
    })
    rankings.push({ label: 'Highest Rated All Time', rank: higherRated + 1, type: 'rating' })
  }
  
  // Most Popular All Time
  if (manhwa.reader_count > 0) {
    const morePopular = await prisma.manhwa.count({
      where: {
        reader_count: { gt: manhwa.reader_count },
        is_published: true,
      },
    })
    rankings.push({ label: 'Most Popular All Time', rank: morePopular + 1, type: 'popularity' })
  }
  
  // Highest Rated [year] (si on a l'année)
  if (manhwa.release_year && manhwa.score_avg && manhwa.score_count >= 10) {
    const higherRatedYear = await prisma.manhwa.count({
      where: {
        release_year: manhwa.release_year,
        score_count: { gte: 10 },
        score_avg: { gt: manhwa.score_avg },
        is_published: true,
      },
    })
    rankings.push({ 
      label: `Highest Rated ${manhwa.release_year}`, 
      rank: higherRatedYear + 1, 
      type: 'rating' 
    })
  }
  
  return rankings
}
```

### 2.5 — `/lib/db/review.ts` — Améliorer les reviews

```typescript
export async function getReviewsByManhwaId(
  manhwaId: string,
  { sortBy = 'likes', page = 1, perPage = 10 }: {
    sortBy?: 'likes' | 'recent'
    page?: number
    perPage?: number
  } = {}
) {
  const orderBy = sortBy === 'likes' 
    ? { likes_count: 'desc' as const }
    : { created_at: 'desc' as const }
  
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { manhwa_id: manhwaId, deleted_at: null },
      include: {
        user: { select: { username: true, avatar_url: true, display_name: true } },
      },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.review.count({
      where: { manhwa_id: manhwaId, deleted_at: null },
    }),
  ])
  
  return { reviews, total, pages: Math.ceil(total / perPage) }
}
```

---

## ÉTAPE 3 — COMPOSANTS UI

### 3.1 — Hero Banner

**Fichier : `/components/features/manhwa/ManhwaBanner.tsx`**

```
Comportement :
- Si banner_url existe → afficher en background (full width, height ~250px, object-cover)
- Ajouter un gradient overlay du bas vers le haut (noir → transparent) pour la lisibilité
- La cover du manhwa chevauche la banner (position absolute, dépasse de ~50% en bas)
- Si pas de banner → garder le layout actuel (pas de banner, cover inline)
- Image via next/image avec priority pour le LCP

Layout (comme AniList) :
┌─────────────────────────────────────────────────┐
│             BANNER IMAGE (full width)            │
│                                                   │
│    ┌──────┐                                       │
│    │COVER │  ← chevauche la banner               │
│    │      │                                       │
│    └──────┘                                       │
├─────────────────────────────────────────────────┤
│  Cover ici    │  Title                            │
│  (suite)      │  Title KR                         │
│               │  Synopsis                          │
│  [Add to lib] │                                   │
│  [♥ Fav]      │                                   │
└─────────────────────────────────────────────────┘
```

### 3.2 — Tab Navigation

**Fichier : `/components/features/manhwa/ManhwaTabNav.tsx`**

```
Onglets : Overview | Characters | Staff | Reviews | Stats

- Utiliser des query params ou hash pour la navigation (?tab=characters)
- OU utiliser des sections avec scroll-into-view et URL hash (#characters)
- Tab actif : souligné avec la couleur accent existante
- Sticky en haut quand on scroll past la banner
- Server Components pour chaque onglet (lazy loaded)

Recommandation : Utiliser des sub-routes Next.js :
/manhwa/[slug]              → Overview (default)
/manhwa/[slug]/characters   → Characters
/manhwa/[slug]/staff        → Staff  
/manhwa/[slug]/reviews      → Reviews
/manhwa/[slug]/stats        → Stats

Alternative (si on ne veut pas de sub-routes) :
Un seul page.tsx avec des sections conditionnelles basées sur un searchParam ?tab=
```

### 3.3 — Sidebar enrichie

**Modifier le composant sidebar existant pour ajouter :**

```
INFOS (enrichi)
──────────────────
Type          MANHWA
Status        Terminé
Chapters      201
Volumes       15          ← NOUVEAU (si volume_count existe)
Start Date    Mar 4, 2018 ← NOUVEAU (plus précis que "2018-2023")
End Date      May 31, 2023 ← NOUVEAU
Source        Web Novel    ← NOUVEAU
Origin        Korea

POPULARITY                  ← NOUVELLE SECTION
──────────────────
Readers       267,294      ← reader_count
Favorites     28,972       ← favorite_count

ALSO KNOWN AS              ← déjà existant
──────────────────
Na Honjaman Level Up
I Level Up Alone
...
```

### 3.4 — Rankings Badges

**Fichier : `/components/features/manhwa/RankingBadges.tsx`**

```
Afficher dans la sidebar, au-dessus de INFOS :

⭐ #96 Highest Rated All Time
❤️ #2 Most Popular All Time
⭐ #6 Highest Rated 2018

- Badges avec icône + texte
- Background subtil (card dark légère)
- Calculés depuis nos propres données (voir getManhwaRankings)
- N'afficher que si le rank est < 100 (sinon pas pertinent)
```

### 3.5 — Section Relations/Adaptations

**Fichier : `/components/features/manhwa/ManhwaRelations.tsx`**

```
Sur l'onglet Overview, section "Relations" :

Relations
─────────
[Cover1]    [Cover2]    [Cover3]    [Cover4]
Adaptation  Adaptation  Adaptation  Sequel

- Grille horizontale scrollable de cards
- Chaque card : cover small + label du type de relation en overlay bas
- Clic → lien vers la fiche (si dans notre DB) ou lien externe (AniList)
- Labels traduits (Adaptation, Suite, Prequel, Histoire parallèle)
```

### 3.6 — Section Characters

**Fichier : `/components/features/manhwa/ManhwaCharacters.tsx`**

```
Onglet "Characters" :

Grille 4 colonnes (desktop), 2 colonnes (mobile) :

┌──────────┬─────────────────────┐
│ [Portrait]│ Jin-U Seong         │
│           │ Main                │
└──────────┴─────────────────────┘
┌──────────┬─────────────────────┐
│ [Portrait]│ Hae-In Cha          │
│           │ Supporting          │
└──────────┴─────────────────────┘
...

- Portrait : image carrée ~80px, rounded
- Nom en bold, rôle en texte secondaire
- MAIN characters en premier, puis SUPPORTING
- Sur la vue Overview : afficher seulement les 6 premiers avec "See all characters →"
- Sur l'onglet Characters : afficher tous les personnages
```

### 3.7 — Section Staff (améliorer l'existant)

**Modifier l'affichage des créateurs pour montrer les rôles détaillés :**

```
Actuellement : "So-Ryeong Gi (author) · Hyeon-Gun (author) · Seong-Rak Jang (illustrator)"

Nouveau format (grille comme Characters) :

┌──────────┬─────────────────────┐
│ [Avatar] │ So-Ryeong Gi        │
│          │ Story (chs 1-92)    │
└──────────┴─────────────────────┘
┌──────────┬─────────────────────┐
│ [Avatar] │ Hyeon-Gun            │
│          │ Story (chs 93-201)  │
└──────────┴─────────────────────┘

- Même layout que les characters
- Si le creator a un avatar_url → l'afficher
- Si pas d'image → placeholder initiales ou icône générique
```

Note : les rôles détaillés (ex: "Story chs 1-92") viennent du champ `role` dans le staff AniList. On peut stocker ça dans un champ `role_detail` sur `ManhwaCreator` (ajouter ce champ String? au schéma si besoin).

### 3.8 — Onglet Stats

**Fichier : `/components/features/manhwa/ManhwaStats.tsx`**

```
Section Rankings :
┌──────────────────┬──────────────────┬──────────────────┐
│ ⭐ #96 Highest   │ ❤️ #2 Most       │ ⭐ #6 Highest   │
│ Rated All Time   │ Popular All Time │ Rated 2018      │
└──────────────────┴──────────────────┴──────────────────┘

Section Status Distribution :
┌─────────────────────────────────────────────────────────┐
│ [Completed]   [Current]    [Planning]    [Paused]       │
│  126,444       81,950       42,826        9,088         │
│ ████████████████████████████████████████████████        │
│ (barre colorée proportionnelle)                         │
└─────────────────────────────────────────────────────────┘

Section Score Distribution :
┌─────────────────────────────────────────────────────────┐
│ Histogramme vertical                                    │
│ Barres colorées du rouge (1) au vert (10)              │
│ Utiliser recharts (BarChart) ou un composant custom     │
└─────────────────────────────────────────────────────────┘

Section Activity récente :
Graph linéaire de l'activité des 30 derniers jours (si données suffisantes)
Utiliser recharts (LineChart)

IMPORTANT : 
- Si < 10 votes ManhwaVerse, utiliser les stats AniList (du champ anilist_stats JSON)
- Si ≥ 10 votes, afficher les stats ManhwaVerse ET les stats AniList en secondaire
- Toujours mentionner la source : "Source: AniList" ou "Source: ManhwaVerse community"
```

**Librairie graphiques : `recharts`** (déjà listé comme dépendance disponible)

### 3.9 — Bouton Favori

**Ajouter un bouton cœur ❤️ à côté de "Ajouter à la bibliothèque" :**

```
[Ajouter à la bibliothèque ▾] [♥]  [★ Noter]

- Le bouton ♥ toggle is_favorite dans UserLibrary
- Si l'user n'a pas le titre dans sa bibliothèque → l'ajouter automatiquement en PLAN_TO_READ + favori
- Optimistic update
- Server Action : toggleFavorite(manhwaId)
- Mettre à jour favorite_count sur Manhwa (dénormalisé)
```

### 3.10 — Reviews améliorées

**Modifier la section Critiques existante :**

```
Critiques (23)
──────────────
Tri : [Plus likées ▾] [Récentes]

┌─────────────────────────────────────────────────────────┐
│ [Avatar]  "My thoughts on Solo Leveling"     👍 665    │
│           @username · il y a 3 mois · 8/10             │
│           Premier paragraphe de la review...            │
│           [Lire la suite]                               │
└─────────────────────────────────────────────────────────┘

- Afficher le titre (si is_micro=false, utiliser les premiers mots)
- Avatar + username + date relative + score
- Preview du texte (premières ~150 chars)
- "Lire la suite" → expand ou page dédiée
- Tri par likes par défaut
- Pagination (10 par page)
```

### 3.11 — Activity feed par titre (onglet Stats ou section Overview)

**Fichier : `/components/features/manhwa/ManhwaActivity.tsx`**

```
Activité récente
────────────────
[Avatar] @username         il y a 2 min
         A lu les chapitres 27-82

[Avatar] @username         il y a 9 min
         A terminé ce manhwa

[Avatar] @username         il y a 9 min
         Ajouté à "À lire"

- Liste verticale des 20 dernières activités sur ce titre
- Avatar + username + action + timestamp relatif
- Types : ADDED_TO_LIBRARY, COMPLETED, RATED, REVIEWED, STARTED_READING, FAVORITED
- Placer dans l'onglet Stats (en bas) ou comme section dans Overview
```

---

## ÉTAPE 4 — PAGE STRUCTURE FINALE

### Layout de la page `/manhwa/[slug]/page.tsx` après upgrade :

```
┌─────────────────── BANNER (full width, ~250px) ──────────────────┐
│                    gradient overlay bottom                        │
│  ┌──────┐                                                        │
│  │COVER │                                                        │
└──┤      ├────────────────────────────────────────────────────────┘
   │      │  TITLE EN
   │      │  title_kr
   └──────┘  
             [Score MV ou Externe]  [Score AniList]
             
             Terminé · 201 chapitres · 2018-2023 · 267k readers
             
             Action · Adventure · Fantasy
             
             Auteurs (liens)
             
   [Ajouter à la bibliothèque ▾]  [♥]  [★ Noter]

─────────────────── TAB NAV (sticky) ──────────────────────────────
  Overview | Characters | Staff | Reviews | Stats
───────────────────────────────────────────────────────────────────

SIDEBAR (droite)          CONTENU PRINCIPAL
┌──────────────┐         ┌────────────────────────────────────────┐
│ ⭐ #96 Rated │         │ Synopsis                               │
│ ❤️ #2 Popular│         │ ...                                    │
│              │         │                                        │
│ INFOS        │         │ Relations                              │
│ Type: MANHWA │         │ [Cover] [Cover] [Cover]                │
│ Status: ...  │         │ Adapt.  Adapt.  Sequel                 │
│ Chapters: 201│         │                                        │
│ Volumes: 15  │         │ Characters (preview 6)                 │
│ Start: ...   │         │ [Port] Name  [Port] Name               │
│ End: ...     │         │ Main         Supporting                │
│ Source: ...  │         │ [See all →]                             │
│ Origin: Korea│         │                                        │
│              │         │ Tropes                                 │
│ POPULARITY   │         │ System · Gates & Dungeons · OP MC      │
│ Readers: 267k│         │                                        │
│ Favorites: 29k│        │ Lire légalement                        │
│              │         │ [Webtoon] [Tapas] [Lezhin] [Amazon]   │
│ ALSO KNOWN AS│         │                                        │
│ Na Honjaman  │         │ Critiques (23)                         │
│ I Level Up   │         │ [Review cards avec tri par likes]      │
│ ...          │         │                                        │
└──────────────┘         │ Titres similaires                      │
                         │ [Cover] [Cover] [Cover] [Cover]        │
                         └────────────────────────────────────────┘
```

---

## ÉTAPE 5 — SEO (obligatoire pour toute nouvelle page/route)

### 5.1 — Metadata enrichie

```typescript
// Si on crée des sub-routes pour les onglets :
// /manhwa/[slug]/characters/page.tsx

export async function generateMetadata({ params }): Promise<Metadata> {
  const manhwa = await getManhwaBySlug(params.slug)
  if (!manhwa) return {}
  
  return {
    title: `${manhwa.title_en} Characters — ManhwaVerse`,
    description: `All characters from ${manhwa.title_en}. Main and supporting characters with descriptions and images.`,
    alternates: {
      canonical: `https://manhwaverse.com/manhwa/${manhwa.slug}/characters`,
      languages: {
        'en': `https://manhwaverse.com/manhwa/${manhwa.slug}/characters`,
        'fr': `https://manhwaverse.com/fr/manhwa/${manhwa.slug}/characters`,
      },
    },
  }
}
```

### 5.2 — Structured Data enrichie

Ajouter au JSON-LD existant de la fiche :

```typescript
// Dans le JSON-LD CreativeWork, ajouter :
{
  "@type": "CreativeWork",
  // ... champs existants ...
  "character": characters.filter(c => c.role === 'MAIN').map(c => ({
    "@type": "Person",
    "name": c.character.name_en,
  })),
  "author": creators.filter(c => c.role === 'AUTHOR').map(c => ({
    "@type": "Person",
    "name": c.creator.name,
  })),
  "illustrator": creators.filter(c => c.role === 'ILLUSTRATOR').map(c => ({
    "@type": "Person",
    "name": c.creator.name,
  })),
}
```

---

## ÉTAPE 6 — CHECKLIST FINALE

Avant de merge la branche :

- [ ] Migration Prisma exécutée sans erreur (`Character`, `ManhwaCharacter`, champ `anilist_stats`)
- [ ] Script d'enrichissement AniList fonctionne pour 1 manhwa test (Solo Leveling)
- [ ] Script d'enrichissement batch fonctionne pour les 100 premiers
- [ ] Banner image s'affiche sur Solo Leveling
- [ ] Tab navigation fonctionne (Overview/Characters/Staff/Reviews/Stats)
- [ ] Sidebar affiche les nouvelles infos (volumes, dates, popularity, favorites)
- [ ] Rankings badges s'affichent si rank < 100
- [ ] Section Relations affiche les adaptations
- [ ] Section Characters affiche les portraits avec rôles
- [ ] Staff affiche les rôles détaillés
- [ ] Onglet Stats : Score Distribution + Status Distribution + Rankings
- [ ] Bouton Favori fonctionne (toggle + optimistic update + compteur)
- [ ] Reviews triées par likes par défaut
- [ ] Activity feed par titre fonctionne
- [ ] `generateMetadata()` sur toutes les nouvelles routes
- [ ] JSON-LD enrichi avec characters et creators
- [ ] Mobile responsive (375px) vérifié sur toutes les sections
- [ ] Lighthouse SEO > 90 sur la fiche
- [ ] Pas de `any` TypeScript
- [ ] Pas de strings hardcodés (tout via i18n)

---

## NOTES IMPORTANTES

1. **Ne pas casser l'existant.** Les fonctionnalités actuelles (bibliothèque, notation, reviews, liens de lecture) doivent continuer à fonctionner exactement comme avant.

2. **Fallbacks gracieux.** Si un manhwa n'a pas de banner → pas de banner section. Si pas de characters → pas d'onglet Characters. Si pas de stats → message "Pas encore de données".

3. **Performance.** Les onglets non-visibles ne doivent pas charger leurs données. Utiliser des Server Components avec Suspense + Skeleton pour chaque onglet.

4. **Rate limit AniList.** Max 90 req/min. Toujours `sleep(700)` entre les requêtes. Logger les erreurs 429.

5. **Ordre des opérations :**
   - D'abord la migration DB
   - Puis le script d'import (enrichir au moins les top 200 manhwas)
   - Puis les composants UI
   - Puis le SEO
   - Puis les tests manuels

6. **Stats AniList vs Stats ManhwaVerse.** Pour l'instant, la majorité des stats viendront d'AniList (stockées dans le champ JSON `anilist_stats`). Au fur et à mesure que la communauté ManhwaVerse grandit, les stats propres (calculées depuis `UserLibrary`) prendront le dessus. Toujours afficher la source.
