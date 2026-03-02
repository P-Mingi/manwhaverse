# 🍅 INSPIRATIONS RT + SYSTÈME DE RANGS + NSFW — ManhwaVerse
> Labels coréens · Rangs de système · Créatures mythologiques · Architecture /adults

---

## PARTIE 1 — SYSTÈME DE LABELS (remplacement de 墨 ENCRÉ)

### 1.1 — Décision validée : Rangs de Système + Créatures Coréennes

**Phase 1 :** Rangs textuels (CSS uniquement, zéro illustration)
**Phase 2 :** Illustrations custom de créatures coréennes par rang

Le système de rangs est la référence culturelle la plus universelle du manhwa.
Tout lecteur comprend instinctivement la hiérarchie. Pas besoin d'explication.

---

### 1.2 — Les 8 Rangs

```
RANG       SCORE       CRÉATURE (Phase 2)     COULEUR
────────────────────────────────────────────────────────
E-Rank     0 – 3.9     Slime 슬라임            #6B7280 gris
D-Rank     4.0 – 5.9   Dokkaebi 도깨비         #8B5CF6 violet
C-Rank     6.0 – 6.9   Haetae 해태             #3B82F6 bleu
B-Rank     7.0 – 7.9   Bulgasari 불가사리      #10B981 vert
A-Rank     8.0 – 8.9   Imugi 이무기            #F59E0B ambre
S-Rank     9.0 – 9.4   Gumiho 구미호           #C9A84C or
SS-Rank    9.5 – 9.9   Cheong-ryong 청룡       #E879F9 violet
SSS-Rank   10.0        Hwanin 환인             #FFFFFF blanc lumineux
```

**Pourquoi ces créatures :**
- **Slime (E)** — la créature la plus faible des RPG coréens. Référence directe.
- **Dokkaebi (D)** — démon espiègle coréen, connu via le drama Goblin.
- **Haetae (C)** — gardien légendaire de Séoul, fiable mais pas exceptionnel.
- **Bulgasari (B)** — monstre dévoureur de métal des légendes coréennes.
- **Imugi (A)** — serpent céleste qui n'a pas encore atteint le statut de dragon.
- **Gumiho (S)** — renard à 9 queues, mystérieux et redoutable. Connu mondialement.
- **Cheong-ryong (SS)** — Dragon Céleste Azur, l'une des 4 créatures divines coréennes.
- **Hwanin (SSS)** — Dieu du Ciel de la mythologie coréenne. Rang absolu.

---

### 1.3 — Implémentation Phase 1 (TypeScript + CSS)

