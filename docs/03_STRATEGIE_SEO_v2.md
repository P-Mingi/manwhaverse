# 🔍 SEO ULTRA-COMPLET — ManhwaVerse
> SEO Google + LLM SEO (GEO) · Bilingue FR/EN · Architecture technique complète

---

## 🧠 Deux types de SEO à maîtriser

### SEO Google (classique)
Optimiser pour que Google indexe et classe les pages en tête des résultats.
**Leviers :** structure technique, contenu, backlinks, Core Web Vitals.

### GEO — Generative Engine Optimization (nouveau, crucial)
Optimiser pour que les LLMs (ChatGPT, Claude, Gemini, Perplexity) citent ManhwaVerse quand quelqu'un pose une question sur le manhwa.
**Leviers :** autorité topique, structured data, contenu factuel clair, citations.

**Pourquoi le GEO est urgent :** En 2025-2026, de plus en plus de gens demandent à leurs LLMs "quel manhwa lire après Solo Leveling ?" au lieu de googler. Si le LLM cite ManhwaVerse → trafic qualifié, brand awareness, autorité de domaine.

---

## 🏗️ PARTIE 1 — Architecture SEO Technique

### Structure d'URLs (canonique, immuable)

```
manhwaverse.com/                              → Home EN
manhwaverse.com/fr/                           → Home FR

manhwaverse.com/manhwa/[slug]                 → Fiche titre EN
manhwaverse.com/fr/manhwa/[slug]              → Fiche titre FR

manhwaverse.com/top                           → Classement général
manhwaverse.com/top/[genre-slug]              → Classement par genre
manhwaverse.com/top/[trope-slug]              → Classement par trope ★
manhwaverse.com/top/completed                 → Terminés seulement
manhwaverse.com/top/2024                      → Par année

manhwaverse.com/genre/[slug]                  → Page genre
manhwaverse.com/trope/[slug]                  → Page trope ★★
manhwaverse.com/recommendations/like-[slug]   → "Manhwa like X" ★★★

manhwaverse.com/list/[id]-[slug]              → Liste communautaire
manhwaverse.com/profile/[username]            → Profil public

manhwaverse.com/blog/[article-slug]           → Articles éditoriaux
manhwaverse.com/blog/category/[cat]           → Catégorie blog

★   = pages SEO à fort potentiel
★★  = pages SEO à très fort potentiel
★★★ = pages SEO à potentiel exceptionnel
```

### Hreflang (bilingue obligatoire)

```html
<!-- Dans le <head> de chaque page -->
<link rel="alternate" hreflang="en" href="https://manhwaverse.com/manhwa/solo-leveling" />
<link rel="alternate" hreflang="fr" href="https://manhwaverse.com/fr/manhwa/solo-leveling" />
<link rel="alternate" hreflang="x-default" href="https://manhwaverse.com/manhwa/solo-leveling" />
```

### Sitemap dynamique

```typescript
// /app/sitemap.ts — Généré dynamiquement

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const manhwas = await getAllManhwas(); // depuis Supabase
  const genres = await getAllGenres();
  const tropes = await getAllTropes();
  const lists = await getPublicLists();

  const staticPages = [
    { url: 'https://manhwaverse.com', priority: 1.0, changeFrequency: 'daily' },
    { url: 'https://manhwaverse.com/top', priority: 0.9, changeFrequency: 'daily' },
    { url: 'https://manhwaverse.com/top/completed', priority: 0.8 },
  ];

  const manhwaPages = manhwas.map(m => ({
    url: `https://manhwaverse.com/manhwa/${m.slug}`,
    lastModified: m.updated_at,
    priority: Math.min(0.9, 0.5 + (m.popularity / 10000)), // Popular = priorité haute
    changeFrequency: m.status === 'ongoing' ? 'weekly' : 'monthly',
    // Alternate FR
    alternates: {
      languages: {
        fr: `https://manhwaverse.com/fr/manhwa/${m.slug}`
      }
    }
  }));

  const tropePages = tropes.map(t => ({
    url: `https://manhwaverse.com/trope/${t.slug}`,
    priority: 0.8,
    changeFrequency: 'weekly',
  }));

  // Pages "manhwa like X" pour les 200 titres les plus populaires
  const likePages = manhwas
    .filter(m => m.reader_count > 100)
    .map(m => ({
      url: `https://manhwaverse.com/recommendations/like-${m.slug}`,
      priority: 0.85,
      changeFrequency: 'weekly',
    }));

  return [...staticPages, ...manhwaPages, ...tropePages, ...likePages];
}
```

### Robots.txt

```
User-agent: *
Allow: /

