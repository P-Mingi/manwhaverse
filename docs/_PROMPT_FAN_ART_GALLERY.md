# 🎨 FAN ART GALLERY — Galerie communautaire de fan arts manhwa
> Branch : `feat/fan-art-gallery`

---

## ⚠️ PREMIÈRE ACTION

```bash
git checkout main
git pull origin main
git checkout -b feat/fan-art-gallery
```

---

## CONTEXTE

Une galerie où les utilisateurs postent des fan arts liés aux manhwa. Système dédié (pas le blog), avec upload d'images, likes, commentaires, profils artistes, et filtre NSFW. Bon pour l'engagement communautaire et le SEO images (Google Images).

---

## PARTIE 1 — Stockage images : Supabase Storage

### Setup du bucket

```typescript
// Créer un bucket "fan-art" dans Supabase Storage
// Via le dashboard Supabase : Storage → New Bucket → "fan-art" → Public

// Ou via le SDK :
const { data, error } = await supabase.storage.createBucket('fan-art', {
  public: true,       // Images accessibles publiquement (nécessaire pour SEO)
  fileSizeLimit: 5242880, // 5MB max
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
})
```

### Politique d'accès (RLS)

```sql
-- Lecture publique (tout le monde peut voir les images)
CREATE POLICY "Public read fan-art" ON storage.objects
  FOR SELECT USING (bucket_id = 'fan-art');

-- Upload réservé aux utilisateurs connectés
CREATE POLICY "Authenticated upload fan-art" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'fan-art'
    AND auth.role() = 'authenticated'
  );

-- Suppression par le propriétaire ou admin
CREATE POLICY "Owner or admin delete fan-art" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'fan-art'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]  -- Le dossier est le user_id
      OR auth.jwt() ->> 'role' = 'admin'
    )
  );
```

### Structure des fichiers dans le bucket

```
fan-art/
├── {user_id}/
│   ├── {post_id}/
│   │   ├── original_1.webp      ← Image originale (max 5MB)
│   │   ├── full_1.webp          ← Redimensionnée 1920px wide
│   │   ├── medium_1.webp        ← Redimensionnée 800px wide
│   │   ├── thumb_1.webp         ← Thumbnail 300px wide
│   │   ├── original_2.webp      ← Deuxième image du post
│   │   ├── full_2.webp
│   │   ├── medium_2.webp
│   │   └── thumb_2.webp
```

### Traitement d'images (upload + resize)

```typescript
// /lib/upload/fan-art.ts

import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role pour les uploads server-side
)

interface UploadResult {
  original_url: string
  full_url: string
  medium_url: string
  thumb_url: string
  width: number
  height: number
  size_bytes: number
}

export async function uploadFanArtImage(
  file: Buffer,
  userId: string,
  postId: string,
  index: number,
  mimeType: string
): Promise<UploadResult> {
  const basePath = `${userId}/${postId}`

  // Lire les dimensions originales
  const metadata = await sharp(file).metadata()
  const width = metadata.width!
  const height = metadata.height!

  // Générer les 3 tailles + garder l'original
  const sizes = [
    { name: 'original', maxWidth: null },
    { name: 'full', maxWidth: 1920 },
    { name: 'medium', maxWidth: 800 },
    { name: 'thumb', maxWidth: 300 },
  ]

  const urls: Record<string, string> = {}

  for (const size of sizes) {
    let processed: Buffer

    if (size.maxWidth === null) {
      // Original : juste convertir en WebP sans redimensionner
      processed = await sharp(file)
        .webp({ quality: 90 })
        .toBuffer()
    } else {
      // Redimensionner + WebP
      processed = await sharp(file)
        .resize(size.maxWidth, null, {
          withoutEnlargement: true, // Ne pas agrandir les petites images
          fit: 'inside',
        })
        .webp({ quality: size.name === 'thumb' ? 75 : 85 })
        .toBuffer()
    }

    const filePath = `${basePath}/${size.name}_${index}.webp`

    const { error } = await supabase.storage
      .from('fan-art')
      .upload(filePath, processed, {
        contentType: 'image/webp',
        upsert: true,
      })

    if (error) throw new Error(`Upload failed for ${size.name}: ${error.message}`)

    const { data: urlData } = supabase.storage
      .from('fan-art')
      .getPublicUrl(filePath)

    urls[size.name] = urlData.publicUrl
  }

  return {
    original_url: urls.original,
    full_url: urls.full,
    medium_url: urls.medium,
    thumb_url: urls.thumb,
    width,
    height,
    size_bytes: file.length,
  }
}
```

