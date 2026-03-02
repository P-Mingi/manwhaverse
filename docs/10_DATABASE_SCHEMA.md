# 🗄️ SCHÉMA BASE DE DONNÉES — ManhwaVerse
> Prisma Schema · PostgreSQL · Supabase · Toutes features intégrées

---

## 🧠 Principes de Design DB

1. **Slug partout** — chaque entité publique a un slug URL-safe immuable
2. **Soft delete** — on ne supprime jamais (deleted_at nullable)
3. **Audit trail** — created_at + updated_at sur toutes les tables
4. **Source tracking** — savoir d'où vient chaque donnée (AniList, Jikan, manuel)
5. **i18n natif** — champs _en et _fr sur tout contenu textuel important
6. **Counters dénormalisés** — score_count, review_count, etc. pour éviter les COUNT() à chaque requête

---

## 📋 Schéma Prisma Complet

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ═══════════════════════════════════════════════════
// CONTENU PRINCIPAL
// ═══════════════════════════════════════════════════

model Manhwa {
  id              String    @id @default(cuid())
  slug            String    @unique // "solo-leveling"
  
  // Titres
  title_en        String
  title_kr        String?
  title_fr        String?
  title_alt       String[]  // titres alternatifs connus
  
  // Contenu
  synopsis_en     String?   @db.Text
  synopsis_fr     String?   @db.Text
  
  // Médias
  cover_url       String?
  cover_cf_id     String?   // Cloudflare Images ID
  banner_url      String?
  
  // Metadata
  type            ContentType @default(MANHWA)
  status          PublicationStatus @default(ONGOING)
  chapter_count   Int?
  volume_count    Int?
  release_year    Int?
  end_year        Int?
  origin_country  String    @default("KR") // KR = manhwa, CN = manhua
  demographic     String?   // seinen, shounen, josei...
  
  // Contenu & modération
  content_rating    ContentRating  @default(PG13)
  has_nudity        Boolean        @default(false)
  has_gore          Boolean        @default(false)
  has_strong_language Boolean      @default(false)
  cover_is_nsfw     Boolean        @default(false)
  
  // Scores (dénormalisés pour performance)
  score_avg            Float?    // score ManhwaVerse /10
  score_stddev         Float?    // écart-type → Controversy Score
  score_positive_rate  Float?    // % de votes ≥ 7/10 → "Taux d'Encrage"
  score_count          Int       @default(0)
  review_count         Int       @default(0)
  list_count           Int       @default(0)
  reader_count         Int       @default(0)
  favorite_count       Int       @default(0)
  waitlist_count       Int       @default(0)

  // Scores externes agrégés (dénormalisés pour affichage rapide)
  ext_score_mal       Float?    // MyAnimeList /10
  ext_score_mal_count Int?      // nb de membres MAL
  ext_score_anilist   Float?    // AniList /100 → converti en /10
  ext_score_anilist_count Int?
  ext_score_kitsu     Float?    // Kitsu /100 → converti en /10
  ext_score_kitsu_count Int?
  ext_scores_updated_at DateTime? // dernière sync des scores externes

  // Score composite (affiché quand ManhwaVerse a < 50 votes)
  // Calculé : moyenne pondérée des scores externes disponibles
  ext_score_composite Float?   // /10, recalculé par cron

  
  // Trending
  trending_score  Float     @default(0)   // calculé par cron
  trending_fr     Float     @default(0)   // trending France spécifique
  trending_en     Float     @default(0)   // trending EN spécifique
  
  // Sources externes (pour sync)
  anilist_id      Int?      @unique
  mal_id          Int?      @unique
  mangadex_id     String?   @unique
  kitsu_id        String?   @unique
  
  // Contrôle
  is_published    Boolean   @default(true)
  is_verified     Boolean   @default(false) // vérifié manuellement
  data_source     String[]  // ["anilist", "manual"]
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  deleted_at      DateTime?

  // Relations
  creator_links   ManhwaCreator[]
  genre_links     ManhwaGenre[]
  trope_links     ManhwaTrope[]
  library_entries UserLibrary[]
  reviews         Review[]
  list_items      ListItem[]
  quotes          Quote[]
  arcs            Arc[]
  releases        Release[]
  read_links      ReadLink[]
  waitlists       Waitlist[]
  similar_to      SimilarManhwa[] @relation("source")
  similar_from    SimilarManhwa[] @relation("target")
  score_history   ScoreHistory[]

  @@index([slug])
  @@index([type, status])
  @@index([score_avg(sort: Desc)])
  @@index([trending_score(sort: Desc)])
  @@index([release_year])
}

