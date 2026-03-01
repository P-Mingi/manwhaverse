# 🤖 AUTOMATISATION — ManhwaVerse
> Zéro intervention manuelle · Sources de données · Auto-post réseaux · Pipelines

---

## 🎯 Vision

ManhwaVerse doit fonctionner comme un **organisme vivant** — les nouvelles sorties apparaissent automatiquement, les réseaux sociaux postent sans intervention, la base de données s'enrichit de façon continue. Toi, tu te concentres sur le produit et la communauté.

---

## 📡 PARTIE 1 — Sources de Données

### Sources disponibles (hiérarchie qualité)

```
TIER 1 — APIs officielles (qualité maximale, légal, stable)
├── AniList GraphQL API                        [SOURCE PRIMAIRE]
│   URL : https://graphql.anilist.co
│   Filter : countryOfOrigin: KR (manhwa) + CN (manhua)
│   Rate limit : 90 req/min — très généreux
│   Auth : non requise pour les queries
│   ✅ Bootstrap initial + sync quotidien
│
├── Jikan API v4 (MyAnimeList non-officiel)    [SOURCE SECONDAIRE]
│   URL : https://api.jikan.moe/v4
│   Endpoint : /manga?type=manhwa
│   Données complémentaires : popularité MAL, titres alternatifs
│   Rate limit : 3 req/sec
│   ✅ Complément pour les titres absents d'AniList
│
├── MangaDex API                               [SOURCE NOUVEAUTÉS]
│   URL : https://api.mangadex.org
│   Filter : /manga?originalLanguage[]=ko&originalLanguage[]=zh
│   Particulièrement fort sur les nouveautés et titres indépendants
│   ✅ Détection des nouvelles sorties traduites
│
└── Kitsu API                                  [SOURCE DE SECOURS]
    URL : https://kitsu.io/api/edge/manga?filter[subtype]=manhwa
    Couvertures haute résolution disponibles
    ✅ Backup si AniList est down + covers alternatives

TIER 2 — RSS Feeds (temps réel, léger, fiable)
├── Webtoon RSS officiel
│   URL : https://www.webtoons.com/rss/top.rss
│   Contenu : nouveaux épisodes des titres populaires
│   Fréquence : temps réel
│   ✅ Meilleure source pour les sorties Webtoon officiel
│
├── Naver Webtoon (scraping léger)
│   URL : https://comic.naver.com/webtoon/weekday
│   Contenu : sorties coréennes originales (avant traduction)
│   Intérêt : anticiper les titres à venir en EN/FR
│
└── Kakao Webtoon
    URL : https://webtoon.kakao.com
    Contenu : catalogue Kakao (2ème plateforme KR après Naver)
    ✅ Titres exclusifs non disponibles sur Webtoon.com

TIER 3 — Scraping ciblé (avec robots.txt respecté)
└── MangaUpdates.com
    Données uniques : fréquence de mise à jour, groupes de trad,
    statut de license, éditeur physique par pays
    robots.txt : scraping toléré
    ✅ Enrichissement des métadonnées
```


---

## 🏗️ PARTIE 2 — Pipeline d'Ingestion de Données

### Architecture du pipeline

```
Sources externes
      │
      ▼
┌─────────────────┐
│   Cron Jobs     │  ← Vercel Cron ou GitHub Actions
│  (Schedulé)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch & Parse  │  ← Scripts TypeScript dans /lib/ingestion/
│                 │
│  ├── fetchAniList()
│  ├── fetchJikan()
│  ├── fetchMangaDex()
│  └── parseRSS()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Normalisation  │  ← Mapping vers le schéma ManhwaVerse
│                 │
│  ├── Déduplication (slug unique)
│  ├── Merge des données (AniList + Jikan)
│  ├── Validation des champs requis
│  └── Enrichissement (tropes auto-détectés par mots-clés)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase DB    │  ← Upsert (insert ou update si existe)
│                 │
│  Table manhwa : created_at, updated_at, source[]
│  Table release : manhwa_id, chapter, date, source
└─────────────────┘
```

### Script de bootstrap AniList (exemple)