---

## PARTIE 2 — Base de données

```prisma
// ═══════════════════════════════════════════════════════════
// FAN ART SYSTEM
// ═══════════════════════════════════════════════════════════

model FanArtPost {
  id            String    @id @default(cuid())
  
  // Auteur
  user_id       String
  user          User      @relation(fields: [user_id], references: [id])
  
  // Lien manhwa (optionnel)
  manhwa_id     String?
  manhwa        Manhwa?   @relation(fields: [manhwa_id], references: [id])
  
  // Contenu
  title         String              // "Jin-Woo vs Igris — Digital Art"
  description   String?  @db.Text   // Description libre (markdown léger)
  
  // Crédit artiste original (obligatoire si pas le sien)
  is_original   Boolean  @default(true)   // true = "c'est mon art"
  credit_name   String?                    // "ArtistName" — obligatoire si is_original = false
  credit_url    String?                    // Lien vers le profil de l'artiste original
  
  // NSFW
  is_nsfw       Boolean  @default(false)
  
  // Tags
  tags          String[]            // ["digital", "colored", "action", "solo-leveling"]
  
  // Stats dénormalisées
  like_count    Int      @default(0)
  comment_count Int      @default(0)
  view_count    Int      @default(0)
  
  // Images (1 à 10 images par post)
  images        FanArtImage[]
  
  // Interactions
  likes         FanArtLike[]
  comments      FanArtComment[]
  
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  
  @@index([user_id, created_at(sort: Desc)])
  @@index([manhwa_id, like_count(sort: Desc)])
  @@index([created_at(sort: Desc)])
  @@index([like_count(sort: Desc)])
  @@index([is_nsfw])
}

model FanArtImage {
  id            String    @id @default(cuid())
  post_id       String
  post          FanArtPost @relation(fields: [post_id], references: [id], onDelete: Cascade)
  
  position      Int                // Ordre dans le post (1, 2, 3...)
  
  // URLs des différentes tailles
  original_url  String
  full_url      String             // 1920px
  medium_url    String             // 800px
  thumb_url     String             // 300px
  
  // Metadata
  width         Int
  height        Int
  size_bytes    Int
  alt_text      String?            // Pour l'accessibilité et le SEO
  
  @@index([post_id, position])
}

model FanArtLike {
  user_id     String
  user        User        @relation(fields: [user_id], references: [id])
  post_id     String
  post        FanArtPost  @relation(fields: [post_id], references: [id], onDelete: Cascade)
  created_at  DateTime    @default(now())

  @@id([user_id, post_id])
}

model FanArtComment {
  id          String    @id @default(cuid())
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  post_id     String
  post        FanArtPost @relation(fields: [post_id], references: [id], onDelete: Cascade)
  
  content     String    @db.Text
  
  // Reply support (optionnel, pour les réponses à un commentaire)
  parent_id   String?
  parent      FanArtComment? @relation("FanArtCommentReplies", fields: [parent_id], references: [id])
  replies     FanArtComment[] @relation("FanArtCommentReplies")
  
  created_at  DateTime  @default(now())
  
  @@index([post_id, created_at])
}

// ═══════════════════════════════════════════════════════════
// PROFIL ARTISTE (extension du User existant)
// ═══════════════════════════════════════════════════════════

// Ajouter ces champs au model User existant :
model User {
  // ... champs existants ...
  
  // Profil artiste
  is_artist             Boolean   @default(false)  // Activé dès qu'il poste un fan art
  artist_bio            String?   @db.Text
  artist_twitter        String?                     // @handle ou URL
  artist_instagram      String?
  artist_pixiv          String?                     // URL profil Pixiv
  artist_deviantart     String?
  artist_artstation     String?
  artist_portfolio_url  String?                     // Site perso
  
  // Relations
  fan_art_posts         FanArtPost[]
  fan_art_likes         FanArtLike[]
  fan_art_comments      FanArtComment[]
}
```

