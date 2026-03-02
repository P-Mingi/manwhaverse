# 📊 SCORING SYSTEM — Transition automatique Bootstrap → Growing → Mature
> Branch : `feat/scoring-system` (NOUVELLE branche depuis main)

---

## ⚠️ PREMIÈRE ACTION

```bash
git checkout main
git pull origin main
git checkout -b feat/scoring-system
```

---

## CONTEXTE

ManhwaVerse n'a aucune donnée propre pour le moment. Toutes les notes, popularité, et classements viennent d'AniList. À mesure que la communauté grandit, les données ManhwaVerse doivent progressivement remplacer celles d'AniList. Cette transition doit être **100% automatique** — aucune intervention manuelle, aucun switch à activer.

---

## ARCHITECTURE — Le Scoring Engine

Créer un module centralisé `/lib/scoring/engine.ts` qui est le **SEUL point d'entrée** pour récupérer les scores, popularité et classements affichés. Tous les composants du site passent par ce module — jamais d'accès direct aux champs `score_avg` ou `ext_score_anilist`.

### Les 3 phases

| Phase | Condition (PAR MANHWA) | Score affiché | Popularité affichée | Source label |
|---|---|---|---|---|
| **Bootstrap** | `score_count < 10` | AniList | AniList popularity | "AniList" |
| **Growing** | `score_count >= 10 AND < 50` | Blend MV + AniList | Blend MV + AniList | "ManhwaVerse + AniList" |
| **Mature** | `score_count >= 50` | ManhwaVerse 100% | ManhwaVerse 100% | "ManhwaVerse" |

**IMPORTANT :** La phase est déterminée **par manhwa**, pas globalement. Solo Leveling peut être en phase Mature (beaucoup de votes MV) pendant qu'un manhwa obscur est encore en Bootstrap. C'est automatique et granulaire.

### Le module Scoring Engine