enum ContentType {
  MANHWA
  MANHUA
}

enum ContentRating {
  G        // Tout public
  PG       // Quelques thèmes matures
  PG13     // Violence, thèmes sombres — défaut
  M        // Mature — ecchi, violence forte
  R18      // Adulte — contenu sexuel non-explicite
  X        // Explicite — fiche uniquement, redirection externe
}

enum ContentFilter {
  SAFE     // défaut — G, PG, PG13
  MATURE   // + M — après confirmation 18+
  ALL      // + R18 — après vérification date de naissance
}

enum PublicationStatus {
  ONGOING
  COMPLETED
  HIATUS
  CANCELLED
}

// ── Arcs narratifs (Arc Ratings feature)
model Arc {
  id            String    @id @default(cuid())
  manhwa_id     String
  manhwa        Manhwa    @relation(fields: [manhwa_id], references: [id])
  
  name_en       String    // "Jeju Island Arc"
  name_fr       String?
  chapter_start Int
  chapter_end   Int?
  position      Int       // ordre dans l'histoire
  
  // Score de l'arc
  score_avg     Float?
  score_count   Int       @default(0)
  
  arc_scores    ArcScore[]
  
  created_at    DateTime  @default(now())

  @@index([manhwa_id, position])
}

model ArcScore {
  id          String    @id @default(cuid())
  arc_id      String
  arc         Arc       @relation(fields: [arc_id], references: [id])
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  score       Float     // /10
  created_at  DateTime  @default(now())

  @@unique([arc_id, user_id])
}

// ── Liens de lecture légaux
model ReadLink {
  id          String    @id @default(cuid())
  manhwa_id   String
  manhwa      Manhwa    @relation(fields: [manhwa_id], references: [id])
  platform    String    // "webtoon", "tapas", "lezhin", "delitoon"
  url         String
  is_free     Boolean   @default(false)
  is_official Boolean   @default(true)
  language    String    // "en", "fr", "kr"
  is_affiliate Boolean  @default(false)
  affiliate_url String?
}

// ── Titres similaires (collaborative filtering)
model SimilarManhwa {
  id            String    @id @default(cuid())
  source_id     String
  source        Manhwa    @relation("source", fields: [source_id], references: [id])
  target_id     String
  target        Manhwa    @relation("target", fields: [target_id], references: [id])
  similarity    Float     // 0-1, calculé par algorithme
  reasons       String[]  // ["same_trope:regression", "similar_score", "genre:action"]
  computed_at   DateTime  @default(now())

  @@unique([source_id, target_id])
  @@index([source_id, similarity(sort: Desc)])
}

// ── Relations entre manhwas (adaptation, prequel, sequel...)
model ManhwaRelation {
  id            String    @id @default(cuid())
  source_id     String
  source        Manhwa    @relation("rel_source", fields: [source_id], references: [id])
  target_id     String
  target        Manhwa    @relation("rel_target", fields: [target_id], references: [id])
  relation_type RelationType

  @@unique([source_id, target_id, relation_type])
}

enum RelationType {
  ADAPTATION     // manhwa → anime
  SOURCE         // anime → manhwa original
  SEQUEL
  PREQUEL
  SIDE_STORY
  ALTERNATIVE
  LIGHT_NOVEL
}

// ── Évolution du score dans le temps (ManhwaVerse)
model ScoreHistory {
  id          String    @id @default(cuid())
  manhwa_id   String
  manhwa      Manhwa    @relation(fields: [manhwa_id], references: [id])
  score       Float
  reader_count Int
  recorded_at DateTime  @default(now())

  @@index([manhwa_id, recorded_at])
}