---

## PARTIE 3 — Routes

```
/artwork                          → Galerie principale (grille masonry)
/artwork/new                      → Formulaire de soumission
/artwork/[postId]                 → Page détail d'un fan art
/artwork/top                      → Top fan arts (les plus likés)
/artwork/top?period=week          → Top de la semaine
/artwork/top?period=month         → Top du mois

/profile/[username]/artwork       → Portfolio d'un artiste (onglet profil)

Sur la fiche manhwa :
/manhwa/[slug]                    → Onglet "Fan Art" (si des fan arts sont liés)
```

---

## PARTIE 4 — Page galerie principale `/artwork`

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  🎨 Fan Art Gallery                                              │
│  Explorez les créations de la communauté ManhwaVerse              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [🔍 Rechercher...]  [Tous ▾] [Digital ▾] [Manhwa ▾] [Trier ▾] │
│                                                                  │
│  ┌──────────┐ ┌────────────────┐ ┌──────────┐                  │
│  │          │ │                │ │          │                  │
│  │  [img]   │ │    [img]      │ │  [img]   │                  │
│  │          │ │    (tall)     │ │          │                  │
│  │ ♡ 234   │ │               │ │ ♡ 89    │                  │
│  │ @artist  │ │ ♡ 1,247      │ │ @artist  │                  │
│  └──────────┘ │ @artist       │ └──────────┘                  │
│  ┌──────────┐ └────────────────┘ ┌──────────┐                  │
│  │          │ ┌──────────┐       │          │                  │
│  │  [img]   │ │  [img]   │       │  [img]   │                  │
│  │          │ │          │       │          │                  │
│  │ ♡ 567   │ │ ♡ 45    │       │ ♡ 312   │                  │
│  └──────────┘ └──────────┘       └──────────┘                  │
│                                                                  │
│  [Charger plus]                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Grille Masonry

Utiliser une grille masonry CSS (pas de lib externe) pour un rendu type Pinterest où les images de tailles différentes s'emboîtent naturellement :

```tsx
// /app/[locale]/artwork/page.tsx

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return {
    title: params.locale === 'fr' 
      ? 'Fan Art Gallery — Créations de la communauté ManhwaVerse'
      : 'Fan Art Gallery — ManhwaVerse Community Creations',
    description: params.locale === 'fr'
      ? 'Découvrez les fan arts de la communauté ManhwaVerse. Partagez vos créations et explorez celles des autres fans de manhwa.'
      : 'Discover fan art from the ManhwaVerse community. Share your creations and explore artwork from fellow manhwa fans.',
  }
}

export default async function ArtworkPage({ searchParams }: {
  searchParams: { tag?: string; manhwa?: string; sort?: string; page?: string }
}) {
  const t = useTranslations('artwork')
  const session = await getServerSession()
  
  // Filtre NSFW : respecter la préférence utilisateur
  const showNsfw = session?.user?.preferences?.show_nsfw ?? false
  
  const where: any = {
    ...(showNsfw ? {} : { is_nsfw: false }),
    ...(searchParams.tag ? { tags: { has: searchParams.tag } } : {}),
    ...(searchParams.manhwa ? { manhwa: { slug: searchParams.manhwa } } : {}),
  }
  
  const orderBy = searchParams.sort === 'top' 
    ? { like_count: 'desc' as const }
    : { created_at: 'desc' as const }
  
  const page = parseInt(searchParams.page || '1')
  const perPage = 24
  
  const posts = await prisma.fanArtPost.findMany({
    where,
    orderBy,
    skip: (page - 1) * perPage,
    take: perPage,
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 }, // Juste la première image pour la grille
      user: { select: { id: true, username: true, avatar_url: true } },
      manhwa: { select: { slug: true, title_en: true } },
      _count: { select: { comments: true } },
    },
  })
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🎨 {t('title')}</h1>
          <p className="text-gray-400 text-sm">{t('subtitle')}</p>
        </div>
        {session && (
          <Link 
            href="/artwork/new"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            + {t('submit')}
          </Link>
        )}
      </div>
      
      {/* Filtres */}
      <ArtworkFilters currentTag={searchParams.tag} currentSort={searchParams.sort} />
      
      {/* Grille Masonry */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 mt-6">
        {posts.map(post => (
          <ArtworkCard key={post.id} post={post} />
        ))}
      </div>
      
      {/* Pagination */}
      <Pagination currentPage={page} hasMore={posts.length === perPage} />
    </div>
  )
}
```

