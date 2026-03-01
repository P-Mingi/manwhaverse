# 📊 SYSTÈME DE SCORES AGRÉGÉS — ManhwaVerse
> Agrégation MAL + AniList + Kitsu · Score natif ManhwaVerse · Architecture complète

---

## 🎯 Vision

ManhwaVerse démarre sans communauté mais avec des **données de score réelles**
issues des trois plus grandes plateformes mondiales. Ces scores externes servent
de tremplin crédible jusqu'à ce que notre communauté soit assez grande pour
prendre le relais — proprement, avec une séparation visuelle claire.

**L'analogie parfaite : Rotten Tomatoes**
- Tomatometer (critique presse) = notre équivalent des scores externes
- Audience Score = notre score ManhwaVerse natif
- Les deux coexistent mais **le Tomatometer n'efface jamais l'Audience Score**

---

## 🏗️ Architecture du Système

### Les 3 états d'affichage selon la maturité du score

```
ÉTAT 1 — Démarrage (0 à 49 votes ManhwaVerse)
─────────────────────────────────────────────
Affichage : Score composite externe en position principale
            + badge "Score communauté : en construction"

[CRISTAL VIERGE]   Scores de référence
  ∅ / 10            MAL ·····  8.7 (142k membres)
  En construction   AniList ·· 88/100
                    Kitsu ····  8.5

CTA visible : "Sois parmi les premiers à noter ce manhwa →"


ÉTAT 2 — Croissance (50 à 499 votes ManhwaVerse)
────────────────────────────────────────────────
Affichage : Score ManhwaVerse en position principale (cristal animé)
            + scores externes en référence secondaire

[CRISTAL ANIMÉ]    Scores de référence
   8.4 / 10         MAL · 8.7  AniList · 88  Kitsu · 8.5
   墨 ENCRÉ
   52 votes MV      "Notre communauté est 100% manhwa"


ÉTAT 3 — Maturité (500+ votes ManhwaVerse)
──────────────────────────────────────────
Affichage : Score ManhwaVerse dominant
            + scores externes dans l'onglet Stats uniquement

[CRISTAL GRAND]    
   9.1 / 10         ← prend toute la place
   墨 ENCRÉ
   2 847 votes      Scores externes → voir onglet Stats
```

### Logique de transition (TypeScript)

```typescript
// /lib/scores/display.ts

export type ScoreDisplayMode = 'bootstrap' | 'growing' | 'mature'

export function getScoreDisplayMode(manhwa: Manhwa): ScoreDisplayMode {
  if (manhwa.score_count >= 500) return 'mature'
  if (manhwa.score_count >= 50)  return 'growing'
  return 'bootstrap'
}

export function getDisplayScore(manhwa: Manhwa): {
  primary: number | null
  primaryLabel: string
  primaryCount: number
  showExternal: boolean
  externalScores: ExternalScoreDisplay[]
} {
  const mode = getScoreDisplayMode(manhwa)

  if (mode === 'bootstrap') {
    return {
      primary: manhwa.ext_score_composite,
      primaryLabel: 'Score de référence',
      primaryCount: 0,
      showExternal: true,
      externalScores: buildExternalScores(manhwa),
    }
  }

  if (mode === 'growing') {
    return {
      primary: manhwa.score_avg,
      primaryLabel: 'Score ManhwaVerse',
      primaryCount: manhwa.score_count,
      showExternal: true,
      externalScores: buildExternalScores(manhwa),
    }
  }

  // mature
  return {
    primary: manhwa.score_avg,
    primaryLabel: 'Score ManhwaVerse',
    primaryCount: manhwa.score_count,
    showExternal: false, // dans l'onglet Stats seulement
    externalScores: buildExternalScores(manhwa),
  }
}

function buildExternalScores(manhwa: Manhwa): ExternalScoreDisplay[] {
  const scores: ExternalScoreDisplay[] = []

  if (manhwa.ext_score_mal) {
    scores.push({
      platform: 'MyAnimeList',
      score: manhwa.ext_score_mal,
      count: manhwa.ext_score_mal_count,
      url: `https://myanimelist.net/manga/${manhwa.mal_id}`,
      scale: '/10',
    })
  }
  if (manhwa.ext_score_anilist) {
    scores.push({
      platform: 'AniList',
      score: manhwa.ext_score_anilist,        // déjà normalisé /10
      scoreDisplay: manhwa.ext_score_anilist * 10, // affiché en /100
      count: manhwa.ext_score_anilist_count,
      url: `https://anilist.co/manga/${manhwa.anilist_id}`,
      scale: '/100',
    })
  }
  if (manhwa.ext_score_kitsu) {
    scores.push({
      platform: 'Kitsu',
      score: manhwa.ext_score_kitsu,
      count: manhwa.ext_score_kitsu_count,
      url: `https://kitsu.io/manga/${manhwa.kitsu_id}`,
      scale: '/100',
    })
  }

  return scores
}
```

---

## 🔄 Pipeline de Synchronisation

### Fréquence de sync

```
Bootstrap initial    → 1 fois au lancement (top 2000 manhwas)
Sync quotidienne     → Cron 2h du matin, tous les titres actifs
Sync hebdomadaire    → Titres peu populaires (< 1000 membres MAL)
Snapshot historique  → 1 entrée ExternalScoreSnapshot/jour/plateforme
```

### Script de sync AniList (scores)

```typescript
// /lib/ingestion/scores/anilist-scores.ts