```typescript
// /lib/scoring/engine.ts

// ═══════════════════════════════════════════════════════════
// SEUILS — modifier ici pour ajuster la transition
// ═══════════════════════════════════════════════════════════

const THRESHOLDS = {
  GROWING_MIN_VOTES: 10,    // Minimum de votes MV pour entrer en phase Growing
  MATURE_MIN_VOTES: 50,     // Minimum de votes MV pour entrer en phase Mature
  GROWING_MIN_READERS: 20,  // Minimum de readers MV pour blend de popularité
  MATURE_MIN_READERS: 200,  // Minimum de readers MV pour popularité 100% MV
} as const

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type ScoringPhase = 'BOOTSTRAP' | 'GROWING' | 'MATURE'

interface DisplayScore {
  value: number | null       // Le score à afficher (0-10)
  source: string             // "AniList" | "ManhwaVerse + AniList" | "ManhwaVerse"
  phase: ScoringPhase
  mvScore: number | null     // Score MV brut (pour affichage secondaire)
  mvVotes: number            // Nombre de votes MV
  extScore: number | null    // Score AniList brut (pour affichage secondaire)
  extVotes: number | null    // Nombre de votes AniList
  confidence: number         // 0.0 - 1.0 : confiance dans le score (basé sur nb de votes)
}

interface DisplayPopularity {
  value: number              // Le nombre de lecteurs à afficher
  source: string
  phase: ScoringPhase
  mvReaders: number          // Readers MV réels
  extPopularity: number | null // Popularité AniList
}

interface ManhwaScoreData {
  score_avg: number | null
  score_count: number
  score_stddev: number | null
  ext_score_anilist: number | null
  ext_score_mal: number | null
  ext_score_composite: number | null
  ext_popularity_anilist: number | null
  reader_count: number
  favorite_count: number
}

// ═══════════════════════════════════════════════════════════
// PHASE DETECTION
// ═══════════════════════════════════════════════════════════

export function detectPhase(data: ManhwaScoreData): ScoringPhase {
  if (data.score_count >= THRESHOLDS.MATURE_MIN_VOTES) return 'MATURE'
  if (data.score_count >= THRESHOLDS.GROWING_MIN_VOTES) return 'GROWING'
  return 'BOOTSTRAP'
}

// ═══════════════════════════════════════════════════════════
// SCORE CALCULATION
// ═══════════════════════════════════════════════════════════

export function getDisplayScore(data: ManhwaScoreData): DisplayScore {
  const phase = detectPhase(data)
  
  const base = {
    mvScore: data.score_avg,
    mvVotes: data.score_count,
    extScore: data.ext_score_anilist ?? data.ext_score_composite ?? data.ext_score_mal,
    extVotes: data.ext_popularity_anilist, // Approximation
    phase,
  }
  
  switch (phase) {
    case 'MATURE': {
      // 100% ManhwaVerse
      return {
        ...base,
        value: data.score_avg,
        source: 'ManhwaVerse',
        confidence: Math.min(data.score_count / 200, 1.0), // Confiance max à 200 votes
      }
    }
    
    case 'GROWING': {
      // Blend progressif : plus il y a de votes MV, plus le poids MV augmente
      // À 10 votes : 20% MV / 80% AniList
      // À 30 votes : 60% MV / 40% AniList
      // À 49 votes : 98% MV / 2% AniList
      const extScore = data.ext_score_anilist ?? data.ext_score_composite ?? data.ext_score_mal
      
      if (data.score_avg && extScore) {
        const mvWeight = (data.score_count - THRESHOLDS.GROWING_MIN_VOTES) / 
                         (THRESHOLDS.MATURE_MIN_VOTES - THRESHOLDS.GROWING_MIN_VOTES)
        // mvWeight va de 0.0 (à 10 votes) à 1.0 (à 50 votes)
        const clampedWeight = Math.max(0.2, Math.min(mvWeight, 0.98))
        
        const blended = data.score_avg * clampedWeight + extScore * (1 - clampedWeight)
        
        return {
          ...base,
          value: Math.round(blended * 10) / 10, // Arrondir à 1 décimale
          source: 'ManhwaVerse + AniList',
          confidence: clampedWeight,
        }
      }
      
      // Si pas de score AniList, utiliser le score MV seul
      return {
        ...base,
        value: data.score_avg,
        source: 'ManhwaVerse',
        confidence: data.score_count / THRESHOLDS.MATURE_MIN_VOTES,
      }
    }
    
    case 'BOOTSTRAP': {
      // 100% données externes
      const extScore = data.ext_score_anilist ?? data.ext_score_composite ?? data.ext_score_mal
      let source = 'AniList'
      if (!data.ext_score_anilist && data.ext_score_mal) source = 'MAL'
      if (!data.ext_score_anilist && !data.ext_score_mal && data.ext_score_composite) source = 'Composite'
      
      return {
        ...base,
        value: extScore,
        source,
        confidence: extScore ? 0.5 : 0, // Confiance moyenne car données externes
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// POPULARITY CALCULATION
// ═══════════════════════════════════════════════════════════

export function getDisplayPopularity(data: ManhwaScoreData): DisplayPopularity {
  const mvReaders = data.reader_count
  const extPop = data.ext_popularity_anilist
  
  // Phase Mature : assez de readers MV
  if (mvReaders >= THRESHOLDS.MATURE_MIN_READERS) {
    return {
      value: mvReaders,
      source: 'ManhwaVerse',
      phase: 'MATURE',
      mvReaders,
      extPopularity: extPop,
    }
  }
  
  // Phase Growing : quelques readers MV, on blend
  if (mvReaders >= THRESHOLDS.GROWING_MIN_READERS && extPop) {
    const mvWeight = (mvReaders - THRESHOLDS.GROWING_MIN_READERS) /
                     (THRESHOLDS.MATURE_MIN_READERS - THRESHOLDS.GROWING_MIN_READERS)
    const clampedWeight = Math.max(0.1, Math.min(mvWeight, 0.9))
    
    // On ne blend pas les nombres (ça n'a pas de sens), on choisit la source
    // Mais on affiche les readers MV quand le poids est suffisant
    return {
      value: clampedWeight > 0.5 ? mvReaders : extPop,
      source: clampedWeight > 0.5 ? 'ManhwaVerse' : 'AniList',
      phase: 'GROWING',
      mvReaders,
      extPopularity: extPop,
    }
  }
  
  // Phase Bootstrap : utiliser AniList
  return {
    value: extPop ?? mvReaders,
    source: extPop ? 'AniList' : 'ManhwaVerse',
    phase: 'BOOTSTRAP',
    mvReaders,
    extPopularity: extPop,
  }
}

// ═══════════════════════════════════════════════════════════
// SORTING HELPERS (pour les sections homepage)
// ═══════════════════════════════════════════════════════════

/**
 * Retourne le champ et l'ordre de tri pour "Les plus populaires"
 * Utilise la popularité AniList tant qu'on n'a pas assez de données MV
 */
export function getPopularityOrderBy(globalMvReaders: number): object {
  // Si la majorité des manhwas ont < 200 readers MV → utiliser AniList
  // globalMvReaders = moyenne de reader_count sur tous les manhwas publiés
  if (globalMvReaders < THRESHOLDS.MATURE_MIN_READERS) {
    return { ext_popularity_anilist: 'desc' as const }
  }
  return { reader_count: 'desc' as const }
}

/**
 * Retourne le champ et l'ordre de tri pour "Les mieux notés"
 */
export function getTopRatedOrderBy(globalMvVotes: number): object {
  // Si la moyenne de score_count est < 50 → utiliser AniList
  if (globalMvVotes < THRESHOLDS.MATURE_MIN_VOTES) {
    return [
      { ext_score_anilist: 'desc' as const },
      { ext_popularity_anilist: 'desc' as const }, // tiebreaker
    ]
  }
  return [
    { score_avg: 'desc' as const },
    { score_count: 'desc' as const }, // tiebreaker
  ]
}

/**
 * Retourne le champ et l'ordre de tri pour "Tendances"
 */
export function getTrendingOrderBy(): object {
  // Les tendances sont toujours basées sur l'activité récente MV
  // Même avec peu d'users, les ajouts récents en bibliothèque = tendances
  return { trending_score: 'desc' as const }
}
```

