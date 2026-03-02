# 🚀 FEATURES INNOVANTES — Différenciation ManhwaVerse vs AniList
> Ce document couvre : features innovantes sur la fiche manhwa, features communautaires, système d'articles/blog SEO
> À implémenter par priorité, sur des branches séparées

---

## PARTIE A — Features innovantes sur la fiche manhwa

Ce sont des features qui n'existent PAS sur AniList et qui rendent ManhwaVerse unique.

---

### A1 — Vote personnage favori + Classement en temps réel

**Concept :** Sur chaque fiche, les utilisateurs votent pour leur personnage préféré. Un classement visuel se met à jour en temps réel.

**Sur la fiche (onglet Overview ou onglet Characters) :**

```
🏆 Personnage préféré — Solo Leveling
   Votez pour votre favori !

   1. ████████████████████████████  Jin-U Seong    52%  (1,247 votes)
   2. ████████████████               Hae-In Cha     28%  (672 votes)
   3. ████████                       Igris          12%  (288 votes)
   4. ████                           Beru            5%  (120 votes)
   5. ██                             Go Gun-Hee      3%  (72 votes)
   
   [Voir les 25 personnages →]
   
   Mon vote : Jin-U Seong ✓  [Changer]
```

**DB :**

```prisma
model CharacterVote {
  id            String    @id @default(cuid())
  user_id       String
  user          User      @relation(fields: [user_id], references: [id])
  manhwa_id     String
  manhwa        Manhwa    @relation(fields: [manhwa_id], references: [id])
  character_id  String
  character     Character @relation(fields: [character_id], references: [id])
  created_at    DateTime  @default(now())

  @@unique([user_id, manhwa_id])  // Un seul vote par user par manhwa
  @@index([manhwa_id, character_id])
}
```

**Visualisation :** Barres horizontales avec pourcentage + nombre de votes. Classement trié par nombre de votes. Le portrait du personnage à côté de chaque barre.

---

### A2 — Hype Meter / Baromètre d'engouement

**Concept :** Un indicateur visuel de la "hype" actuelle du manhwa, basé sur l'activité récente des 30 derniers jours.

```
🔥 HYPE METER
   ████████████████████████████░░░░  78%  EN FEU

   Basé sur : +342 ajouts en bibliothèque ce mois
              +89 reviews cette semaine
              +12% d'augmentation vs mois dernier
```

**Calcul :**
```typescript
function calculateHypeMeter(manhwaId: string): number {
  // Activité des 30 derniers jours vs les 30 jours précédents
  const recent = countRecentActivity(manhwaId, 30)  // ajouts, reviews, votes
  const previous = countRecentActivity(manhwaId, 60, 30)
  
  // Score 0-100 basé sur le volume + la tendance
  const volumeScore = Math.min(recent / 100, 1) * 50    // max 50 points pour le volume
  const trendScore = previous > 0 
    ? Math.min((recent / previous - 1) * 100, 50)         // max 50 points pour la croissance
    : 50
  
  return Math.round(volumeScore + trendScore)
}
```

Labels : 0-20 "Calme", 20-40 "En croissance", 40-60 "Populaire", 60-80 "En feu 🔥", 80-100 "HYPER PEAK 💥"

Afficher dans la sidebar de la fiche.

---

### A3 — Arc Ratings (déjà prévu dans le schéma, mais à implémenter)

**Concept :** Les utilisateurs notent chaque arc narratif individuellement. Permet de visualiser la "courbe de qualité" d'un manhwa.

```
📊 Notes par arc — Solo Leveling

   [Graphique linéaire]
   
   10 ─          ╱╲
    9 ─    ╱────╱  ╲───╲
    8 ─ ──╱                ╲──────
    7 ─╱                          ╲
    6 ─                             
       ├──────┼──────┼──────┼──────┤
       Job     Jeju   Double  Monarch
       Change  Island Dungeon  War
       Arc     Arc    Arc      Arc
       ★ 8.2   ★ 9.1  ★ 9.5   ★ 7.8
       (342)   (298)   (256)   (201)

   [Noter un arc →]
```