const SCORE_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: MANGA) {
      id
      averageScore    // 0-100
      meanScore       // 0-100 (uniquement ceux qui ont noté)
      popularity      // nb de membres qui ont le manga en liste
      stats {
        scoreDistribution {
          score       // 10, 20, 30... 100
          amount      // nb de personnes
        }
      }
    }
  }
`

export async function syncAniListScore(manhwa: Manhwa) {
  if (!manhwa.anilist_id) return null

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: SCORE_QUERY,
      variables: { id: manhwa.anilist_id }
    })
  })

  const { data } = await response.json()
  const media = data.Media

  if (!media.averageScore) return null

  const scoreNormalized = media.averageScore / 10 // /100 → /10

  // Mettre à jour le champ dénormalisé sur Manhwa
  await prisma.manhwa.update({
    where: { id: manhwa.id },
    data: {
      ext_score_anilist: scoreNormalized,
      ext_score_anilist_count: media.popularity,
      ext_scores_updated_at: new Date(),
    }
  })

  // Snapshot historique
  await prisma.externalScoreSnapshot.create({
    data: {
      manhwa_id: manhwa.id,
      platform: 'ANILIST',
      score: scoreNormalized,
      score_raw: media.averageScore,
      vote_count: media.popularity,
    }
  })

  return scoreNormalized
}
```

### Script de sync MAL (via Jikan)

```typescript
// /lib/ingestion/scores/mal-scores.ts

export async function syncMALScore(manhwa: Manhwa) {
  if (!manhwa.mal_id) return null

  // Jikan rate limit : 3 req/sec, 60 req/min
  const response = await fetch(
    `https://api.jikan.moe/v4/manga/${manhwa.mal_id}`,
    { next: { revalidate: 86400 } } // cache 24h
  )

  const { data } = await response.json()

  if (!data.score) return null // pas encore noté

  await prisma.manhwa.update({
    where: { id: manhwa.id },
    data: {
      ext_score_mal: data.score,          // /10 natif
      ext_score_mal_count: data.members,  // nb de membres
      ext_scores_updated_at: new Date(),
    }
  })

  await prisma.externalScoreSnapshot.create({
    data: {
      manhwa_id: manhwa.id,
      platform: 'MAL',
      score: data.score,
      score_raw: data.score,
      vote_count: data.members,
    }
  })

  return data.score
}
```

### Calcul du score composite

```typescript
// /lib/scores/composite.ts
// Utilisé quand ManhwaVerse a < 50 votes natifs