---

## MISE À JOUR AUTOMATIQUE — Cron job pour les scores composites

Créer un script qui recalcule les scores affichés de tous les manhwas. Ce script tourne automatiquement (cron ou Vercel cron).

```typescript
// /lib/scoring/recalculate.ts

/**
 * Recalcule et stocke le score composite + la phase de chaque manhwa.
 * À exécuter toutes les heures (ou après chaque batch de votes).
 */
export async function recalculateAllScores() {
  const manhwas = await prisma.manhwa.findMany({
    where: { is_published: true },
    select: {
      id: true,
      score_avg: true,
      score_count: true,
      score_stddev: true,
      ext_score_anilist: true,
      ext_score_mal: true,
      ext_score_composite: true,
      ext_popularity_anilist: true,
      reader_count: true,
      favorite_count: true,
    },
  })
  
  let updated = 0
  
  for (const manhwa of manhwas) {
    const displayScore = getDisplayScore(manhwa)
    const displayPop = getDisplayPopularity(manhwa)
    
    await prisma.manhwa.update({
      where: { id: manhwa.id },
      data: {
        // Stocker le score composite calculé pour les queries de tri
        display_score: displayScore.value,
        display_score_source: displayScore.source,
        display_score_phase: displayScore.phase,
        display_score_confidence: displayScore.confidence,
        // Stocker la popularité composite
        display_popularity: displayPop.value,
        display_popularity_source: displayPop.source,
      },
    })
    
    updated++
  }
  
  console.log(`[scoring] Recalculated ${updated} manhwas`)
  return updated
}

/**
 * Recalcule le trending_score basé sur l'activité des 7 derniers jours.
 */
export async function recalculateTrendingScores() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  // Compter l'activité récente par manhwa
  const recentActivity = await prisma.userLibrary.groupBy({
    by: ['manhwa_id'],
    where: {
      created_at: { gte: sevenDaysAgo },
    },
    _count: true,
  })
  
  const recentReviews = await prisma.review.groupBy({
    by: ['manhwa_id'],
    where: {
      created_at: { gte: sevenDaysAgo },
    },
    _count: true,
  })
  
  // Combiner les scores
  const activityMap = new Map<string, number>()
  
  for (const entry of recentActivity) {
    activityMap.set(
      entry.manhwa_id,
      (activityMap.get(entry.manhwa_id) || 0) + entry._count * 1 // 1 point par ajout en bibliothèque
    )
  }
  
  for (const entry of recentReviews) {
    activityMap.set(
      entry.manhwa_id,
      (activityMap.get(entry.manhwa_id) || 0) + entry._count * 3 // 3 points par review
    )
  }
  
  // Mettre à jour les trending scores
  for (const [manhwaId, score] of activityMap) {
    await prisma.manhwa.update({
      where: { id: manhwaId },
      data: { trending_score: score },
    })
  }
  
  // Reset les manhwas sans activité récente
  await prisma.manhwa.updateMany({
    where: {
      id: { notIn: Array.from(activityMap.keys()) },
      trending_score: { gt: 0 },
    },
    data: { trending_score: 0 },
  })
  
  console.log(`[trending] Updated ${activityMap.size} manhwas`)
}
```