### Carte fan art

```tsx
// /components/features/artwork/ArtworkCard.tsx

export function ArtworkCard({ post }: { post: FanArtPostWithRelations }) {
  const firstImage = post.images[0]
  if (!firstImage) return null
  
  return (
    <Link 
      href={`/artwork/${post.id}`}
      className="block mb-4 break-inside-avoid group"
    >
      <div className="relative rounded-xl overflow-hidden bg-white/5">
        {/* Image — hauteur naturelle (masonry) */}
        <img
          src={firstImage.medium_url}
          alt={post.title}
          width={firstImage.width}
          height={firstImage.height}
          className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Overlay au hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-sm font-medium line-clamp-1">{post.title}</p>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1.5">
                <img 
                  src={post.user.avatar_url || '/default-avatar.svg'} 
                  className="w-5 h-5 rounded-full"
                  alt=""
                />
                <span className="text-xs text-gray-300">@{post.user.username}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {post.like_count}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> {post._count.comments}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Badge NSFW */}
        {post.is_nsfw && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600/90 text-[10px] font-bold">
            NSFW
          </span>
        )}
        
        {/* Badge multi-images */}
        {post.images.length > 1 && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px]">
            📷 {post.images.length}
          </span>
        )}
      </div>
    </Link>
  )
}
```

---