// ── Historique des scores externes (snapshot quotidien)
model ExternalScoreSnapshot {
  id            String    @id @default(cuid())
  manhwa_id     String
  manhwa        Manhwa    @relation(fields: [manhwa_id], references: [id])
  platform      ExternalPlatform
  score         Float     // toujours stocké en /10 (normalisé)
  score_raw     Float     // score original de la plateforme (/10 MAL, /100 AniList...)
  vote_count    Int?
  recorded_at   DateTime  @default(now())

  @@index([manhwa_id, platform, recorded_at(sort: Desc)])
  @@unique([manhwa_id, platform, recorded_at])
}

enum ExternalPlatform {
  MAL        // MyAnimeList via Jikan — /10 natif
  ANILIST    // AniList GraphQL — /100 → diviser par 10
  KITSU      // Kitsu API — /100 → diviser par 10
}

// ── Releases / Sorties (nouvelles via API/RSS)
model Release {
  id            String    @id @default(cuid())
  manhwa_id     String
  manhwa        Manhwa    @relation(fields: [manhwa_id], references: [id])
  chapter       Int
  chapter_title String?
  platform      String    // "webtoon", "mangadex"...
  url           String?
  released_at   DateTime
  created_at    DateTime  @default(now())
  
  // Pour les notifications
  notifications_sent Boolean @default(false)

  @@unique([manhwa_id, chapter, platform])
  @@index([released_at(sort: Desc)])
}

// ════════════════════════════════════════════════════
// CRÉATEURS
// ════════════════════════════════════════════════════

model Creator {
  id            String    @id @default(cuid())
  slug          String    @unique
  name          String
  name_native   String?   // nom en coréen/chinois
  bio_en        String?   @db.Text
  bio_fr        String?   @db.Text
  avatar_url    String?
  nationality   String?   // "KR", "CN"
  birth_year    Int?
  
  // Stats dénormalisées
  avg_score     Float?    // score moyen de ses œuvres
  total_readers Int       @default(0)
  follower_count Int      @default(0)
  
  // Sources
  anilist_id    Int?
  
  works         ManhwaCreator[]
  followers     CreatorFollow[]
  
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
}

model ManhwaCreator {
  manhwa_id   String
  manhwa      Manhwa    @relation(fields: [manhwa_id], references: [id])
  creator_id  String
  creator     Creator   @relation(fields: [creator_id], references: [id])
  role        CreatorRole // AUTHOR, ILLUSTRATOR, BOTH

  @@id([manhwa_id, creator_id, role])
}

enum CreatorRole {
  AUTHOR
  ILLUSTRATOR
  BOTH
}

model CreatorFollow {
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  creator_id  String
  creator     Creator   @relation(fields: [creator_id], references: [id])
  created_at  DateTime  @default(now())

  @@id([user_id, creator_id])
}

// ════════════════════════════════════════════════════
// GENRES & TROPES
// ════════════════════════════════════════════════════

model Genre {
  id          String    @id @default(cuid())
  slug        String    @unique  // "action", "dark-fantasy"
  name_en     String
  name_fr     String
  description_en String? @db.Text
  description_fr String? @db.Text
  color       String?   // couleur hex pour le tag UI
  manhwa_count Int      @default(0)
  
  manhwa_links ManhwaGenre[]
}

model ManhwaGenre {
  manhwa_id   String
  manhwa      Manhwa    @relation(fields: [manhwa_id], references: [id])
  genre_id    String
  genre       Genre     @relation(fields: [genre_id], references: [id])

  @@id([manhwa_id, genre_id])
}

model Trope {
  id            String    @id @default(cuid())
  slug          String    @unique  // "regression", "system", "op-mc"
  name          String
  description_en String?  @db.Text
  description_fr String?  @db.Text
  category      TropeCategory
  manhwa_count  Int       @default(0)
  
  manhwa_links  ManhwaTrope[]
}

enum TropeCategory {
  PROTAGONIST_TYPE   // overpowered, villain, female lead
  NARRATIVE          // regression, reincarnation, system
  SETTING            // dungeon, murim, modern fantasy
  THEME              // revenge, redemption, found family
  AMBIANCE           // dark, light, romance
}