### API Route pour le cron

```typescript
// /app/api/cron/recalculate-scores/route.ts

import { recalculateAllScores, recalculateTrendingScores } from '@/lib/scoring/recalculate'

export async function GET(request: Request) {
  // Vérifier le secret pour sécuriser le cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const scores = await recalculateAllScores()
  const trending = await recalculateTrendingScores()
  
  return Response.json({ 
    recalculated_scores: scores,
    recalculated_trending: trending,
    timestamp: new Date().toISOString(),
  })
}
```

### Vercel Cron config

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/recalculate-scores",
      "schedule": "0 * * * *"  // Toutes les heures
    }
  ]
}
```

---

## MIGRATION PRISMA — Nouveaux champs

```prisma
// Ajouter au model Manhwa :

model Manhwa {
  // ... champs existants ...
  
  // Scores composites calculés (mis à jour par le cron)
  display_score            Float?    // Score affiché (blend MV + AniList selon la phase)
  display_score_source     String?   // "AniList" | "ManhwaVerse + AniList" | "ManhwaVerse"
  display_score_phase      String?   // "BOOTSTRAP" | "GROWING" | "MATURE"
  display_score_confidence Float?    // 0.0 - 1.0
  
  // Popularité composite calculée
  display_popularity       Int       @default(0)
  display_popularity_source String?
  
  // Trending score (activité des 7 derniers jours)
  trending_score           Float     @default(0)
  
  @@index([display_score(sort: Desc)])
  @@index([display_popularity(sort: Desc)])
  @@index([trending_score(sort: Desc)])
}
```

---

## MISE À JOUR DES QUERIES HOMEPAGE

Toutes les sections de la homepage utilisent maintenant les champs `display_*` au lieu des champs bruts :

```typescript
// /lib/db/home.ts

// Tendances — basé sur l'activité récente MV
export async function getTrendingManhwas(limit = 6) {
  return prisma.manhwa.findMany({
    where: { is_published: true, trending_score: { gt: 0 } },
    orderBy: { trending_score: 'desc' },
    take: limit,
    select: MANHWA_CARD_SELECT,
  })
}

// Les plus populaires — utilise display_popularity (auto AniList ou MV)
export async function getMostPopular(limit = 6) {
  return prisma.manhwa.findMany({
    where: { is_published: true, display_popularity: { gt: 0 } },
    orderBy: { display_popularity: 'desc' },
    take: limit,
    select: MANHWA_CARD_SELECT,
  })
}

// Les mieux notés — utilise display_score (auto AniList ou MV)
export async function getTopRated(limit = 6) {
  return prisma.manhwa.findMany({
    where: { 
      is_published: true, 
      display_score: { not: null },
      display_score_confidence: { gte: 0.3 }, // Minimum de confiance
    },
    orderBy: { display_score: 'desc' },
    take: limit,
    select: MANHWA_CARD_SELECT,
  })
}

