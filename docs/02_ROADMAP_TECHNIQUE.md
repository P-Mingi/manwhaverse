# 🛠️ ROADMAP TECHNIQUE — ManhwaVerse
> Dev solo + Claude Code · Next.js · Bilingue FR/EN · 2025

---

## 🏗️ Stack Technique Recommandée

### Pourquoi ce stack ?
Tu es dev solo avec Claude Code. On optimise pour : **vitesse de développement**, **SEO natif**, **scalabilité sans ops**, et **coût minimal**.

```
FRONTEND
├── Next.js 14+ (App Router) — SSR/SSG natif = SEO parfait
├── TypeScript — sécurité du code, meilleur DX avec Claude
├── Tailwind CSS — rapid UI, cohérence visuelle
└── Framer Motion — animations fluides pour l'UX premium

BACKEND / DATA
├── Supabase — PostgreSQL + Auth + Realtime + Storage (tout-en-un)
├── Prisma — ORM typesafe, migrations propres
└── tRPC — API typesafe entre Next.js et Supabase (optionnel mais puissant)

SEARCH
└── Meilisearch (self-hosted sur Railway) ou Algolia (plus cher mais zero-ops)
    → Pour la recherche par tropes/filtres avancés, crucial pour l'UX

IA / RECOMMANDATION
├── Claude API (Anthropic) — recherche sémantique "trouve-moi un manwha comme..."
└── pgvector (extension Supabase) — embeddings pour recommandations similaires

INFRA / DÉPLOIEMENT
├── Vercel — déploiement Next.js, edge functions, analytics
├── Supabase Cloud — DB managée, pas d'ops
└── Cloudflare — CDN pour les images (covers des manwhas = beaucoup d'assets)

MONITORING
├── Vercel Analytics — trafic et Core Web Vitals
├── Sentry — error tracking
└── PostHog — analytics produit (funnels, heatmaps) — gratuit jusqu'à 1M events

EMAILS
└── Resend — emails transactionnels modernes, API simple, gratuit jusqu'à 3k/mois

INTERNATIONALISATION (i18n)
└── next-intl — gestion FR/EN native dans l'App Router
```

---

## 📅 Roadmap par Phase

### 🔴 PHASE 0 — Foundation (Semaines 1-2)
*Objectif : L'environnement de dev est parfait, la DB est designée.*

**Setup :**
- [ ] Init Next.js 14 + TypeScript + Tailwind + ESLint strict
- [ ] Setup Supabase (projet, schéma DB, RLS policies)
- [ ] Setup Prisma + migrations initiales
- [ ] Setup Vercel (preview + production)
- [ ] Setup Cloudflare pour les images
- [ ] `.env` complet documenté

**Schéma DB v1 :**
```sql
-- Tables core
manhwa (id, slug, title_en, title_kr, title_fr, synopsis_en, synopsis_fr, 
        cover_url, status, chapter_count, author_id, illustrator_id, 
        score_avg, score_count, created_at, updated_at)

person (id, name, role, nationality, bio, image_url)

genre (id, name_en, name_fr, slug)
manhwa_genre (manhwa_id, genre_id)

trope (id, name, slug, description, category)
manhwa_trope (manhwa_id, trope_id, vote_count)

-- Users
user_profile (id, username, avatar_url, bio, locale, created_at)
user_library (user_id, manhwa_id, status, score, progress_chapter, 
              started_at, completed_at, updated_at)

-- Social
review (id, user_id, manhwa_id, content, score, is_spoiler, 
        likes_count, created_at)
review_like (user_id, review_id)

list (id, user_id, title, description, is_public, created_at)
list_item (list_id, manhwa_id, position, note)

-- Interaction
follow (follower_id, following_id)
activity (id, user_id, type, manhwa_id, metadata, created_at)
```

---

### 🟡 PHASE 1 — MVP Core (Semaines 3-6)
*Objectif : Un site fonctionnel avec les features essentielles.*

**Semaine 3 — Data & Fiches**
- [ ] Script d'import AniList API (top 1000 manwhas)
- [ ] Script d'enrichissement des données (tropes, traductions FR)
- [ ] Page fiche titre `/manhwa/[slug]`
- [ ] Système de covers optimisées (WebP, lazy loading)
- [ ] SEO meta tags dynamiques par fiche (title, description, OG)

**Semaine 4 — Auth & Bibliothèque**
- [ ] Auth Supabase (email + Google + Discord OAuth)
- [ ] Dashboard utilisateur `/profile/[username]`
- [ ] Système bibliothèque (ajouter/changer statut/noter)
- [ ] Stats profil basiques (nb titres, score moyen)

**Semaine 5 — Découverte**
- [ ] Home page avec sections dynamiques
- [ ] Recherche basique (titre, auteur)
- [ ] Filtres par genre
- [ ] Pages genre `/genre/[slug]`

**Semaine 6 — Reviews & Social basique**
- [ ] Écriture de reviews (avec mode spoiler)
- [ ] Likes sur reviews
- [ ] Activity feed sur le profil
- [ ] Système de follow basique

**Critères de sortie Phase 1 :**
- ✅ 500+ manwhas en base
- ✅ Inscription + ajout à la bibliothèque fonctionnel
- ✅ Reviews publiables
- ✅ Score Lighthouse SEO > 90

---

### 🟢 PHASE 2 — Growth Features (Semaines 7-12)
*Objectif : Les features qui créent la rétention et la viralité.*