model ManhwaTrope {
  manhwa_id     String
  manhwa        Manhwa    @relation(fields: [manhwa_id], references: [id])
  trope_id      String
  trope         Trope     @relation(fields: [trope_id], references: [id])
  upvotes       Int       @default(0)
  downvotes     Int       @default(0)
  added_by      String?   // user_id qui a ajouté le tag
  is_verified   Boolean   @default(false) // validé par modération

  @@id([manhwa_id, trope_id])
  @@index([manhwa_id, upvotes(sort: Desc)])
}

// ════════════════════════════════════════════════════
// UTILISATEURS
// ════════════════════════════════════════════════════

model User {
  id              String    @id // = Supabase Auth UID
  username        String    @unique
  display_name    String?
  avatar_url      String?
  bio             String?   @db.VarChar(300)
  locale          String    @default("en") // "fr" ou "en"
  
  // Paramètres de lecture
  reading_pace    Float?    // minutes par chapitre (calibré)
  
  // Paramètres notifs
  notif_new_chapter   Boolean @default(true)
  notif_review_liked  Boolean @default(true)
  notif_new_follower  Boolean @default(true)
  notif_weekly_digest Boolean @default(true)
  notif_email         Boolean @default(true)
  
  // Gamification
  reader_class    String?   // "The Completionist", etc.
  influence_score Float     @default(0)
  reading_streak  Int       @default(0)
  longest_streak  Int       @default(0)
  last_read_at    DateTime?
  
  // Stats dénormalisées
  total_chapters_read Int   @default(0)
  total_manhwas_completed Int @default(0)
  
  // Premium
  is_premium      Boolean   @default(false)
  premium_until   DateTime?
  
  // Contrôle
  is_banned       Boolean   @default(false)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  
  // Relations
  library         UserLibrary[]
  reviews         Review[]
  review_likes    ReviewLike[]
  lists           ManhwaList[]
  list_votes      ListVote[]
  follows         Follow[]      @relation("follower")
  followers       Follow[]      @relation("following")
  creator_follows CreatorFollow[]
  quotes          Quote[]
  quote_votes     QuoteVote[]
  arc_scores      ArcScore[]
  trope_votes     TropeVote[]
  notifications   Notification[]
  activities      Activity[]
  waitlists       Waitlist[]
  reading_rooms   RoomMember[]
  journal_entries JournalEntry[]
  achievements    UserAchievement[]
}

// ── Bibliothèque utilisateur
model UserLibrary {
  id              String    @id @default(cuid())
  user_id         String
  user            User      @relation(fields: [user_id], references: [id])
  manhwa_id       String
  manhwa          Manhwa    @relation(fields: [manhwa_id], references: [id])
  
  status          ReadingStatus
  progress        Int       @default(0) // chapitre actuel
  
  // Notes
  score           Float?    // note publique /10
  score_private   Float?    // note privée (jamais affichée)
  is_favorite     Boolean   @default(false) // coup de cœur ♥
  
  // Dates
  started_at      DateTime?
  completed_at    DateTime?
  
  // Tags privés
  private_tags    String[]  // ["#guilty-pleasure", "#à-recommander"]
  
  // Relecture
  reread_count    Int       @default(0)
  reread_score    Float?    // note de relecture si différente
  
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  @@unique([user_id, manhwa_id])
  @@index([user_id, status])
  @@index([user_id, updated_at(sort: Desc)])
}

enum ReadingStatus {
  READING       // 📖 En cours
  COMPLETED     // ✅ Terminé
  ON_HOLD       // ⏸ En pause
  DROPPED       // ❌ Abandonné
  PLAN_TO_READ  // 📋 À lire
  REREADING     // 🔄 En relecture
}

// ── Journal de lecture (privé)
model JournalEntry {
  id          String    @id @default(cuid())
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  manhwa_id   String
  chapter     Int?      // chapitre associé (optionnel)
  content     String    @db.Text
  created_at  DateTime  @default(now())

  @@index([user_id, manhwa_id])
}