Le schéma `Arc` et `ArcScore` existent déjà. Il faut :
1. Un composant graphique (recharts LineChart) pour la courbe
2. Un modal pour noter chaque arc
3. Un admin panel pour définir les arcs d'un manhwa (chapitre début/fin, nom)

---

### A4 — Réactions coréennes (déjà spécifié dans le doc 06, mais pas implémenté)

**Concept :** Au lieu de simples likes, les utilisateurs réagissent avec des expressions coréennes.

```
Réactions — Solo Leveling

  헐     대박    감동    킹받    미쳤    죽겠
  Choqué  Dingue  Émouvant Rageux  Fou    OMG
  1,247   3,891   892     423     2,103  1,567

  [헐] [대박] [감동] [킹받] [미쳤] [죽겠]  ← cliquer pour réagir
```

Le schéma `KoreanReaction` existe déjà. Afficher les compteurs sous la synopsis ou dans la sidebar. L'utilisateur peut cocher plusieurs réactions.

**DB (existante) :**
```prisma
enum KoreanReaction {
  HEOL       // 헐 — Choqué
  DAEBAK     // 대박 — Dingue
  GAMDONG    // 감동 — Émouvant
  KINGBAT    // 킹받 — En rage
  MICHYEO    // 미쳤 — Fou/Insensé
  JUKGET     // 죽겠 — OMG/overwhelmed
}
```

---

### A5 — "Si tu as aimé X, tu vas adorer Y" — Recommandation intelligente

**Concept :** Au lieu de juste "Titres similaires", une section plus éditoriale :

```
📖 Si tu as aimé Solo Leveling...

  Tu vas adorer :
  ┌──────┐ The Beginning After The End
  │COVER │ "Même progression de puissance, mais avec un worldbuilding plus riche"
  │      │ ★ 8.7 · Action · Fantasy · Reincarnation
  └──────┘ Match : 94% avec tes goûts

  ┌──────┐ Omniscient Reader's Viewpoint
  │COVER │ "L'intelligence stratégique de Solo Leveling poussée à l'extrême"
  │      │ ★ 9.1 · Action · Fantasy · System
  └──────┘ Match : 91% avec tes goûts

  Mais évite peut-être :
  ┌──────┐ Second Life Ranker
  │COVER │ "Concept similaire mais exécution plus générique"
  │      │ ★ 6.8 · Action · Fantasy
  └──────┘ Souvent décevant pour les fans de Solo Leveling
```

La section "Mais évite peut-être" est optionnelle et ne s'affiche que si on a assez de données (reviews négatives de users qui ont aimé le titre principal). C'est très Letterboxd dans l'approche.

---

### A6 — Reading Pace Calculator

**Concept :** Estimer combien de temps il faudrait pour lire le manhwa entier.

```
⏱️ Temps de lecture estimé

  201 chapitres × ~3 min/chapitre = environ 10h de lecture
  
  À votre rythme (calibré sur vos habitudes) :
  📖 5 chapitres/jour → ~40 jours pour terminer
  📖 10 chapitres/jour → ~20 jours pour terminer
  📖 Binge reader → ~2-3 jours
```

Le champ `reading_pace` sur User existe déjà. Si l'user a une pace calibrée, utiliser la sienne. Sinon, utiliser une moyenne de 3 min/chapitre.

---

### A7 — Controversy Score / "Diviseur d'opinion"

**Concept :** Un badge qui indique si le manhwa divise les lecteurs ou fait consensus.

```
Le score_stddev (écart-type) existe déjà dans le schéma.

Si stddev < 1.0 → 🤝 "Consensus" (tout le monde est d'accord)
Si stddev 1.0-2.0 → ⚡ "Diviseur d'opinion" 
Si stddev > 2.0 → 💣 "Très controversé"
```

Afficher comme un badge dans la sidebar à côté du score.

---

## PARTIE B — Features communautaires

---

### B1 — Polls / Sondages communautaires

**Sur chaque fiche et sur la page communauté :**

```
📊 Sondage — Solo Leveling

  Quel est le meilleur arc ?
  
  ○ Job Change Arc         ████████████████  34%
  ○ Jeju Island Arc        ██████████████████████  48%
  ○ Double Dungeon Arc     ██████████  12%
  ○ Monarch War Arc        ████  6%
  
  847 votes · Créé par @admin · Se termine dans 3 jours
```