export function computeCompositeScore(manhwa: Manhwa): number | null {
  const scores: Array<{ score: number; weight: number }> = []

  // MAL : plus de membres = plus de poids, mais plafonné
  if (manhwa.ext_score_mal && manhwa.ext_score_mal_count) {
    const weight = Math.min(manhwa.ext_score_mal_count / 10000, 3) // max weight 3
    scores.push({ score: manhwa.ext_score_mal, weight })
  }

  // AniList : communauté plus jeune, légèrement moins de poids
  if (manhwa.ext_score_anilist && manhwa.ext_score_anilist_count) {
    const weight = Math.min(manhwa.ext_score_anilist_count / 10000, 2.5)
    scores.push({ score: manhwa.ext_score_anilist, weight })
  }

  // Kitsu : plus petit, moins de poids
  if (manhwa.ext_score_kitsu && manhwa.ext_score_kitsu_count) {
    const weight = Math.min(manhwa.ext_score_kitsu_count / 10000, 1.5)
    scores.push({ score: manhwa.ext_score_kitsu, weight })
  }

  if (scores.length === 0) return null

  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0)
  const weightedSum = scores.reduce((sum, s) => sum + s.score * s.weight, 0)

  return Math.round((weightedSum / totalWeight) * 10) / 10 // arrondi à 1 décimale
}
```

### Cron de sync (Vercel)

```typescript
// /app/api/cron/sync-external-scores/route.ts
// Vercel Cron : 0 2 * * * (chaque nuit à 2h)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Prioriser les titres actifs et populaires
  const manhwas = await prisma.manhwa.findMany({
    where: {
      is_published: true,
      OR: [
        { ext_scores_updated_at: null },
        { ext_scores_updated_at: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      ]
    },
    orderBy: { reader_count: 'desc' },
    take: 500, // 500 titres par nuit max (respecte les rate limits)
  })

  let synced = 0
  let errors = 0

  for (const manhwa of manhwas) {
    try {
      await Promise.allSettled([
        syncAniListScore(manhwa),
        syncMALScore(manhwa),
        syncKitsuScore(manhwa),
      ])

      // Recalculer le composite
      const composite = computeCompositeScore(manhwa)
      if (composite) {
        await prisma.manhwa.update({
          where: { id: manhwa.id },
          data: { ext_score_composite: composite }
        })
      }

      synced++
      // Respecter les rate limits entre chaque titre
      await sleep(1200) // 1.2s entre chaque batch (Jikan : 60 req/min)
    } catch (e) {
      errors++
      console.error(`[score-sync] Error for ${manhwa.slug}:`, e)
    }
  }

  return Response.json({ synced, errors })
}
```

---

## 🎨 Rendu UI — Composant ScoreDisplay

```tsx
// /components/features/ScoreDisplay.tsx

interface ScoreDisplayProps {
  manhwa: ManhwaWithScores
  size: 'sm' | 'md' | 'lg'
}

export function ScoreDisplay({ manhwa, size }: ScoreDisplayProps) {
  const display = getDisplayScore(manhwa)
  const mode = getScoreDisplayMode(manhwa)

  return (
    <div className="score-display">

      {/* Score principal — cristal */}
      <Crystal
        score={display.primary}
        size={size}
        isEmpty={mode === 'bootstrap'}
      />

      {/* Label et chiffre */}
      {display.primary ? (
        <div className="score-main">
          <span className="score-value">{display.primary.toFixed(1)}</span>
          <span className="score-max">/10</span>
          {mode !== 'bootstrap' && (
            <span className="score-count">{display.primaryCount} votes</span>
          )}
          <ScoreLabel score={display.primary} count={display.primaryCount} />
        </div>
      ) : (
        <div className="score-bootstrap-cta">
          <span>Pas encore noté</span>
          <span className="cta">Sois le premier →</span>
        </div>
      )}

      {/* Scores externes — toujours affichés en mode bootstrap/growing */}
      {display.showExternal && display.externalScores.length > 0 && (
        <ExternalScores
          scores={display.externalScores}
          mode={mode}
        />
      )}

    </div>
  )
}

// Composant scores externes
function ExternalScores({ scores, mode }) {
  return (
    <div className={`external-scores ${mode === 'bootstrap' ? 'prominent' : 'subtle'}`}>
      {mode === 'bootstrap' && (
        <span className="external-label">Scores de référence</span>
      )}
      {scores.map(s => (
        <a
          key={s.platform}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="external-score-item"
        >
          <span className="platform-name">{s.platform}</span>
          <span className="platform-score">
            {s.scoreDisplay ?? s.score}
            <span className="platform-scale">{s.scale}</span>
          </span>
          {s.count && (
            <span className="platform-count">
              {formatCount(s.count)}
            </span>
          )}
        </a>
      ))}
    </div>
  )
}
```

### Rendu visuel par état

```
BOOTSTRAP (< 50 votes) :
┌─────────────────────────────────────────────────────┐
│  [CRISTAL VIERGE — shimmer]                         │
│  Pas encore noté sur ManhwaVerse                    │
│  Sois parmi les premiers →                          │
│                                                     │
│  Scores de référence :                              │
│  MyAnimeList ···· 8.7/10  ·  142k membres  →        │
│  AniList ········ 88/100  ·  98k membres   →        │
│  Kitsu ·········· 85/100  ·  12k membres   →        │
└─────────────────────────────────────────────────────┘