## PARTIE 5 — Page détail `/artwork/[postId]`

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Retour à la galerie                                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                                                        │     │
│  │              [Image principale pleine largeur]          │     │
│  │                                                        │     │
│  │              [◄ 1/4 ►] navigation si multi-images      │     │
│  │                                                        │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  Jin-Woo vs Igris — Digital Art                    ♡ 1,247  💬 23│
│                                                                  │
│  ┌──────┐  @shadow_artist · il y a 3 jours                      │
│  │avatar│  "Mon interprétation du combat final..."               │
│  └──────┘                                                        │
│           🎨 Twitter · Instagram · Pixiv                         │
│                                                                  │
│  Lié à : Solo Leveling →                                        │
│  Tags : #digital #action #solo-leveling #battle                 │
│                                                                  │
│  ─── Commentaires (23) ────────────────────────────             │
│                                                                  │
│  @user1 · il y a 2h                                             │
│  Incroyable ! L'éclairage est parfait 🔥                        │
│       ↩ Répondre                                                │
│                                                                  │
│  @user2 · il y a 5h                                             │
│  L'anatomie est super bien rendue, bravo                        │
│       ↩ Répondre                                                │
│                                                                  │
│  [Écrire un commentaire...]                                     │
│                                                                  │
│  ─── Du même artiste ──────────────────────────────             │
│  [thumb] [thumb] [thumb] [thumb]                                │
│                                                                  │
│  ─── Fan arts similaires ──────────────────────────             │
│  [thumb] [thumb] [thumb] [thumb]                                │
└──────────────────────────────────────────────────────────────────┘
```

### Crédit artiste original

Si `is_original = false` (l'art n'est pas de l'utilisateur qui poste), afficher un encadré bien visible :

```
┌─────────────────────────────────────────────┐
│  🎨 Artiste original : Kim MinJun            │
│  🔗 twitter.com/kiminjun_art                 │
│  Posté par @manhwaverse_admin                │
└─────────────────────────────────────────────┘
```

### SEO pour Google Images

```typescript
// generateMetadata pour chaque fan art
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getFanArtPost(params.postId)
  const firstImage = post.images[0]
  
  return {
    title: `${post.title} — Fan Art${post.manhwa ? ` | ${post.manhwa.title_en}` : ''} — ManhwaVerse`,
    description: post.description?.slice(0, 155) || `Fan art by @${post.user.username}`,
    openGraph: {
      type: 'article',
      images: firstImage ? [{
        url: firstImage.full_url,
        width: firstImage.width,
        height: firstImage.height,
        alt: post.title,
      }] : [],
    },
  }
}
```

---

## PARTIE 6 — Formulaire de soumission `/artwork/new`

```
┌──────────────────────────────────────────────────────────────────┐
│  🎨 Publier un fan art                                           │
│                                                                  │
│  Images (1-10 images max)                                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌─────────────┐             │
│  │ [img]  │ │ [img]  │ │ [img]  │ │  + Ajouter  │             │
│  │  ✕     │ │  ✕     │ │  ✕     │ │  une image  │             │
│  └────────┘ └────────┘ └────────┘ └─────────────┘             │
│  Drag & drop ou cliquez · JPG, PNG, WebP, GIF · 5MB max chacune│
│                                                                  │
│  Titre *                                                        │
│  [Jin-Woo vs Igris — Digital Art                            ]   │
│                                                                  │
│  Description (optionnel)                                        │
│  [Mon interprétation du combat final du chapitre 130...     ]   │
│                                                                  │
│  Manhwa lié (optionnel)                                         │
│  [🔍 Rechercher un manhwa...  → Solo Leveling ✕            ]   │
│                                                                  │
│  ─── Crédit ────────────────────────────────────                │
│  ○ C'est mon œuvre originale                                    │
│  ● Ce n'est pas mon œuvre (crédit obligatoire)                  │
│     Nom de l'artiste * : [Kim MinJun                        ]   │
│     Lien profil artiste : [https://twitter.com/kiminjun_art ]   │
│                                                                  │
│  Tags                                                           │
│  [digital] [action] [battle] [+ Ajouter]                        │
│  Suggestions : digital, traditional, sketch, colored, cosplay,  │
│  meme, wallpaper, comic, chibi, portrait, landscape             │
│                                                                  │
│  ☐ Contenu NSFW / +18                                           │
│                                                                  │
│                                              [Publier]          │
└──────────────────────────────────────────────────────────────────┘
```

### Server action

```typescript
// /lib/actions/fan-art.ts
'use server'

export async function createFanArtPost(formData: FormData) {
  const session = await getServerSession()
  if (!session) throw new Error('Unauthorized')
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const manhwaId = formData.get('manhwa_id') as string | null
  const isOriginal = formData.get('is_original') === 'true'
  const creditName = formData.get('credit_name') as string | null
  const creditUrl = formData.get('credit_url') as string | null
  const isNsfw = formData.get('is_nsfw') === 'true'
  const tags = JSON.parse(formData.get('tags') as string || '[]')
  const files = formData.getAll('images') as File[]
  
  // Validations
  if (!title || title.length < 3) throw new Error('Title too short')
  if (files.length === 0) throw new Error('At least one image required')
  if (files.length > 10) throw new Error('Maximum 10 images')
  if (!isOriginal && !creditName) throw new Error('Credit is required for non-original art')
  
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) throw new Error('Image too large (5MB max)')
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      throw new Error('Invalid image format')
    }
  }
  
  // Créer le post
  const post = await prisma.fanArtPost.create({
    data: {
      user_id: session.user.id,
      manhwa_id: manhwaId,
      title,
      description,
      is_original: isOriginal,
      credit_name: isOriginal ? null : creditName,
      credit_url: isOriginal ? null : creditUrl,
      is_nsfw: isNsfw,
      tags,
    },
  })
  
  // Upload les images
  for (let i = 0; i < files.length; i++) {
    const buffer = Buffer.from(await files[i].arrayBuffer())
    const result = await uploadFanArtImage(buffer, session.user.id, post.id, i + 1, files[i].type)
    
    await prisma.fanArtImage.create({
      data: {
        post_id: post.id,
        position: i + 1,
        original_url: result.original_url,
        full_url: result.full_url,
        medium_url: result.medium_url,
        thumb_url: result.thumb_url,
        width: result.width,
        height: result.height,
        size_bytes: result.size_bytes,
        alt_text: `${title} — Image ${i + 1}`,
      },
    })
  }
  
  // Activer le profil artiste si premier post
  await prisma.user.update({
    where: { id: session.user.id },
    data: { is_artist: true },
  })
  
  revalidatePath('/artwork')
  redirect(`/artwork/${post.id}`)
}
```

---

## PARTIE 7 — Profil artiste

### Extension du profil utilisateur

Quand un user poste son premier fan art, `is_artist` passe à `true` automatiquement. Son profil gagne :

1. **Un onglet "Créations"** sur sa page profil (`/profile/[username]/artwork`) qui montre tous ses fan arts en grille masonry
2. **Une section "Réseaux sociaux"** dans l'édition du profil pour ajouter ses liens artiste
3. **Un badge "Artiste"** à côté de son username dans les commentaires et posts

```
/profile/[username]
  [Aperçu]  [Bibliothèque]  [Critiques]  [Créations 🎨]  [Activité]
                                            ↑ visible seulement si is_artist = true