**DB :**

```prisma
model Poll {
  id            String    @id @default(cuid())
  manhwa_id     String?   // null = sondage global, sinon lié à un manhwa
  manhwa        Manhwa?   @relation(fields: [manhwa_id], references: [id])
  user_id       String
  user          User      @relation(fields: [user_id], references: [id])
  question      String
  options       PollOption[]
  total_votes   Int       @default(0)
  ends_at       DateTime?
  created_at    DateTime  @default(now())
  
  @@index([manhwa_id, created_at(sort: Desc)])
}

model PollOption {
  id          String    @id @default(cuid())
  poll_id     String
  poll        Poll      @relation(fields: [poll_id], references: [id])
  text        String
  vote_count  Int       @default(0)
  position    Int
  
  votes       PollVote[]
}

model PollVote {
  user_id     String
  option_id   String
  option      PollOption @relation(fields: [option_id], references: [id])
  created_at  DateTime  @default(now())

  @@id([user_id, option_id])
}
```

---

### B2 — Quiz communautaires

**Concept :** Des quiz sur les manhwa, créés par la communauté ou par les admins.

```
🧠 Quiz — Connais-tu vraiment Solo Leveling ?

  Question 3/10
  
  Quel est le rang de chasseur initial de Jin-U Seong ?
  
  ○ Rang E
  ○ Rang D
  ○ Rang C
  ○ Rang S
  
  [Question suivante →]
  
  Ton score actuel : 2/2 ✅
```

**Après le quiz :**
```
🏆 Résultat : 8/10 — Expert !

  Tu fais mieux que 73% des participants
  
  [Partager sur Twitter] [Refaire le quiz]
```

**DB :**

```prisma
model Quiz {
  id            String    @id @default(cuid())
  slug          String    @unique
  manhwa_id     String?
  manhwa        Manhwa?   @relation(fields: [manhwa_id], references: [id])
  title         String
  description   String?
  cover_url     String?
  difficulty    QuizDifficulty @default(MEDIUM)
  
  questions     QuizQuestion[]
  attempts      QuizAttempt[]
  
  total_attempts Int      @default(0)
  avg_score      Float?
  created_by    String
  created_at    DateTime  @default(now())
}

enum QuizDifficulty {
  EASY
  MEDIUM
  HARD
  EXPERT
}

model QuizQuestion {
  id          String    @id @default(cuid())
  quiz_id     String
  quiz        Quiz      @relation(fields: [quiz_id], references: [id])
  question    String
  options     String[]  // ["Rang E", "Rang D", "Rang C", "Rang S"]
  correct     Int       // index de la bonne réponse (0, 1, 2, 3)
  explanation String?   // explication après réponse
  position    Int
  
  has_spoiler Boolean   @default(false)
}

model QuizAttempt {
  id          String    @id @default(cuid())
  quiz_id     String
  quiz        Quiz      @relation(fields: [quiz_id], references: [id])
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  score       Int       // nombre de bonnes réponses
  total       Int       // nombre total de questions
  answers     Int[]     // [0, 2, 1, 3, ...] réponses de l'utilisateur
  completed_at DateTime @default(now())
  
  @@index([quiz_id, score(sort: Desc)])
}
```

**Pages :**
- `/quiz` → liste des quiz disponibles
- `/quiz/[slug]` → jouer le quiz
- `/manhwa/[slug]` → section "Quiz disponibles" sur la fiche (si des quiz existent pour ce titre)

---

### B3 — Contests / Tournois à élimination

**Concept :** Des tournois bracket-style "Quel est le meilleur manhwa Action ?" avec des matchups.

```
🏅 Tournoi — Meilleur Manhwa Action 2025

  QUARTS DE FINALE — Match 3/4
  
  ┌──────────────────┐     VS     ┌──────────────────┐
  │  Solo Leveling   │            │  Omniscient       │
  │  [Cover]         │    ⚔️     │  Reader           │
  │  ████████ 62%    │            │  █████ 38%        │
  │                  │            │  [Cover]          │
  └──────────────────┘            └──────────────────┘
  
  1,247 votes · Se termine dans 23h
  
  [Voter Solo Leveling]  [Voter Omniscient Reader]
```