// ── Waitlist "Préviens-moi quand terminé"
model Waitlist {
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  manhwa_id   String
  manhwa      Manhwa    @relation(fields: [manhwa_id], references: [id])
  created_at  DateTime  @default(now())
  notified_at DateTime? // date où la notif a été envoyée

  @@id([user_id, manhwa_id])
}

// ════════════════════════════════════════════════════
// REVIEWS & QUOTES
// ════════════════════════════════════════════════════

model Review {
  id            String    @id @default(cuid())
  user_id       String
  user          User      @relation(fields: [user_id], references: [id])
  manhwa_id     String
  manhwa        Manhwa    @relation(fields: [manhwa_id], references: [id])
  
  content       String    @db.Text
  score         Float?    // /10 (peut être différent du score bibliothèque)
  is_micro      Boolean   @default(false) // micro-review ≤ 280 chars
  has_spoilers  Boolean   @default(false)
  
  // Notes par dimension (optionnelles)
  score_story     Float?
  score_art       Float?
  score_characters Float?
  score_world     Float?
  
  // Type de lecteur cible
  audience_tag  String?   // "for-newcomers", "post-arc3", "technical"
  
  // Engagement
  likes_count   Int       @default(0)
  
  // Import externe
  imported_from String?   // "anilist", "mal"
  import_url    String?
  
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  deleted_at    DateTime?
  
  likes         ReviewLike[]

  @@index([manhwa_id, likes_count(sort: Desc)])
  @@index([manhwa_id, created_at(sort: Desc)])
  @@index([user_id])
}

model ReviewLike {
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  review_id   String
  review      Review    @relation(fields: [review_id], references: [id])
  created_at  DateTime  @default(now())

  @@id([user_id, review_id])
}

// ── Réactions coréennes sur les reviews (헐/대박/감동/킹받/미쳤/죽겠)
model ReviewReaction {
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  review_id   String
  review      Review    @relation(fields: [review_id], references: [id])
  reaction    KoreanReaction
  created_at  DateTime  @default(now())

  @@id([user_id, review_id, reaction])
}

enum KoreanReaction {
  HEOL       // 헐 — Choqué / Incrédule
  DAEBAK     // 대박 — Incroyable
  GAMDONG    // 감동 — Émouvant
  KINGBAT    // 킹받 — En rage
  MICHYEO    // 미쳤 — Fou/Insensé
  JUKGET     // 죽겠 — Je meurs (overwhelmed)
}

// ── Chapter Quotes
model Quote {
  id          String    @id @default(cuid())
  manhwa_id   String
  manhwa      Manhwa    @relation(fields: [manhwa_id], references: [id])
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  
  content     String    @db.VarChar(500)
  chapter     Int?
  character   String?   // personnage qui dit la réplique
  
  votes       Int       @default(0)
  
  created_at  DateTime  @default(now())
  deleted_at  DateTime?
  
  quote_votes QuoteVote[]

  @@index([manhwa_id, votes(sort: Desc)])
}

model QuoteVote {
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  quote_id    String
  quote       Quote     @relation(fields: [quote_id], references: [id])
  value       Int       // +1 ou -1
  created_at  DateTime  @default(now())

  @@id([user_id, quote_id])
}

model TropeVote {
  user_id       String
  user          User        @relation(fields: [user_id], references: [id])
  manhwa_id     String
  trope_id      String
  value         Int         // +1 ou -1
  created_at    DateTime    @default(now())

  @@id([user_id, manhwa_id, trope_id])
}

// ════════════════════════════════════════════════════
// LISTES COMMUNAUTAIRES
// ════════════════════════════════════════════════════

model ManhwaList {
  id            String    @id @default(cuid())
  slug          String    @unique
  user_id       String
  user          User      @relation(fields: [user_id], references: [id])
  
  title         String
  description   String?   @db.Text
  is_public     Boolean   @default(true)
  is_collab     Boolean   @default(false) // liste collaborative
  
  // SEO
  og_title      String?   // titre SEO si différent du titre affiché
  
  likes_count   Int       @default(0)
  item_count    Int       @default(0)
  
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  items         ListItem[]
  votes         ListVote[]
}