Page "Créations" :
  ┌─────────────────────────────────────────────────────────┐
  │  🎨 Créations de @shadow_artist                         │
  │  34 fan arts · 12,847 likes au total                    │
  │                                                         │
  │  🔗 Twitter · Instagram · Pixiv · ArtStation            │
  │                                                         │
  │  [Grille masonry de tous ses fan arts]                  │
  └─────────────────────────────────────────────────────────┘
```

### Formulaire édition profil artiste

```
─── Profil artiste ──────────────────────────
Bio artiste :    [textarea]
Twitter :        [@handle ou URL]
Instagram :      [@handle ou URL]
Pixiv :          [URL]
DeviantArt :     [URL]
ArtStation :     [URL]
Site personnel : [URL]
```

---

## PARTIE 8 — Fan arts sur la fiche manhwa

Si des fan arts sont liés à un manhwa, ajouter un onglet "Fan Art" sur la fiche :

```
[Aperçu]  [Personnages]  [Staff]  [Critiques]  [Fan Art]  [Stats]
                                                  ↑ visible si ≥ 1 fan art lié

Onglet Fan Art :
  ┌─────────────────────────────────────────────────────────┐
  │  🎨 Fan Art de Solo Leveling (47 créations)             │
  │                                                         │
  │  [Grille masonry : top 12 fan arts par likes]           │
  │                                                         │
  │  Voir tous les fan arts →  (/artwork?manhwa=solo-leveling)│
  └─────────────────────────────────────────────────────────┘
```

---

## PARTIE 9 — Filtre NSFW

### Préférence utilisateur

Ajouter un champ dans les préférences utilisateur :

```prisma
// Ajouter au model User ou UserPreferences :
show_nsfw   Boolean @default(false)
```

Accessible dans les settings du profil : "Afficher le contenu NSFW / +18" toggle.

### Application du filtre

**Partout** où des fan arts sont affichés (galerie, fiche manhwa, profil, homepage) :

```typescript
// Helper global
function getNsfwFilter(session: Session | null): object {
  const showNsfw = session?.user?.preferences?.show_nsfw ?? false
  return showNsfw ? {} : { is_nsfw: false }
}