**DB :**

```prisma
model Contest {
  id            String    @id @default(cuid())
  slug          String    @unique
  title         String
  description   String?
  status        ContestStatus @default(UPCOMING)
  
  rounds        ContestRound[]
  
  created_by    String
  created_at    DateTime  @default(now())
  starts_at     DateTime
  ends_at       DateTime?
}

enum ContestStatus {
  UPCOMING
  ACTIVE
  COMPLETED
}

model ContestRound {
  id          String    @id @default(cuid())
  contest_id  String
  contest     Contest   @relation(fields: [contest_id], references: [id])
  round_number Int      // 1 = finale, 2 = demi, 4 = quarts, etc.
  matchups    ContestMatchup[]
}

model ContestMatchup {
  id            String    @id @default(cuid())
  round_id      String
  round         ContestRound @relation(fields: [round_id], references: [id])
  manhwa_a_id   String
  manhwa_b_id   String
  votes_a       Int       @default(0)
  votes_b       Int       @default(0)
  winner_id     String?
  starts_at     DateTime
  ends_at       DateTime
  
  matchup_votes ContestVote[]
}

model ContestVote {
  user_id     String
  matchup_id  String
  matchup     ContestMatchup @relation(fields: [matchup_id], references: [id])
  voted_for   String    // manhwa_id du choix
  created_at  DateTime  @default(now())

  @@id([user_id, matchup_id])
}
```

---

### B4 — Chat / Discussions par titre (Reading Rooms améliorés)

Le schéma `ReadingRoom` + `RoomMessage` existe déjà. L'améliorer :

```
💬 Discussion — Solo Leveling

  GÉNÉRAL                          CHAPITRES
  ┌──────────────────────────┐    ┌──────────────────────┐
  │ @user1: Qui a lu le      │    │ Ch. 1-50 (sans spoil)│
  │ chapitre Ragnarok ?      │    │ Ch. 51-100           │
  │                          │    │ Ch. 101-150          │
  │ @user2: Oui c'est ouf   │    │ Ch. 151-201          │
  │ la fin 😭                │    │ Ragnarok (suite)     │
  │                          │    └──────────────────────┘
  │ @user3: No spoil pls     │
  │                          │
  │ [Écrire un message...]   │
  └──────────────────────────┘
```

**Channels par plage de chapitres** pour éviter les spoilers. Chat en temps réel (Supabase Realtime ou polling).

---

### B5 — Weekly Digest automatique

**Chaque semaine, ManhwaVerse envoie un digest personnalisé :**

```
📬 Ta semaine manhwa — 24-01 mars 2026

  📖 Nouveaux chapitres sortis pour tes manhwa en cours :
     Solo Leveling: Ragnarok — Ch. 42
     Tower of God — Ch. 612
  
  🔥 Trending cette semaine :
     #1 The Beginning After The End (↑3)
     #2 Omniscient Reader (→)
     #3 Return of the Mount Hua Sect (↑7)
  
  🏆 Tes stats :
     3 chapitres lus · 1 manhwa terminé · 2 reviews écrites
  
  💡 Recommandé pour toi :
     Si tu as aimé Solo Leveling, essaie "The Second Coming of Gluttony"
```

Le champ `notif_weekly_digest` sur User existe déjà.

---

## PARTIE C — Articles / Blog SEO

---

### C1 — Système d'articles

**Concept :** Des articles éditoriaux écrits par l'admin (toi) et plus tard par la communauté, pour attirer du trafic SEO.

**Types d'articles à fort potentiel SEO :**
- "Top 10 meilleurs manhwa comme Solo Leveling en 2026"
- "Guide complet du système de rangs dans Solo Leveling"
- "Manhwa vs Manga : les différences expliquées"
- "Les 20 manhwa les plus sous-cotés que tu dois absolument lire"
- "Chronologie complète de Tower of God expliquée"

**L'URL structure est déjà prévue dans la spec SEO :**
```
/blog/[article-slug]
/blog/category/[cat]
```