GROWING (50-499 votes) :
┌─────────────────────────────────────────────────────┐
│  [CRISTAL ANIMÉ 84%]                                │
│  8.4 / 10  ·  墨 ENCRÉ                              │
│  52 votes ManhwaVerse                               │
│                                                     │
│  Autres plateformes :                               │
│  MAL 8.7  ·  AniList 88  ·  Kitsu 85               │
└─────────────────────────────────────────────────────┘

MATURE (500+ votes) :
┌─────────────────────────────────────────────────────┐
│  [CRISTAL ANIMÉ 91%]                                │
│  9.1 / 10  ·  墨 ENCRÉ                              │
│  2 847 votes ManhwaVerse                            │
│                                                     │
│  → Voir scores MAL/AniList dans l'onglet Stats      │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Score Distribution Externe (dans l'onglet Stats)

AniList expose la distribution complète des scores (combien de personnes ont mis 10, 20, 30... 100).
On peut reproduire le graphique bulles d'AniList avec nos données combinées.

```typescript
// AniList scoreDistribution example :
// [{ score: 10, amount: 5 }, { score: 20, amount: 8 }, ... { score: 100, amount: 2341 }]

// On merge avec notre propre distribution :
// UserLibrary scores 1-10 → multiplié par 10 pour normaliser
// Résultat : graphique unifié MV + AniList

export function mergeScoreDistributions(
  mvScores: number[],          // scores /10 de notre communauté
  anilistDist: ScoreDist[],    // distribution AniList
): MergedDistribution {
  // Normalise MV en distribution 10-100
  // Fusionne avec AniList
  // Retourne les deux en parallèle pour comparaison visuelle
}
```

---

## 🔐 Mention légale (obligatoire sur les fiches)

```
Scores de référence fournis à titre informatif.
MyAnimeList, AniList et Kitsu sont des marques indépendantes
non affiliées à ManhwaVerse.
```

Affichée en micro-texte sous les scores externes. Simple, propre, suffisant.

---

## ❓ Questions ouvertes sur l'agrégation

1. **MangaUpdates** n'expose pas de scores — uniquement des métadonnées textuelles (fréquence de sortie, éditeur, groupes de traduction). Utile pour enrichir les fiches, inutile pour le système de score.

2. **Webtoon officiel** affiche des "likes" et non des notes. Pas comparable à un système /10. À ignorer pour l'agrégation de scores.

3. **Score de Lezhin / Tapas** — ces plateformes n'exposent pas d'API publique. Scores inaccessibles proprement.

4. **Quid si MAL coupe Jikan ?** → Les scores sont snapshotés en DB quotidiennement. Si l'API tombe, on affiche le dernier snapshot connu avec une mention "Score au JJ/MM/AAAA". Pas de dépendance critique.

5. **Manipulation de score** → Les scores MAL/AniList peuvent être manipulés par des fans (brigading). On ajoute un `ext_score_mal_suspicious` boolean si l'écart entre MAL et AniList est > 1.5 points → on affiche un avertissement discret.

---

## 🗓️ Roadmap Agrégation

```
Phase 0 (bootstrap) :
└── Script de sync initial — top 1000 manhwas depuis AniList + MAL + Kitsu
└── Calcul composite pour tous les titres
└── Affichage UI état BOOTSTRAP sur toutes les fiches

Phase 1 (lancement) :
└── Cron sync quotidien actif
└── Transition automatique BOOTSTRAP → GROWING → MATURE selon les votes
└── Score History graphique (données externes + ManhwaVerse)

Phase 2 :
└── Score Distribution fusionnée (MV + AniList)
└── Alerte "score suspect" si brigading détecté
└── API publique ManhwaVerse qui expose nos scores + les externes
```

---

*Document Score Agrégation · v1.0 · Mars 2026*
*Plateformes : MyAnimeList (Jikan) · AniList (GraphQL) · Kitsu (REST)*
*Légalité : affichage avec attribution — standard pratique du web*