// Utilisation dans les queries :
const posts = await prisma.fanArtPost.findMany({
  where: {
    ...getNsfwFilter(session),
    // ... autres filtres
  },
})
```

### Affichage NSFW avec blur

Si un utilisateur NON-connecté ou avec `show_nsfw = false` tombe sur un post NSFW (via un lien direct), afficher l'image floutée avec un overlay :

```tsx
{post.is_nsfw && !showNsfw && (
  <div className="relative">
    <img src={firstImage.medium_url} className="blur-xl" alt="" />
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="text-center">
        <p className="font-bold">Contenu NSFW / +18</p>
        <p className="text-sm text-gray-400 mt-1">Activez le contenu NSFW dans vos paramètres pour voir cette image</p>
      </div>
    </div>
  </div>
)}
```

---

## PARTIE 10 — "Fan Art de la semaine" (homepage)

Chaque semaine, les fan arts les plus likés apparaissent sur la homepage dans une section dédiée :

```
🎨 Fan Art de la semaine
  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
  │  [img]   │ │  [img]   │ │  [img]   │ │  [img]   │
  │ ♡ 1,247  │ │ ♡ 892   │ │ ♡ 654   │ │ ♡ 543   │
  │ @artist  │ │ @artist  │ │ @artist  │ │ @artist  │
  └──────────┘ └──────────┘ └──────────┘ └──────────┘
  Voir la galerie →
```

Query : `fanArtPost.findMany({ where: { created_at: { gte: 7 days ago }, is_nsfw: false }, orderBy: { like_count: 'desc' }, take: 4 })`

---

## PARTIE 11 — Seed initial de fan arts

Pour le lancement, poster des fan arts en créditant les artistes originaux. Utiliser le compte admin :

```typescript
// /scripts/seed/seed-fan-art.ts

// Télécharger des fan arts depuis des artistes consentants ou des images libres de droits
// Créditer SYSTÉMATIQUEMENT l'artiste original

const INITIAL_FAN_ARTS = [
  {
    title: 'Sung Jin-Woo Shadow Monarch — Digital Art',
    manhwaSlug: 'solo-leveling',
    imageUrls: ['https://...'], // URLs des images à télécharger et re-upload
    creditName: 'ArtistName',
    creditUrl: 'https://twitter.com/artist',
    tags: ['digital', 'colored', 'portrait'],
    isOriginal: false,
  },
  // ... 50-100 fan arts pour le lancement
]
```

**IMPORTANT :** Ne poster QUE des fan arts dont l'artiste a donné son consentement pour le repost (vérifier les bios Twitter/Pixiv pour "repost OK with credit"), ou des images sous licence Creative Commons.

---

## TRADUCTIONS

```json
// fr.json
"artwork": {
  "title": "Fan Art Gallery",
  "subtitle": "Explorez les créations de la communauté ManhwaVerse",
  "submit": "Publier un fan art",
  "submitTitle": "Publier un fan art",
  "titleField": "Titre",
  "descriptionField": "Description (optionnel)",
  "manhwaField": "Manhwa lié (optionnel)",
  "isOriginal": "C'est mon œuvre originale",
  "notOriginal": "Ce n'est pas mon œuvre (crédit obligatoire)",
  "creditName": "Nom de l'artiste",
  "creditUrl": "Lien vers le profil de l'artiste",
  "tags": "Tags",
  "nsfw": "Contenu NSFW / +18",
  "nsfwWarning": "Contenu NSFW / +18",
  "nsfwEnable": "Activez le contenu NSFW dans vos paramètres pour voir cette image",
  "publish": "Publier",
  "topWeek": "Fan Art de la semaine",
  "topMonth": "Top du mois",
  "topAllTime": "Top all-time",
  "sameArtist": "Du même artiste",
  "similar": "Fan arts similaires",
  "viewAll": "Voir la galerie →",
  "linked": "Lié à",
  "comments": "Commentaires",
  "writeComment": "Écrire un commentaire...",
  "reply": "Répondre",
  "artistProfile": "Profil artiste",
  "creations": "Créations",
  "totalLikes": "likes au total",
  "dragDrop": "Glissez-déposez ou cliquez · JPG, PNG, WebP, GIF · 5MB max"
}