**DB :**

```prisma
model Article {
  id            String    @id @default(cuid())
  slug          String    @unique
  
  title_en      String
  title_fr      String?
  
  content_en    String    @db.Text    // Markdown
  content_fr    String?   @db.Text
  
  excerpt_en    String?   // 155 chars pour meta description
  excerpt_fr    String?
  
  cover_url     String?
  
  category      ArticleCategory
  tags          String[]
  
  // SEO
  meta_title    String?
  meta_description String?
  
  // Manhwas liés (pour le maillage interne)
  related_manhwa_ids String[]
  
  // Stats
  view_count    Int       @default(0)
  like_count    Int       @default(0)
  
  // Publication
  author_id     String
  author        User      @relation(fields: [author_id], references: [id])
  status        ArticleStatus @default(DRAFT)
  published_at  DateTime?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
}

enum ArticleCategory {
  TOP_LIST        // "Top 10 meilleurs..."
  GUIDE           // "Guide complet de..."
  EXPLAINER       // "Manhwa vs Manga..."
  NEWS            // "Nouveau manhwa annoncé..."
  EDITORIAL       // "Pourquoi X est sous-coté..."
  BEGINNER        // "Par où commencer..."
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### C2 — Maillage interne articles ↔ fiches

Chaque article mentionne des manhwa → lien automatique vers la fiche.
Chaque fiche manhwa a une section "Articles liés" en bas de la page Overview.

```
📝 Articles liés — Solo Leveling

  "Top 15 meilleurs manhwa d'action en 2026" — il y a 3 jours
  "Guide complet : dans quel ordre lire Solo Leveling" — il y a 2 semaines
  "Solo Leveling vs The Beginning After The End : le comparatif" — il y a 1 mois
```

C'est le maillage interne parfait pour le SEO.

### C3 — Génération d'articles par IA (pour le lancement)

Créer un script qui génère les premiers articles avec l'IA :
- "Top 10 meilleurs manhwa [genre]" pour chaque genre (19 genres = 19 articles)
- "Top 10 meilleurs manhwa [trope]" pour les tropes populaires
- "Guide du débutant : par où commencer en manhwa"
- "Manhwa vs Manga vs Manhua : les différences"

Ces articles sont relus et édités manuellement avant publication. Ce n'est PAS du spam IA — c'est un premier lot de contenu de qualité pour lancer la machine SEO.

---

## PRIORISATION RECOMMANDÉE

### Phase immédiate (avant lancement) :
1. **A4** — Réactions coréennes (simple, différenciant, le schéma existe)
2. **A1** — Vote personnage favori (engagement élevé)
3. **B1** — Polls (engagement communautaire)
4. **C1+C3** — Articles + génération initiale (SEO immédiat)

### Phase post-lancement (mois 1-2) :
5. **A2** — Hype Meter (nécessite des données d'activité)
6. **A3** — Arc Ratings (le schéma existe, UI à faire)
7. **B2** — Quiz (engagement + viralité)
8. **B5** — Weekly Digest (rétention)

### Phase croissance (mois 3+) :
9. **A5** — Recommandations intelligentes (nécessite des données de goûts)
10. **B3** — Contests/Tournois (communauté active nécessaire)
11. **B4** — Chat par titre (Supabase Realtime)
12. **A6** — Reading Pace Calculator
13. **A7** — Controversy Score

---

## NOTE SUR LE SEEDING (1000 comptes IA)

Ce sera un prompt séparé à créer APRÈS que toutes les features sont implémentées. Le script devra :
- Créer 1000 comptes avec usernames crédibles, avatars, bios variées
- Pour chaque compte : bibliothèque de 20-200 titres avec statuts réalistes
- Scores alignés sur les tendances AniList (±0.5 de variance)
- Reviews IA de qualité (200-500 mots, opinions diversifiées)
- Activité étalée sur plusieurs semaines (pas tout d'un coup)
- Follows croisés entre comptes (graphe social réaliste)
- Votes personnage, réactions coréennes, votes polls
- Les comptes doivent être flaggés en DB (`is_seed = true`) pour pouvoir les retirer plus tard