```typescript
// /lib/ingestion/anilist.ts

const ANILIST_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage currentPage }
      media(
        type: MANGA
        countryOfOrigin: KR
        sort: POPULARITY_DESC
      ) {
        id
        title { romaji english native }
        description(asHtml: false)
        coverImage { extraLarge large color }
        bannerImage
        genres
        tags { name rank isMediaSpoiler }
        status
        chapters
        volumes
        startDate { year month day }
        endDate { year month day }
        averageScore
        popularity
        staff {
          edges {
            role
            node { name { full } }
          }
        }
      }
    }
  }
`;

export async function fetchAllManhwaFromAniList() {
  let page = 1;
  let hasNextPage = true;
  const results = [];

  while (hasNextPage) {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: ANILIST_QUERY,
        variables: { page, perPage: 50 }
      })
    });

    const data = await response.json();
    const pageData = data.data.Page;
    
    results.push(...pageData.media);
    hasNextPage = pageData.pageInfo.hasNextPage;
    page++;
    
    // Respecter le rate limit
    await new Promise(r => setTimeout(r, 700));
  }

  return results;
}

// Normaliser vers le schéma ManhwaVerse
export function normalizeAniListManhwa(item: AniListManhwa): ManhwaInsert {
  return {
    slug: generateSlug(item.title.english || item.title.romaji),
    title_en: item.title.english || item.title.romaji,
    title_kr: item.title.native,
    synopsis_en: item.description?.replace(/<[^>]*>/g, '') || null,
    cover_url: item.coverImage.extraLarge,
    banner_url: item.bannerImage,
    status: mapStatus(item.status), // 'FINISHED' → 'completed'
    chapter_count: item.chapters,
    anilist_id: item.id,
    anilist_score: item.averageScore,
    source: ['anilist'],
    updated_at: new Date().toISOString()
  };
}
```

### Cron Jobs (Vercel)

```typescript
// /app/api/cron/sync-releases/route.ts
// Vercel Cron : 0 */6 * * * (toutes les 6h)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 1. Fetch nouveaux chapitres depuis Webtoon RSS
  const webtoonReleases = await parseWebtoonRSS();
  
  // 2. Fetch depuis MangaDex (titres coréens récents)
  const mangadexReleases = await fetchMangaDexReleases();
  
  // 3. Merge et déduplication
  const newReleases = deduplicateReleases([...webtoonReleases, ...mangadexReleases]);
  
  // 4. Upsert en base
  await supabase.from('manhwa_release').upsert(newReleases, { onConflict: 'manhwa_id,chapter' });
  
  // 5. Trigger notifications (users qui suivent ces titres)
  await triggerReleaseNotifications(newReleases);
  
  // 6. Queue les posts réseaux sociaux
  await queueSocialPosts(newReleases);

  return Response.json({ synced: newReleases.length });
}
```

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-releases",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/sync-metadata",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/generate-trending",
      "schedule": "0 */1 * * *"
    },
    {
      "path": "/api/cron/send-weekly-digest",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

---

## 📲 PARTIE 3 — Auto-Post Réseaux Sociaux

### Plateformes et APIs

```
Twitter/X API v2
├── Endpoint : POST /2/tweets
├── Auth : OAuth 2.0 (Bearer token)
├── Gratuit jusqu'à 500 tweets/mois (niveau Free)
├── Niveau Basic (100$/mois) pour plus de volume
└── Parfait pour les posts automatiques de nouvelles sorties

Instagram Graph API
├── Requires : Facebook Business Account + Instagram Professional
├── Endpoint : POST /me/media puis POST /me/media_publish
├── Limitation : images seulement (pas de texte seul)
└── Idéal pour les covers de manhwa visuellement

TikTok for Developers API
├── Endpoint : POST /v2/post/publish/content/init/
├── Auth : OAuth 2.0
└── Pour des vidéos courtes générées automatiquement (plus complexe)

Alternatives no-code (plus rapide à implémenter) :
├── Buffer API — gère Twitter, Instagram, LinkedIn, TikTok
│   Prix : 15$/mois (Essentials), 3 canaux inclus
│   ✅ Recommandé pour commencer rapidement
│
└── Make.com (ex-Integromat)
    Workflow : Webhook ManhwaVerse → Make → Buffer/Directly
    Prix : gratuit jusqu'à 1000 opérations/mois
    ✅ Zéro code pour les posts sociaux basiques
```

### Templates de posts automatiques

```typescript
// /lib/social/templates.ts