# Bloquer les pages admin et API
Disallow: /admin/
Disallow: /api/
Disallow: /profile/*/settings

# Autoriser les crawlers LLM explicitement (GEO)
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://manhwaverse.com/sitemap.xml
```

---

## 📄 PARTIE 2 — Metadata par Type de Page

### Fiche titre (la plus importante)

```typescript
// /app/manhwa/[slug]/page.tsx

export async function generateMetadata({ params }): Promise<Metadata> {
  const manhwa = await getManhwa(params.slug);

  return {
    title: `${manhwa.title_en} — Review, Score & Recommendations | ManhwaVerse`,
    // Ex: "Solo Leveling — Review, Score & Recommendations | ManhwaVerse"
    
    description: `${manhwa.title_en} scores ${manhwa.score}/10 on ManhwaVerse. 
                  ${manhwa.synopsis_en?.slice(0, 120)}... 
                  Read reviews from ${manhwa.review_count} readers.`,
    
    keywords: [
      manhwa.title_en,
      `${manhwa.title_en} review`,
      `${manhwa.title_en} score`,
      `is ${manhwa.title_en} worth reading`,
      'manhwa recommendations',
      ...manhwa.genres,
      ...manhwa.tropes,
    ],

    openGraph: {
      title: `${manhwa.title_en} — ${manhwa.score}/10 on ManhwaVerse`,
      description: manhwa.synopsis_en?.slice(0, 200),
      images: [{
        url: manhwa.og_image_url, // Image OG custom générée avec le cristal + score
        width: 1200,
        height: 630,
        alt: `${manhwa.title_en} cover and score on ManhwaVerse`,
      }],
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title: `${manhwa.title_en} — ${manhwa.score}/10`,
      description: manhwa.synopsis_en?.slice(0, 150),
      images: [manhwa.og_image_url],
    },

    alternates: {
      canonical: `https://manhwaverse.com/manhwa/${manhwa.slug}`,
      languages: {
        'en': `https://manhwaverse.com/manhwa/${manhwa.slug}`,
        'fr': `https://manhwaverse.com/fr/manhwa/${manhwa.slug}`,
      }
    }
  };
}
```

### Page "Manhwa Like X" (SEO gold)

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const sourceManhwa = await getManhwaBySlug(params.slug.replace('like-', ''));

  return {
    title: `Manhwa Similar to ${sourceManhwa.title_en} — Best Recommendations | ManhwaVerse`,
    description: `Looking for manhwa like ${sourceManhwa.title_en}? 
                  We found ${count} similar manhwa based on tropes, 
                  genre and community ratings. Updated ${date}.`,
    // ...
  };
}
```

### Page Trope

```typescript
// /app/trope/[slug]/page.tsx
// Ex: /trope/regression

title: `Best Regression Manhwa — ${count} titles ranked | ManhwaVerse`
description: `Discover the ${count} best regression manhwa, ranked by 
              ManhwaVerse community score. From classics to hidden gems, 
              find your next regression story.`
```

---

## 🏷️ PARTIE 3 — Structured Data (Schema.org)

### Sur les fiches titre

```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "Solo Leveling",
  "author": {
    "@type": "Person",
    "name": "Chugong"
  },
  "illustrator": {
    "@type": "Person",
    "name": "Dubu"
  },
  "bookFormat": "https://schema.org/GraphicNovel",
  "numberOfPages": 179,
  "inLanguage": "ko",
  "datePublished": "2018-03-04",
  "dateModified": "2021-12-29",
  "genre": ["Action", "Fantasy", "System"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "9.2",
    "bestRating": "10",
    "worstRating": "0",
    "ratingCount": "24847",
    "reviewCount": "3201"
  },
  "review": {
    "@type": "Review",
    "reviewBody": "[Review featured de la page]",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "9"
    },
    "author": {
      "@type": "Person",
      "name": "@username"
    }
  },
  "url": "https://manhwaverse.com/manhwa/solo-leveling",
  "image": "https://manhwaverse.com/covers/solo-leveling.webp",
  "sameAs": [
    "https://anilist.co/manga/101517",
    "https://myanimelist.net/manga/96792"
  ]
}
```

### Sur les pages de classement

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Best Regression Manhwa — ManhwaVerse Top Rankings",
  "description": "The definitive ranking of regression manhwa, scored by the ManhwaVerse community",
  "url": "https://manhwaverse.com/trope/regression",
  "numberOfItems": 47,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Book",
        "name": "Return of the Blossoming Blade",
        "url": "https://manhwaverse.com/manhwa/return-of-the-blossoming-blade",
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "9.1" }
      }
    }
    // ...
  ]
}
```

### FAQ Schema (sur les pages trope et genre)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best regression manhwa?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "According to ManhwaVerse community scores, the best regression manhwa is Return of the Blossoming Blade (9.1/10), followed by Second Life Ranker (8.8/10) and the Beginning After the End (8.7/10)."
      }
    },
    {
      "@type": "Question",
      "name": "What does regression mean in manhwa?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Regression in manhwa refers to a narrative trope where the protagonist travels back in time, usually after dying or reaching a point of regret, retaining memories of their future life to start over with foreknowledge."
      }
    }
  ]
}
```

### BreadcrumbList (sur toutes les pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://manhwaverse.com" },
    { "@type": "ListItem", "position": 2, "name": "Tropes", "item": "https://manhwaverse.com/trope" },
    { "@type": "ListItem", "position": 3, "name": "Regression", "item": "https://manhwaverse.com/trope/regression" }
  ]
}
```

---

## 🤖 PARTIE 4 — GEO (LLM SEO)

### Pourquoi les LLMs citent certaines sources

Les LLMs (ChatGPT, Claude, Gemini, Perplexity) citent des sources qui :
1. **Ont une autorité topique claire** — le site est reconnu comme "l'expert de X"
2. **Contiennent des données factuelles structurées** — scores, classements, nombres précis
3. **Sont citées par d'autres sources** — Reddit, forums, blogs spécialisés mentionnent le site
4. **Ont du contenu clair et sans ambiguïté** — les LLMs aiment les réponses directes

### Stratégie GEO pour ManhwaVerse

**Règle n°1 : Répondre directement aux questions exactes**

Les LLMs cherchent des pages qui répondent directement à une question.
```
Question : "What is the best regression manhwa?"
Mauvaise page : "Regression Manhwa — Our Collection"
Bonne page : "Best Regression Manhwa — Ranked by 24,000+ Readers"
             + Premier paragraphe : "The best regression manhwa according 
               to ManhwaVerse community is [titre] with a score of X/10."
```

**Règle n°2 : Données citables clairement**

Les LLMs veulent citer des chiffres précis et sourcés.
```html
<!-- Rendre les données facilement extractables -->
<p>
  <span itemscope itemtype="https://schema.org/Book">
    <span itemprop="name">Solo Leveling</span> 
    has a community score of 
    <span itemprop="ratingValue">9.2</span>/10 
    based on 
    <span itemprop="ratingCount">24,847</span> 
    votes on ManhwaVerse.
  </span>
</p>
```

**Règle n°3 : Un fichier llms.txt (standard émergent)**

```markdown
<!-- /llms.txt — fichier à la racine du site -->
# ManhwaVerse

ManhwaVerse is the definitive manhwa tracking and rating platform.
We aggregate community scores for Korean webcomics (manhwa) and 
Chinese webcomics (manhua).

## What we offer
- Community ratings for 4,800+ manhwa titles
- Tracking library (reading status, progress, reviews)
- Recommendations by trope (regression, system, murim...)
- Rankings by genre, score, and completion status

## Key data
- Community scores: /10 scale, minimum 10 votes to appear
- Trope system: 50+ tags voted by community
- Languages: English and French

## Most cited pages
- Best manhwa rankings: https://manhwaverse.com/top
- Regression manhwa: https://manhwaverse.com/trope/regression
- System manhwa: https://manhwaverse.com/trope/system
- Manhwa like Solo Leveling: https://manhwaverse.com/recommendations/like-solo-leveling

## Data freshness
Updated every 6 hours via automated pipelines.
```

**Règle n°4 : Construire l'autorité topique**

Publier du contenu qui prouve l'expertise sur le manhwa :
- Glossaire complet des termes manhwa (tropes, termes coréens, types de publication)
- "Manhwa 101" — guide complet pour débutants
- "History of Korean Webtoons" — article de fond
- Comparaisons et analyses : "Solo Leveling vs Omniscient Reader: A Data Analysis"

Ces contenus sont ceux que les LLMs apprennent à associer à ManhwaVerse = brand awareness dans les réponses IA.

**Règle n°5 : Être cité sur Reddit et les forums**

Les LLMs sont entraînés sur Reddit. Si ManhwaVerse est régulièrement cité dans r/manhwa comme référence, les LLMs associent le site au sujet.

Tactique : Répondre aux questions de recommandation sur Reddit avec des liens vers les pages pertinentes de ManhwaVerse (de façon naturelle et utile, pas spam).

---

## 📝 PARTIE 5 — Contenu Éditorial SEO

### Clusters de contenu (Topical Authority)

```
PILIER : Manhwa Rankings
├── /top — "Best Manhwa of All Time"
├── /top/action — "Best Action Manhwa"
├── /top/romance — "Best Romance Manhwa"
├── /top/completed — "Best Completed Manhwa"
├── /blog/best-manhwa-2024 — article mis à jour annuellement
└── /blog/best-manhwa-for-beginners — guide débutants

PILIER : Tropes & Recommandations
├── /trope/regression — page trope
├── /trope/system — page trope
├── /recommendations/like-solo-leveling
├── /blog/what-is-regression-manhwa — explication longue
└── /blog/best-regression-manhwa — liste éditoriale

PILIER : Guides & Éducation
├── /blog/manhwa-vs-manga — comparaison
├── /blog/manhwa-reading-guide — où lire légalement
├── /blog/manhwa-glossary — glossaire
└── /blog/history-of-manhwa — article historique
```

### Structure d'un article SEO-parfait

```markdown
# Best Regression Manhwa — 47 Titles Ranked by 24,000+ Readers
*Last updated: March 2026 · 47 titles · Community-ranked*

## What is a regression manhwa? (pour Google Featured Snippet)
A regression manhwa is a Korean webcomic featuring a protagonist who 
travels back in time, retaining memories from their future...

## Top 10 Regression Manhwa (pour les classements)
1. [Titre] — X/10 — [courte description]

## How we rank (transparence = confiance)
Scores are calculated from X community reviews...

## FAQ (Schema FAQPage)
Q: What is the best regression manhwa?
Q: What is the difference between regression and reincarnation?

[Lien vers la page /trope/regression pour le classement complet]
```

---

## ⚡ PARTIE 6 — Core Web Vitals

```
OBJECTIFS :
├── LCP (Largest Contentful Paint) < 2.5s
├── FID / INP (Interaction to Next Paint) < 200ms
├── CLS (Cumulative Layout Shift) < 0.1
└── TTFB (Time to First Byte) < 800ms

OPTIMISATIONS :
├── ISR sur les fiches populaires (revalidate: 3600)
├── Static generation des pages trope et genre
├── Next.js Image : WebP auto + lazy loading + blur placeholder
├── Fonts : next/font avec subset latin+korean (pas full unicode)
├── Critical CSS inline, reste deferred
├── Skeleton loaders pendant le fetch des données dynamiques
└── Cloudflare CDN pour tous les assets statiques
```

---

## 📊 KPIs SEO — Objectifs

| Métrique | Mois 3 | Mois 6 | Mois 12 | Mois 24 |
|---|---|---|---|---|
| Pages indexées | 500+ | 2 000+ | 8 000+ | 20 000+ |
| Visites organiques/mois | 5k | 50k | 500k | 3M+ |
| Mots-clés top 10 | 30 | 300 | 3 000 | 15 000 |
| Domain Authority | 10 | 20 | 35 | 50 |
| **Citations LLM** | 0 | 5/sem | 50/sem | 200/sem |
| Featured Snippets | 0 | 5 | 50 | 200 |

## 🏛️ PARTIE 7 — Pages SEO Spéciales

### Le Panthéon (`/pantheon`)
Page à traitement visuel unique ciblant les requêtes "best manhwa ever".

```
Critères d'entrée : score ≥ 9.0 + minimum 1000 votes
Titre SEO : "The Manhwa Pantheon — Greatest of All Time | ManhwaVerse"
Description : "Only X manhwa have earned a place in the ManhwaVerse Pantheon.
               Community score ≥ 9.0, verified by 1000+ readers."

Structured Data : ItemList avec les titres du Panthéon
Cible : "best manhwa ever", "greatest manhwa of all time",
        "meilleur manhwa de tous les temps"
```

### Controversy (`/top/controversial`)
```
Titre SEO : "Most Controversial Manhwa — Love It or Hate It | ManhwaVerse"
Cible : "controversial manhwa", "divisive manhwa", "manhwa that divides fans"
Données : classement par écart-type décroissant (score_stddev)
```

### Manhwa Pulse (`/pulse`)
```
Titre SEO : "Manhwa Pulse — What the Community Reads Right Now | ManhwaVerse"
Page indexable avec stats snapshotées : "avg 847 active readers daily"
Données structurées : rafraîchies toutes les 30 secondes en live
```

---

## 🌍 PARTIE 8 — Stratégie FR/EN Détaillée

### Principe fondateur

**FR = victoire rapide (0-12 mois).** Concurrence quasi inexistante.
Un article bien structuré → position 1 en semaines, pas en mois.

**EN = victoire long terme (12-36 mois).** Volume 5-10x supérieur,
concurrence proportionnelle. Objectif : top 5 sur les requêtes clés.

**Les deux en parallèle dès le J1** — mais le FR est le levier immédiat.

### Articles FR à créer avant le lancement (ordre de priorité)

| Article | Requête cible | Volume FR est. | Compétition |
|---|---|---|---|
| "Meilleur manhwa 2025 — Top 50" | meilleur manhwa | 3k/mois | Très faible |
| "Par où commencer le manhwa ?" | manhwa par où commencer | 800/mois | Nulle |
| "Manhwa de regression — Top 20" | manhwa regression | 600/mois | Nulle |
| "Solo Leveling en français" | solo leveling français | 2k/mois | Faible |
| "Manhwa vs manga" | manhwa vs manga | 1.5k/mois | Faible |
| "Manhwa VF disponibles" | manhwa vf | 1.2k/mois | Faible |

### Articles EN à créer avant le lancement

| Article | Requête cible | Volume EN est. | Compétition |
|---|---|---|---|
| "Best Manhwa 2025" | best manhwa | 90k/mois | Moyenne |
| "Manhwa Like Solo Leveling" | manhwa like solo leveling | 30k/mois | Faible |
| "Regression Manhwa Guide" | regression manhwa | 18k/mois | Faible |
| "Best Completed Manhwa" | best completed manhwa | 12k/mois | Faible |
| "What is Manhwa?" | what is manhwa | 8k/mois | Moyenne |

### Règle de production de contenu (ratio 1:4)

```
1 article rédigé = 4 formats de distribution :

├── 1 article blog long-form (SEO, 1500-2500 mots)
├── 1 post Reddit (r/manhwa EN ou r/mangaFR FR)
├── 1 thread Twitter/X (3-5 tweets)
└── 1 vidéo TikTok courte (30-60 sec, covers + voix off)

Même contenu, 4 canaux = 4x l'impact pour 1.5x le travail.
```

### Architecture des URLs bilingues

```
FR (priorité tactique)       EN (priorité stratégique)
/fr/blog/meilleur-manhwa     /blog/best-manhwa
/fr/trope/regression         /trope/regression
/fr/top                      /top
/fr/manhwa/solo-leveling     /manhwa/solo-leveling

hreflang sur chaque page pour indiquer la relation FR↔EN à Google.
```

---

*SEO Document · v3.0 · Mars 2026*
*SEO Google + GEO LLM + Panthéon + FR/EN Strategy*