// Classement top 10 — utilise display_score
export async function getTopRankedManhwas(limit = 10) {
  return prisma.manhwa.findMany({
    where: { 
      is_published: true,
      display_score: { not: null },
    },
    orderBy: [
      { display_score: 'desc' },
      { display_popularity: 'desc' }, // tiebreaker
    ],
    take: limit,
    select: {
      ...MANHWA_CARD_SELECT,
      display_score: true,
      display_score_source: true,
      display_score_phase: true,
      display_popularity: true,
    },
  })
}
```

---

## AFFICHAGE DU SCORE DANS LES COMPOSANTS

### Score box sur la fiche manhwa

```tsx
// /components/features/manhwa/ScoreDisplay.tsx

interface Props {
  manhwa: {
    display_score: number | null
    display_score_source: string | null
    display_score_phase: string | null
    display_score_confidence: number | null
    score_avg: number | null
    score_count: number
    ext_score_anilist: number | null
    ext_popularity_anilist: number | null
  }
}

export function ScoreDisplay({ manhwa }: Props) {
  const t = useTranslations('manhwa')
  
  // Score principal (calculé par le scoring engine)
  const mainScore = manhwa.display_score
  const source = manhwa.display_score_source
  const phase = manhwa.display_score_phase
  
  if (!mainScore) return null
  
  return (
    <div className="flex items-center gap-3">
      {/* Score principal */}
      <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-white/5 border border-white/10">
        <span className="text-2xl font-bold text-blue-400">
          {mainScore.toFixed(1)}
        </span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
          {source}
        </span>
        
        {/* Indicateur de phase (subtil) */}
        {phase === 'GROWING' && (
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[9px] text-gray-600">
              {t('score.blended', { count: manhwa.score_count })}
            </span>
          </div>
        )}
      </div>
      
      {/* Score secondaire : montrer l'autre source si phase Growing */}
      {phase === 'GROWING' && manhwa.ext_score_anilist && manhwa.score_avg && (
        <div className="text-xs text-gray-500 space-y-0.5">
          <div>MV: {manhwa.score_avg.toFixed(1)} ({manhwa.score_count} votes)</div>
          <div>AniList: {manhwa.ext_score_anilist.toFixed(1)}</div>
        </div>
      )}
      
      {/* En phase Bootstrap : montrer juste le nombre de votes AniList */}
      {phase === 'BOOTSTRAP' && manhwa.ext_popularity_anilist && (
        <span className="text-[10px] text-gray-600">
          {formatNumber(manhwa.ext_popularity_anilist)} votes
        </span>
      )}
    </div>
  )
}
```

---

## SEED INITIAL — Peupler display_* pour tous les manhwas existants

Après la migration, exécuter le recalcul une première fois pour remplir les champs `display_*` :

```typescript
// /scripts/seed-display-scores.ts

import { recalculateAllScores, recalculateTrendingScores } from '@/lib/scoring/recalculate'

async function main() {
  console.log('Seeding display scores...')
  const count = await recalculateAllScores()
  console.log(`Updated ${count} manhwas`)
  
  console.log('Seeding trending scores...')
  await recalculateTrendingScores()
  
  console.log('Done!')
}

main()
```

```bash
npx tsx scripts/seed-display-scores.ts
```

---

## RECALCUL APRÈS CHAQUE VOTE/AJOUT (temps réel)

En plus du cron horaire, recalculer le score d'un manhwa **immédiatement** quand un utilisateur vote ou note :

```typescript
// /lib/scoring/realtime.ts

/**
 * Recalcule le score d'un seul manhwa.
 * À appeler après chaque vote/note/ajout en bibliothèque.
 */