```typescript
// /lib/scores/ranks.ts

export interface Rank {
  slug: string
  label: string
  labelKr: string
  creature: string
  creatureKr: string
  minScore: number
  maxScore: number
  color: string
  colorGlow: string
  description: string
}

export const RANKS: Rank[] = [
  {
    slug: 'sss-rank', label: 'SSS-Rank', labelKr: 'SSS급',
    creature: 'Hwanin', creatureKr: '환인',
    minScore: 10, maxScore: 10,
    color: '#FFFFFF', colorGlow: 'rgba(255,255,255,0.6)',
    description: 'Le Panthéon absolu. Un manhwa qui transcende le medium.',
  },
  {
    slug: 'ss-rank', label: 'SS-Rank', labelKr: 'SS급',
    creature: 'Cheong-ryong', creatureKr: '청룡',
    minScore: 9.5, maxScore: 9.99,
    color: '#E879F9', colorGlow: 'rgba(232,121,249,0.4)',
    description: 'Mythique. Appartient au Panthéon ManhwaVerse.',
  },
  {
    slug: 's-rank', label: 'S-Rank', labelKr: 'S급',
    creature: 'Gumiho', creatureKr: '구미호',
    minScore: 9.0, maxScore: 9.49,
    color: '#C9A84C', colorGlow: 'rgba(201,168,76,0.4)',
    description: 'Légendaire. Incontournable pour tout lecteur de manhwa.',
  },
  {
    slug: 'a-rank', label: 'A-Rank', labelKr: 'A급',
    creature: 'Imugi', creatureKr: '이무기',
    minScore: 8.0, maxScore: 8.99,
    color: '#F59E0B', colorGlow: 'rgba(245,158,11,0.3)',
    description: 'Excellent. Fortement recommandé.',
  },
  {
    slug: 'b-rank', label: 'B-Rank', labelKr: 'B급',
    creature: 'Bulgasari', creatureKr: '불가사리',
    minScore: 7.0, maxScore: 7.99,
    color: '#10B981', colorGlow: 'rgba(16,185,129,0.3)',
    description: 'Très bon. Vaut largement le détour.',
  },
  {
    slug: 'c-rank', label: 'C-Rank', labelKr: 'C급',
    creature: 'Haetae', creatureKr: '해태',
    minScore: 6.0, maxScore: 6.99,
    color: '#3B82F6', colorGlow: 'rgba(59,130,246,0.3)',
    description: 'Correct. Pour les fans du genre.',
  },
  {
    slug: 'd-rank', label: 'D-Rank', labelKr: 'D급',
    creature: 'Dokkaebi', creatureKr: '도깨비',
    minScore: 4.0, maxScore: 5.99,
    color: '#8B5CF6', colorGlow: 'rgba(139,92,246,0.2)',
    description: 'Passable. Attentes modérées conseillées.',
  },
  {
    slug: 'e-rank', label: 'E-Rank', labelKr: 'E급',
    creature: 'Slime', creatureKr: '슬라임',
    minScore: 0, maxScore: 3.99,
    color: '#6B7280', colorGlow: 'rgba(107,114,128,0.2)',
    description: 'À éviter sauf curiosité extrême.',
  },
]

export function getRankFromScore(score: number | null, voteCount: number): Rank | null {
  if (!score || voteCount < 10) return null
  return RANKS.find(r => score >= r.minScore && score <= r.maxScore) ?? null
}
```

```css
/* Phase 1 — badge coloré avec glow */
.rank-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid var(--rank-color);
  background: color-mix(in srgb, var(--rank-color) 12%, transparent);
  box-shadow: 0 0 8px var(--rank-glow);
  font-family: var(--font-mono);
}

/* Glow animé pour S-Rank et au-dessus */
.rank-badge[data-rank="s-rank"],
.rank-badge[data-rank="ss-rank"],
.rank-badge[data-rank="sss-rank"] {
  animation: rankGlow 2s ease-in-out infinite alternate;
}

@keyframes rankGlow {
  from { box-shadow: 0 0 8px var(--rank-glow); }
  to   { box-shadow: 0 0 20px var(--rank-glow), 0 0 40px var(--rank-glow); }
}

/* Phase 2 : illustration créature en filigrane */
.rank-badge__creature {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: drop-shadow(0 0 4px var(--rank-glow));
}
```

---

### 1.4 — Rendu Final sur une Fiche

```
[CRISTAL OR 91%]
  9.1 / 10
  ┌──────────────────────────────┐
  │  S-Rank  S급  [구미호 ✦]    │  ← glow doré animé
  └──────────────────────────────┘
  Phase 2 : illustration Gumiho en filigrane derrière le cristal
```

---

## PARTIE 2 — INSPIRATIONS ROTTEN TOMATOES (Phase 2)

### 2.1 — Community Consensus

```
💬 "La communauté salue un système de progression impeccable
    et un protagonist mémorable. L'ending divise."
Basé sur 2 847 reviews — mis à jour automatiquement
```

Généré par Claude API sur les 20 top reviews likées.
SEO : featured snippet pour "[titre] review consensus".

---

### 2.2 — Staff Picks + Creator Picks (innovation)

```
Types de listes curatoriales :

✦ ManhwaVerse Staff Pick     — équipe éditoriale
🎥 YouTuber Pick             — créateurs partenaires
⭐ Community Pick            — vote communautaire
🏆 Expert Pick               — critiques spécialisés

RÈGLE ABSOLUE : Ces listes n'affectent JAMAIS le score communautaire.
```

**Programme Creator Partnership :**
```
/creators — page partenaires

Les créateurs ont leur page /creator/[username] avec :
├── Badge "🎥 [Nom] recommande" sur les fiches
├── Leur bibliothèque publique et listes thématiques
├── Lien vers leur chaîne
└── Notification à leurs abonnés ManhwaVerse

Avantages ManhwaVerse : backlinks naturels + leur audience découvre le site
```