// Template : Nouveau chapitre
export function newChapterPost(manhwa: Manhwa, chapter: number): SocialPost {
  return {
    twitter: `📖 New chapter alert!
    
${manhwa.title_en} — Chapter ${chapter} is out!

${manhwa.score >= 8 ? '墨 ENCRÉ' : '線 TRACÉ'} · ${manhwa.score}/10

Read it now → ${manhwa.readLinks[0].url}
#manhwa #webtoon #${slugToHashtag(manhwa.slug)}`,
    
    image: manhwa.cover_url, // Cloudflare Images OG crop
  };
}

// Template : Hidden Gem hebdomadaire
export function hiddenGemPost(manhwa: Manhwa): SocialPost {
  return {
    twitter: `💎 Hidden Gem Friday

"${manhwa.title_en}" — only ${manhwa.reader_count} readers but rated ${manhwa.score}/10

Why is nobody talking about this?

📖 manhwaverse.com/manhwa/${manhwa.slug}
#manhwa #hiddengem`,
  };
}

// Template : Trending de la semaine
export function weeklyTrendingPost(topManhwas: Manhwa[]): SocialPost {
  const list = topManhwas.slice(0, 5)
    .map((m, i) => `${i + 1}. ${m.title_en} — ${m.score}/10`)
    .join('\n');

  return {
    twitter: `📊 This week's top manhwa on ManhwaVerse:

${list}

Full ranking → manhwaverse.com/top
#manhwa #webtoon`,
  };
}
```

### Workflow complet auto-post

```
Nouveau chapitre détecté (Cron Job toutes les 6h)
          │
          ▼
Est-ce un titre avec score ≥ 7.5 ET > 100 lecteurs sur le site ?
          │
     OUI  │  NON → Pas de post (éviter le spam)
          ▼
Générer le template du tweet + image cover
          │
          ▼
Ajouter à la queue (table social_post_queue en DB)
          │
          ▼
Cron Job toutes les 2h → vider la queue, max 3 posts/jour/plateforme
          │
          ▼
POST vers Buffer API ou directement Twitter API
          │
          ▼
Logger le résultat (succès/erreur) + lien vers le tweet publié
```

---

## 🔔 PARTIE 4 — Notifications Utilisateurs

### Notifications en temps réel

```typescript
// Supabase Realtime + Edge Functions

// Types de notifications
type NotificationType = 
  | 'new_chapter'        // nouveau chapitre d'un titre suivi
  | 'review_liked'       // quelqu'un a liké ta review
  | 'new_follower'       // quelqu'un te suit
  | 'friend_activity'    // un ami a terminé/noté un titre
  | 'weekly_digest'      // résumé hebdomadaire (email)
  | 'reading_reminder';  // rappel pour un objectif de lecture

// Edge Function : trigger notification
// /supabase/functions/trigger-notification/index.ts
export async function triggerNotification(
  userId: string,
  type: NotificationType,
  data: Record<string, unknown>
) {
  // 1. Créer la notif en DB
  await supabase.from('notification').insert({
    user_id: userId,
    type,
    data,
    read: false
  });

  // 2. Push via Supabase Realtime (pour l'UI en temps réel)
  await supabase.channel(`user:${userId}`)
    .send({ type: 'broadcast', event: 'notification', payload: data });

  // 3. Email si l'user a activé les notifs email (Resend)
  const prefs = await getUserNotifPrefs(userId);
  if (prefs.email_new_chapter && type === 'new_chapter') {
    await sendEmail({ to: user.email, template: 'new_chapter', data });
  }
}
```

### Email digest hebdomadaire (Resend)

```typescript
// Envoyé chaque lundi matin — personnalisé par utilisateur

interface WeeklyDigestData {
  user: User;
  newChaptersForFollowed: Release[];    // chapitres des titres suivis
  trendingThisWeek: Manhwa[];           // top 5 trending
  friendsActivity: Activity[];           // ce que tes amis ont lu
  personalRecommendation: Manhwa;        // 1 reco basée sur l'historique
  readingStats: { chaptersThisWeek: number; streak: number; };
}

// Template email → Resend React Email
// Personnalisé, pas de template générique
```

---

## 🗄️ PARTIE 5 — Enrichissement Continu de la DB

### Pipeline d'enrichissement

```
Titres en DB avec données incomplètes
          │
          ▼