export async function recalculateSingleManhwaScore(manhwaId: string) {
  const manhwa = await prisma.manhwa.findUnique({
    where: { id: manhwaId },
    select: {
      id: true,
      score_avg: true,
      score_count: true,
      score_stddev: true,
      ext_score_anilist: true,
      ext_score_mal: true,
      ext_score_composite: true,
      ext_popularity_anilist: true,
      reader_count: true,
      favorite_count: true,
    },
  })
  
  if (!manhwa) return
  
  const displayScore = getDisplayScore(manhwa)
  const displayPop = getDisplayPopularity(manhwa)
  
  await prisma.manhwa.update({
    where: { id: manhwaId },
    data: {
      display_score: displayScore.value,
      display_score_source: displayScore.source,
      display_score_phase: displayScore.phase,
      display_score_confidence: displayScore.confidence,
      display_popularity: displayPop.value,
      display_popularity_source: displayPop.source,
    },
  })
}
```

Appeler cette fonction dans TOUTES les server actions qui modifient les scores :

```typescript
// Dans /lib/actions/library.ts — après updateLibraryStatus()
await recalculateSingleManhwaScore(manhwaId)

// Dans /lib/actions/library.ts — après saveLibraryEntry() (si score changé)
await recalculateSingleManhwaScore(manhwaId)

// Dans /lib/actions/review.ts — après création/modification de review
await recalculateSingleManhwaScore(manhwaId)
```

---

## MONITORING — Dashboard admin (optionnel mais recommandé)

Créer une page admin `/admin/scoring` qui montre l'état global du système :

```
📊 Scoring Engine — État global

Phase      | Nb manhwas | % du catalogue
─────────────────────────────────────────
BOOTSTRAP  |   3,841    |    96.7%        ← Normal au lancement
GROWING    |      98    |     2.5%
MATURE     |      34    |     0.8%

Stats globales :
- Votes MV totaux : 14,523
- Moyenne de votes par manhwa : 3.7
- Manhwas avec ≥ 10 votes : 98
- Manhwas avec ≥ 50 votes : 34

Dernier recalcul : il y a 23 minutes
```

---

## TRADUCTIONS

```json
// fr.json
"score": {
  "blended": "Basé sur {count} votes ManhwaVerse + AniList",
  "bootstrap": "Score de référence",
  "bootstrapDesc": "Basé sur {min} votes minimum",
  "source": "Source : {source}"
}

// en.json
"score": {
  "blended": "Based on {count} ManhwaVerse votes + AniList",
  "bootstrap": "Reference score",
  "bootstrapDesc": "Based on {min} votes minimum",
  "source": "Source: {source}"
}
```

---

## ORDRE D'IMPLÉMENTATION

1. Migration Prisma (nouveaux champs `display_*`, `trending_score`)
2. Module `/lib/scoring/engine.ts` (le cerveau : getDisplayScore, getDisplayPopularity)
3. Module `/lib/scoring/recalculate.ts` (recalcul batch + trending)
4. Module `/lib/scoring/realtime.ts` (recalcul après chaque action)
5. Script seed initial (`npx tsx scripts/seed-display-scores.ts`)
6. API route cron (`/api/cron/recalculate-scores`)
7. Mettre à jour les queries homepage pour utiliser `display_*`
8. Mettre à jour le composant ScoreDisplay sur la fiche
9. Brancher `recalculateSingleManhwaScore` dans toutes les server actions

---

## CHECKLIST

- [ ] Module `/lib/scoring/engine.ts` créé avec les 3 phases
- [ ] `detectPhase()` retourne BOOTSTRAP / GROWING / MATURE selon `score_count`
- [ ] `getDisplayScore()` blend correctement MV + AniList selon la phase
- [ ] `getDisplayPopularity()` utilise AniList en bootstrap, MV en mature
- [ ] Champs `display_score`, `display_popularity`, `trending_score` en DB
- [ ] Index DB sur les 3 champs `display_*` pour les queries de tri
- [ ] Recalcul batch (cron horaire) fonctionne
- [ ] Recalcul temps réel après chaque vote/note/ajout fonctionne
- [ ] Sections homepage utilisent `display_*` au lieu des champs bruts
- [ ] Score affiché sur la fiche utilise `ScoreDisplay` avec source et phase
- [ ] Script seed initial exécuté (tous les manhwas ont un `display_score`)
- [ ] Aucun composant n'accède directement à `score_avg` ou `ext_score_anilist` pour l'affichage

```bash
git add .
git commit -m "feat: scoring engine — automatic phase transition bootstrap → growing → mature"
git push origin feat/scoring-system
```