---

### 2.3 — Where to Read (affiliés, position haute)

```
Sur chaque fiche, AVANT les tabs :

┌─ 📖 LIRE CE MANHWA ──────────────────────────────────────────┐
│  🇫🇷 FR  [Delitoon]  [Webtoon FR]  [Izneo]  [Mangas.io]    │
│  🇬🇧 EN  [Webtoon]   [Tapas]       [Lezhin]                │
│  📦      [Amazon FR →]  ← lien affilié                       │
└──────────────────────────────────────────────────────────────┘
```

---

### 2.4 — Score Réactions — Vocabulaire Coréen

```
6 réactions au lieu du simple "like" :

🫠 헐  Heol     — Choqué / Incrédule
😤 대박 Daebak  — Incroyable (exclamation enthousiaste)
😭 감동 Gamdong — Émouvant (j'ai pleuré)
😤 킹받 Kingbat — En rage (frustration positive/négative)
🤯 미쳤 Michyeo — Fou/Insensé (compliment)
💀 죽겠 Jukget  — Je meurs (overwhelmed positif)

Sur chaque review : breakdown des réactions reçues
Sur chaque fiche : résumé communautaire
└── "대박 Daebak ████████ 67%  ·  감동 Gamdong ████ 38%"
```

---

## PARTIE 3 — ARCHITECTURE CONTENU ADULTE

### 3.1 — Décision finale : /adults sur le même domaine

```
manhwaverse.com/              → Site principal (G → R18)  AdSense ✅
manhwaverse.com/adults/       → Section X                 AdSense ❌
```

**Avantages vs sous-domaine :**
- ✅ SEO unifié — un seul domaine, autorité concentrée
- ✅ Un seul déploiement Vercel
- ✅ Même session/cookies/compte utilisateur
- ✅ Backlinks vers /adults/ renforcent le domaine principal

---

### 3.2 — Middleware Next.js

```typescript
// /middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/adults')) {
    const isVerified = request.cookies.get('age_verified')?.value === 'true'
    if (!isVerified) {
      return NextResponse.redirect(
        new URL(`/age-gate?redirect=${request.nextUrl.pathname}`, request.url)
      )
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/adults/:path*'] }
```

```tsx
// /app/adults/layout.tsx
export default function AdultsLayout({ children }) {
  return (
    <>
      <meta name="rating" content="adult" />
      {/* Désactive AdSense sur toute la section */}
      <NoAdsProvider>
        {children}
      </NoAdsProvider>
    </>
  )
}
```

**Google accepte cette architecture :**
1. Contenu séparé sur route dédiée ✅
2. Gate de protection ✅
3. `noindex` sur covers X ✅
4. Balise `rating: adult` ✅

---

### 3.3 — Monétisation /adults

```
Affiliation Lezhin Comics     → principale
Affiliation Toomics / Comica  → secondaire
Premium subscription          → actif sur tout le site
Réseaux pub adultes (Phase 3) → TrafficJunky / ExoClick (RPM 3-4x AdSense)
```

---

## RÉCAP PRIORISATION

### Phase 1 — Rangs + Réactions + /adults basics
- Système de rangs E→SSS (CSS + TypeScript)
- Badge `RankBadge` sur toutes les fiches et cards
- 6 réactions coréennes sur les reviews (헐/대박/감동/킹받/미쳤/죽겠)
- Where to Read en position haute avec affiliés
- Middleware `/adults` + gate d'âge
- `ContentRating` sur DB + `noindex` covers X
- `score_positive_rate` Float sur Manhwa (taux d'encrage)

### Phase 2 — Illustrations + Éditorial
- 8 illustrations custom créatures coréennes (commissionnées)
- Community Consensus (Claude API)
- Staff Picks + Creator Partnership program
- Breakdown réactions coréennes sur les fiches

---

*Document RT + Rangs + NSFW · v3.0 · Mars 2026*
*Labels : E→SSS + créatures mythologiques coréennes*
*Architecture adulte : /adults même domaine, middleware Next.js*