Script d'enrichissement (priorité : titres populaires d'abord)
├── Synopsis FR manquant → DeepL API (traduction auto, 500k chars/mois gratuit)
├── Tropes non tagués → Détection par mots-clés dans le synopsis
│   ("regression", "second chance" → tag #regression)
│   ("system", "status window" → tag #system)
├── Couverture manquante → Fetch depuis AniList / MangaDex
└── Chapitres mis à jour → Sync toutes les 24h

COÛT DE L'ENRICHISSEMENT :
├── DeepL API Free : 500 000 chars/mois
│   Équivalent : ~500 synopsis traduits/mois → suffisant pour le début
├── Cloudflare Images : transformation + stockage
└── Vercel Cron : inclus dans le plan Pro
```

### Détection automatique de tropes

```typescript
// /lib/enrichment/trope-detection.ts
// Règles basées sur mots-clés — simple, efficace, sans IA

const TROPE_RULES: Record<string, string[]> = {
  'regression': ['regress', 'go back in time', 'return to the past', 'time regression', 'went back'],
  'system': ['system', 'status window', 'level up', 'skill tree', 'quest log', '[system]'],
  'overpowered-mc': ['overwhelmingly strong', 'most powerful', 'strongest', 'op protagonist'],
  'reincarnation': ['reincarnated', 'reborn', 'previous life', 'past life', 'transmigrated'],
  'villain-mc': ['villain', 'antagonist', 'evil protagonist', 'bad guy'],
  'female-lead': ['female protagonist', 'heroine', 'she woke up', 'she was reborn'],
  'murim': ['murim', 'martial arts', 'cultivation', 'wuxia', 'qi', 'sect'],
  'dungeon': ['dungeon', 'gate', 'monster wave', 'hunter', 'awakened'],
  'isekai': ['another world', 'transported', 'summoned to', 'fantasy world'],
};

export function detectTropes(synopsis: string): string[] {
  const lower = synopsis.toLowerCase();
  const detected: string[] = [];
  
  for (const [trope, keywords] of Object.entries(TROPE_RULES)) {
    if (keywords.some(kw => lower.includes(kw))) {
      detected.push(trope);
    }
  }
  
  return detected;
}
```

---

## 📊 PARTIE 6 — Monitoring du Pipeline

### Tableau de bord admin (interne)

```
Page /admin/pipeline (accessible uniquement toi)

┌─── STATUT DES CRONS ─────────────────────────────────────────────┐
│  sync-releases      ✅ Dernière exec: il y a 2h · 14 nouveautés  │
│  sync-metadata      ✅ Dernière exec: il y a 6h · 0 erreurs      │
│  generate-trending  ✅ Dernière exec: il y a 47min               │
│  send-weekly-digest ✅ Dernière exec: Lundi 09:00 · 1247 emails  │
└──────────────────────────────────────────────────────────────────┘

┌─── STATS DB ─────────────────────────────────────────────────────┐
│  Total manhwas en DB : 4 827                                     │
│  Avec synopsis FR : 2 341 (48%)                                  │
│  Avec tropes tagués : 3 102 (64%)                                │
│  Avec cover HD : 4 801 (99%)                                     │
└──────────────────────────────────────────────────────────────────┘

┌─── SOCIAL POSTING ───────────────────────────────────────────────┐
│  Queue en attente : 3 posts                                      │
│  Posts publiés aujourd'hui : 2                                   │
│  Dernier post Twitter : il y a 4h (142 impressions)              │
└──────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quickstart — Ordre d'implémentation

```
SEMAINE 1 :
└── Script bootstrap AniList → DB (top 1000 manhwas)

SEMAINE 2 :
└── Cron sync-releases (Webtoon RSS + MangaDex)

SEMAINE 3 :
└── Notifications utilisateurs (new_chapter pour les titres suivis)

MOIS 2 :
└── Email digest hebdomadaire (Resend)

MOIS 2 :
└── Auto-post Twitter via Buffer API

MOIS 3 :
└── Instagram auto-post (covers des nouveautés)

MOIS 4 :
└── Enrichissement continu (DeepL synopsis FR, tropes auto)
```

---

*Document Automatisation · v1.0 · Mars 2026*
*Stack : Vercel Cron · Supabase Edge Functions · Resend · Buffer API · AniList/Jikan/MangaDex*