model ListItem {
  id          String      @id @default(cuid())
  list_id     String
  list        ManhwaList  @relation(fields: [list_id], references: [id])
  manhwa_id   String
  manhwa      Manhwa      @relation(fields: [manhwa_id], references: [id])
  position    Int
  note        String?     @db.VarChar(500) // "Dans cette liste car..."
  
  added_at    DateTime    @default(now())

  @@unique([list_id, manhwa_id])
  @@index([list_id, position])
}

model ListVote {
  user_id     String
  user        User        @relation(fields: [user_id], references: [id])
  list_id     String
  list        ManhwaList  @relation(fields: [list_id], references: [id])
  created_at  DateTime    @default(now())

  @@id([user_id, list_id])
}

// ════════════════════════════════════════════════════
// SOCIAL
// ════════════════════════════════════════════════════

model Follow {
  follower_id   String
  follower      User      @relation("follower", fields: [follower_id], references: [id])
  following_id  String
  following     User      @relation("following", fields: [following_id], references: [id])
  created_at    DateTime  @default(now())

  @@id([follower_id, following_id])
  @@index([following_id])
}

// ── Activity Feed
model Activity {
  id          String    @id @default(cuid())
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  type        ActivityType
  manhwa_id   String?
  metadata    Json?     // données spécifiques au type
  created_at  DateTime  @default(now())

  @@index([user_id, created_at(sort: Desc)])
  @@index([created_at(sort: Desc)])
}

enum ActivityType {
  ADDED_TO_LIBRARY
  COMPLETED
  RATED
  REVIEWED
  CREATED_LIST
  STARTED_READING
  FAVORITED
}

// ── Reading Rooms
model ReadingRoom {
  id            String    @id @default(cuid())
  slug          String    @unique
  manhwa_id     String
  title         String
  description   String?
  is_public     Boolean   @default(true)
  max_members   Int       @default(20)
  
  created_by    String
  created_at    DateTime  @default(now())
  
  members       RoomMember[]
  messages      RoomMessage[]
}

model RoomMember {
  room_id     String
  room        ReadingRoom @relation(fields: [room_id], references: [id])
  user_id     String
  user        User        @relation(fields: [user_id], references: [id])
  progress    Int         @default(0) // chapitre actuel dans la room
  joined_at   DateTime    @default(now())

  @@id([room_id, user_id])
}

model RoomMessage {
  id          String      @id @default(cuid())
  room_id     String
  room        ReadingRoom @relation(fields: [room_id], references: [id])
  user_id     String
  content     String      @db.VarChar(1000)
  chapter_ref Int?        // lié à quel chapitre
  reaction    String?     // "😱", "💀", "🔥", "😭"
  created_at  DateTime    @default(now())

  @@index([room_id, chapter_ref])
}

// ════════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════════

model Notification {
  id          String    @id @default(cuid())
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  type        String    // "new_chapter", "review_liked", "new_follower"...
  data        Json      // payload spécifique
  read        Boolean   @default(false)
  created_at  DateTime  @default(now())

  @@index([user_id, read, created_at(sort: Desc)])
}

// ════════════════════════════════════════════════════
// GAMIFICATION
// ════════════════════════════════════════════════════

model Achievement {
  id          String    @id @default(cuid())
  slug        String    @unique
  name_en     String
  name_fr     String
  description_en String
  description_fr String
  icon        String    // emoji ou URL icône
  category    String    // "reading", "social", "critic"
  
  users       UserAchievement[]
}

model UserAchievement {
  user_id        String
  user           User          @relation(fields: [user_id], references: [id])
  achievement_id String
  achievement    Achievement   @relation(fields: [achievement_id], references: [id])
  unlocked_at    DateTime      @default(now())

  @@id([user_id, achievement_id])
}

// ════════════════════════════════════════════════════
// MODÉRATION
// ════════════════════════════════════════════════════

model Report {
  id            String    @id @default(cuid())
  reporter_id   String
  content_type  String    // "review", "quote", "room_message"
  content_id    String
  reason        String    // "spam", "hate", "nsfw", "spoiler"
  status        String    @default("pending") // pending, resolved, dismissed
  created_at    DateTime  @default(now())
  resolved_at   DateTime?
  resolved_by   String?

  @@index([status, created_at])
  @@index([content_type, content_id])
}