**Semaine 7-8 — Recherche Avancée**
- [ ] Setup Meilisearch ou Algolia
- [ ] Filtres multi-tropes (la feature différenciante)
- [ ] Filtre par statut, chapitres, note minimale
- [ ] "Exclude already read" pour les connectés
- [ ] URL partageable pour chaque combinaison de filtres (SEO gold)

**Semaine 9 — Recommandations IA**
- [ ] Intégration Claude API pour recherche sémantique
- [ ] pgvector pour similarité entre titres
- [ ] Widget "Titres similaires" sur chaque fiche
- [ ] "Surprise me" button

**Semaine 10 — Listes Communautaires**
- [ ] Création/édition de listes publiques
- [ ] Page liste `/list/[id]`
- [ ] Vote et mise en avant des meilleures listes
- [ ] Embed de liste (partage externe)

**Semaine 11 — Gamification**
- [ ] Système de badges (achievements)
- [ ] "Taste Card" générée et partageable (image OG custom)
- [ ] Reading challenges
- [ ] Statistiques avancées de lecture

**Semaine 12 — Internationalisation**
- [ ] Setup next-intl complet
- [ ] Traduction UI FR/EN
- [ ] Détection automatique de la langue
- [ ] Contenu UGC avec badge de langue

---

### 🔵 PHASE 3 — Monétisation & Scale (Mois 4-6)
*Objectif : Le site génère ses premiers revenus.*

- [ ] Intégration Google AdSense (display ads)
- [ ] Liens affiliés automatiques (Amazon, Webtoon, Lezhin)
- [ ] Système Premium (Stripe) — features exclusives
- [ ] Newsletter (Resend) — digest hebdomadaire personnalisé
- [ ] API publique pour les développeurs (future source de revenus)
- [ ] Dashboard analytics avancé (PostHog)
- [ ] Optimisation Core Web Vitals pour SEO

---

## ⚡ Optimisations SEO Techniques Critiques

```
STRUCTURE D'URL
├── /manhwa/[slug]                    → fiche titre
├── /genre/[slug]                     → page genre
├── /trope/[slug]                     → page trope (SEO gold)
├── /list/[id]-[slug]                 → liste communautaire
├── /profile/[username]               → profil public
├── /recommendations/manhwa-like-[slug] → pages "similaires" (very SEO)
└── /top/[genre]/[year]               → classements (SEO evergreen)

PAGES SEO AUTOMATIQUES GÉNÉRÉES
├── 1 page par manwha (~500 au lancement, → 5000+)
├── 1 page par trope (~50 tropes = 50 pages très searchées)
├── 1 page par genre (~30 genres)
├── 1 page par comparaison "manhwa like X" (générée à la demande)
└── Pages classements annuels (SEO evergreen)

PERFORMANCES
├── Images : Next.js Image + WebP + Cloudflare CDN
├── Fonts : next/font (zero layout shift)
├── JS bundle : code splitting agressif
└── ISR (Incremental Static Regeneration) sur les fiches populaires
```

---

## 🤖 Workflow Claude Code Recommandé

En tant que dev solo avec Claude Code, voici comment structurer le travail :

**Par feature :**
1. Écrire le schéma DB d'abord (Prisma schema)
2. Générer les types TypeScript avec Claude
3. Écrire les composants UI avec instructions précises
4. Écrire les tests (au moins les cas critiques)
5. Review du code avant commit

**Conventions de code à définir dès le début :**
```
/app                    → Next.js App Router
/app/[locale]           → Routes i18n
/components/ui          → Composants atomiques (Button, Card, Badge...)
/components/features    → Composants métier (ManhwaCard, ReviewForm...)
/lib                    → Utilities, helpers
/lib/db                 → Prisma client + queries
/lib/api                → Fetchers externes (AniList, etc.)
/messages               → Traductions FR/EN (next-intl)
```

---

## 💸 Estimation Coûts Infrastructure

| Service | Plan | Coût/mois |
|---------|------|-----------|
| Vercel | Pro | 20$ |
| Supabase | Pro | 25$ |
| Cloudflare | Free | 0$ |
| Meilisearch (Railway) | Starter | 5$ |
| Resend | Free → Growing | 0-20$ |
| Sentry | Free | 0$ |
| PostHog | Free (1M events) | 0$ |
| **Total** | | **~50$/mois** |

> 50$/mois pour une infra qui tient jusqu'à ~200k utilisateurs actifs. Très raisonnable.

---

## ❓ Questions Techniques Ouvertes

1. **AniList API vs scraping manuel ?** L'API AniList est la meilleure source de départ (couvre 80% des titres populaires) mais ses données manwha sont moins riches. Plan : import AniList + enrichissement progressif.
2. **pgvector vs Pinecone pour les embeddings ?** pgvector dans Supabase = zero coût supplémentaire, recommandé.
3. **SSR vs ISR vs SSG pour les fiches ?** ISR avec revalidation de 1h pour les fiches (balance fraîcheur/performance).
4. **Modération du contenu UGC ?** Perspective libellés de sécurité avec Claude API sur les reviews au moment de la publication.
5. **Backup stratégie ?** Supabase Point-in-Time Recovery (inclus dans le plan Pro).

---

*Roadmap révisée à chaque fin de phase. Priorités ajustées selon les métriques de croissance.*