// en.json
"artwork": {
  "title": "Fan Art Gallery",
  "subtitle": "Explore creations from the ManhwaVerse community",
  "submit": "Submit fan art",
  "submitTitle": "Submit fan art",
  "titleField": "Title",
  "descriptionField": "Description (optional)",
  "manhwaField": "Linked manhwa (optional)",
  "isOriginal": "This is my original work",
  "notOriginal": "This is not my work (credit required)",
  "creditName": "Artist name",
  "creditUrl": "Link to artist's profile",
  "tags": "Tags",
  "nsfw": "NSFW / 18+ content",
  "nsfwWarning": "NSFW / 18+ content",
  "nsfwEnable": "Enable NSFW content in your settings to view this image",
  "publish": "Publish",
  "topWeek": "Fan Art of the Week",
  "topMonth": "Top of the Month",
  "topAllTime": "Top All Time",
  "sameArtist": "More from this artist",
  "similar": "Similar fan art",
  "viewAll": "View gallery →",
  "linked": "Linked to",
  "comments": "Comments",
  "writeComment": "Write a comment...",
  "reply": "Reply",
  "artistProfile": "Artist profile",
  "creations": "Creations",
  "totalLikes": "total likes",
  "dragDrop": "Drag & drop or click · JPG, PNG, WebP, GIF · 5MB max"
}
```

---

## CHECKLIST

**Stockage :**
- [ ] Bucket "fan-art" créé dans Supabase Storage (public)
- [ ] Politiques RLS configurées (read public, upload authenticated, delete owner/admin)
- [ ] Upload + resize en 3 tailles (full 1920px, medium 800px, thumb 300px) via sharp
- [ ] Conversion en WebP automatique
- [ ] Max 5MB par image, formats JPG/PNG/WebP/GIF

**DB :**
- [ ] Tables `FanArtPost`, `FanArtImage`, `FanArtLike`, `FanArtComment`
- [ ] Champs profil artiste sur User (is_artist, artist_twitter, artist_instagram, etc.)
- [ ] Champ `show_nsfw` dans les préférences utilisateur

**Pages :**
- [ ] `/artwork` — Galerie masonry avec filtres (tag, manhwa, tri)
- [ ] `/artwork/new` — Formulaire soumission (upload multi-images, drag&drop)
- [ ] `/artwork/[postId]` — Page détail avec carousel images, likes, commentaires
- [ ] `/artwork/top` — Top fan arts par période (semaine, mois, all-time)
- [ ] `/profile/[username]/artwork` — Portfolio d'un artiste

**Features :**
- [ ] Upload 1-10 images par post
- [ ] Crédit artiste obligatoire si `is_original = false`
- [ ] Système de likes (toggle, optimistic update)
- [ ] Commentaires avec replies
- [ ] Toggle NSFW par post + filtre global par préférence utilisateur
- [ ] Images NSFW floutées si le filtre est actif
- [ ] Tags libres + suggestions
- [ ] Lien optionnel vers un manhwa
- [ ] `is_artist = true` automatique au premier post
- [ ] Badge "Artiste" sur le profil
- [ ] Section "Fan Art de la semaine" sur la homepage
- [ ] Onglet "Fan Art" sur les fiches manhwa (si ≥ 1 fan art lié)
- [ ] generateMetadata SEO + OG image pour chaque post
- [ ] Toutes les strings via i18n (FR/EN)

```bash
git add .
git commit -m "feat: fan art gallery — upload, masonry grid, likes, comments, artist profiles, NSFW filter"
git push origin feat/fan-art-gallery
```