model ModerationLog {
  id            String    @id @default(cuid())
  action        String    // "auto_block", "manual_ban", "content_removed"
  target_id     String
  target_type   String    // "user", "review", "quote"
  reason        String
  created_at    DateTime  @default(now())
}

// ════════════════════════════════════════════════════
// AUTOMATISATION & ADMIN
// ════════════════════════════════════════════════════

// Queue de posts sociaux
model SocialPostQueue {
  id            String    @id @default(cuid())
  platform      String    // "twitter", "instagram"
  content       String    @db.Text
  image_url     String?
  manhwa_id     String?
  scheduled_at  DateTime?
  posted_at     DateTime?
  post_url      String?   // lien vers le post publié
  status        String    @default("pending") // pending, posted, failed
  error         String?
  created_at    DateTime  @default(now())

  @@index([status, scheduled_at])
}

// Log des syncs API
model SyncLog {
  id          String    @id @default(cuid())
  source      String    // "anilist", "jikan", "webtoon_rss"
  type        String    // "bootstrap", "incremental", "release_check"
  items_synced Int      @default(0)
  items_new   Int       @default(0)
  items_updated Int     @default(0)
  errors      Int       @default(0)
  duration_ms Int?
  started_at  DateTime  @default(now())
  completed_at DateTime?
  error_log   String?   @db.Text
}
```

---

## 🗂️ Index Clés pour la Performance

```sql
-- Recherche full-text (Meilisearch sync, mais utile en DB aussi)
CREATE INDEX manhwa_title_search ON "Manhwa" USING gin(
  to_tsvector('english', title_en)
);

-- Trending par région
CREATE INDEX manhwa_trending_fr ON "Manhwa"(trending_fr DESC) 
  WHERE is_published = true;

-- Bibliothèque utilisateur (la requête la plus fréquente)
CREATE INDEX library_user_status ON "UserLibrary"(user_id, status, updated_at DESC);

-- Reviews par manhwa (feed principal des fiches)
CREATE INDEX reviews_manhwa_likes ON "Review"(manhwa_id, likes_count DESC)
  WHERE deleted_at IS NULL;

-- Score history pour les graphiques
CREATE INDEX score_history_manhwa ON "ScoreHistory"(manhwa_id, recorded_at DESC);

-- Releases récentes (cron + notifications)
CREATE INDEX releases_recent ON "Release"(released_at DESC, notifications_sent);
```

---

## 🔄 Relations Clés (résumé visuel)

```
Manhwa ──┬── ManhwaCreator ── Creator
         ├── ManhwaGenre ──── Genre
         ├── ManhwaTrope ──── Trope
         ├── Arc ──────────── ArcScore ── User
         ├── Release
         ├── ReadLink
         ├── Quote ─────────── QuoteVote ── User
         ├── ScoreHistory
         ├── SimilarManhwa
         └── Waitlist ─────── User

User ────┬── UserLibrary ──── Manhwa
         ├── JournalEntry ─── Manhwa
         ├── Review ─────────── ReviewLike ── User
         ├── ManhwaList ─────── ListItem ── Manhwa
         ├── Follow (follower / following)
         ├── Activity
         ├── Notification
         ├── CreatorFollow ─── Creator
         ├── RoomMember ─────── ReadingRoom
         └── UserAchievement ── Achievement
```

---

## 📊 Estimations de Volume

| Table | Mois 1 | Mois 6 | Mois 24 |
|---|---|---|---|
| Manhwa | 2 000 | 5 000 | 15 000 |
| UserLibrary | 5 000 | 150 000 | 3 000 000 |
| Review | 500 | 20 000 | 500 000 |
| Quote | 100 | 5 000 | 100 000 |
| Activity | 50 000 | 2 000 000 | 50 000 000 |
| Release | 500 | 10 000 | 100 000 |
| Notification | 10 000 | 500 000 | 10 000 000 |

> À 50M de lignes Activity → envisager partitionnement par mois ou archivage.

---

*Schéma DB · v1.0 · Mars 2026 · Prisma + PostgreSQL + Supabase*
