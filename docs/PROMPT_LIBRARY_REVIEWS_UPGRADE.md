# 📚 FEATURES — Quick Add + List Editor Modal + Reviews Mini-Blog
> Branch : `feat/library-and-reviews-upgrade` (NOUVELLE branche depuis main)

---

## ⚠️ PREMIÈRE ACTION

```bash
git checkout main
git pull origin main
git checkout -b feat/library-and-reviews-upgrade
```

---

## FEATURE 1 — Quick Add Dropdown sur le bouton bibliothèque

### Comportement actuel
Le bouton "Ajouter à la bibliothèque" ajoute le titre sans choix de statut. L'utilisateur doit ensuite aller modifier le statut.

### Comportement cible
Un dropdown intégré au bouton qui permet de choisir le statut en **un seul clic** :

```
État : pas dans la bibliothèque
┌──────────────────────────────┐
│  + Ajouter à la bibliothèque ▾ │
└──────────────────────────────┘
       ┌────────────────────┐
       │  📖 En cours       │
       │  📋 À lire         │  ← au clic, ajoute directement avec ce statut
       │  ✅ Terminé        │
       │  ⏸ En pause        │
       │  ❌ Abandonné      │
       │  ──────────────── │
       │  📝 Éditeur avancé │  ← ouvre le List Editor Modal (Feature 2)
       └────────────────────┘

État : déjà dans la bibliothèque (ex: "En cours")
┌──────────────────────────────┐
│  📖 En cours ▾               │  ← bouton bleu/gris avec statut actuel
└──────────────────────────────┘
       ┌────────────────────┐
       │  📖 En cours    ✓  │  ← checkmark sur le statut actuel
       │  📋 À lire         │
       │  ✅ Terminé        │
       │  ⏸ En pause        │
       │  🔄 En relecture   │
       │  ❌ Abandonné      │
       │  ──────────────── │
       │  📝 Éditeur avancé │
       │  🗑️ Retirer        │  ← supprimer de la bibliothèque
       └────────────────────┘
```

### Implémentation

```tsx
// /components/features/manhwa/AddToLibraryDropdown.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { ReadingStatus } from '@prisma/client'

interface Props {
  manhwaId: string
  currentStatus: ReadingStatus | null  // null = pas dans la bibliothèque
  onOpenEditor: () => void             // ouvre le List Editor Modal
}

const STATUS_OPTIONS: Array<{ value: ReadingStatus; icon: string; labelKey: string }> = [
  { value: 'READING', icon: '📖', labelKey: 'status.reading' },
  { value: 'PLAN_TO_READ', icon: '📋', labelKey: 'status.planToRead' },
  { value: 'COMPLETED', icon: '✅', labelKey: 'status.completed' },
  { value: 'ON_HOLD', icon: '⏸', labelKey: 'status.onHold' },
  { value: 'REREADING', icon: '🔄', labelKey: 'status.rereading' },
  { value: 'DROPPED', icon: '❌', labelKey: 'status.dropped' },
]

export function AddToLibraryDropdown({ manhwaId, currentStatus, onOpenEditor }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('library')

  // Fermer le dropdown au clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSelectStatus(status: ReadingStatus) {
    setOptimisticStatus(status)
    setIsOpen(false)
    
    // Server Action
    await updateLibraryStatus(manhwaId, status)
  }

  async function handleRemove() {
    setOptimisticStatus(null)
    setIsOpen(false)
    
    await removeFromLibrary(manhwaId)
  }

  const isInLibrary = optimisticStatus !== null
  const currentOption = STATUS_OPTIONS.find(o => o.value === optimisticStatus)

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition
          ${isInLibrary 
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {isInLibrary ? (
          <>
            <span>{currentOption?.icon}</span>
            <span>{t(currentOption?.labelKey || '')}</span>
          </>
        ) : (
          <span>{t('addToLibrary')}</span>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 w-56 rounded-xl bg-gray-900 border border-white/10 shadow-2xl overflow-hidden">
          {STATUS_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => handleSelectStatus(option.value)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition"
            >
              <span>{option.icon}</span>
              <span className="flex-1 text-left">{t(option.labelKey)}</span>
              {optimisticStatus === option.value && (
                <Check className="w-4 h-4 text-blue-400" />
              )}
            </button>
          ))}
          
          <div className="border-t border-white/10" />
          
          {/* Éditeur avancé */}
          <button
            onClick={() => { setIsOpen(false); onOpenEditor() }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition"
          >
            <span>📝</span>
            <span>{t('openEditor')}</span>
          </button>
          
          {/* Retirer — seulement si déjà dans la bibliothèque */}
          {isInLibrary && (
            <button
              onClick={handleRemove}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition"
            >
              <span>🗑️</span>
              <span>{t('remove')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

### Server Actions

```typescript
// /lib/actions/library.ts
'use server'

import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db/client'
import { ReadingStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function updateLibraryStatus(manhwaId: string, status: ReadingStatus) {
  const session = await getServerSession()
  if (!session) throw new Error('Unauthorized')

  const now = new Date()

  await prisma.userLibrary.upsert({
    where: {
      user_id_manhwa_id: { user_id: session.user.id, manhwa_id: manhwaId },
    },
    create: {
      user_id: session.user.id,
      manhwa_id: manhwaId,
      status,
      started_at: status === 'READING' ? now : undefined,
      completed_at: status === 'COMPLETED' ? now : undefined,
    },
    update: {
      status,
      started_at: status === 'READING' ? now : undefined,
      completed_at: status === 'COMPLETED' ? now : undefined,
      updated_at: now,
    },
  })

  // Mettre à jour les compteurs dénormalisés
  const readerCount = await prisma.userLibrary.count({
    where: { manhwa_id: manhwaId },
  })
  await prisma.manhwa.update({
    where: { id: manhwaId },
    data: { reader_count: readerCount },
  })

  // Créer une activité
  await prisma.activity.create({
    data: {
      user_id: session.user.id,
      type: status === 'COMPLETED' ? 'COMPLETED' 
            : status === 'READING' ? 'STARTED_READING'
            : 'ADDED_TO_LIBRARY',
      manhwa_id: manhwaId,
      metadata: { status },
    },
  })

  revalidatePath(`/manhwa/`)
}

export async function removeFromLibrary(manhwaId: string) {
  const session = await getServerSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.userLibrary.delete({
    where: {
      user_id_manhwa_id: { user_id: session.user.id, manhwa_id: manhwaId },
    },
  })

  const readerCount = await prisma.userLibrary.count({
    where: { manhwa_id: manhwaId },
  })
  await prisma.manhwa.update({
    where: { id: manhwaId },
    data: { reader_count: readerCount },
  })

  revalidatePath(`/manhwa/`)
}
```

---

## FEATURE 2 — List Editor Modal (popup d'édition avancée)

### Comportement
Quand l'utilisateur clique "Éditeur avancé" dans le dropdown (ou quand il veut modifier ses détails), un **modal fullscreen** s'ouvre par-dessus la page. Comme AniList : banner en haut, cover + titre, puis les champs d'édition.

### Layout du modal

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Banner image floue en fond]                              [✕]     │
│  ┌──────┐                                                          │
│  │COVER │  Solo Leveling                        [♥ Favori] [Save]  │
│  └──────┘  나 혼자만 레벨업                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Statut              Score             Progression    Listes        │
│  ┌──────────┐       ┌──────────┐     ┌──────────┐   ┌──────────┐  │
│  │ En cours ▾│       │  ★ 9 /10 │     │  Ch. 142 │   │ Aucune   │  │
│  └──────────┘       └──────────┘     └──────────┘   │ liste    │  │
│                                                      │          │  │
│                                                      │ □ Privé  │  │
│                                                      └──────────┘  │
│                                                                     │
│  Date de début       Date de fin      Relectures                   │
│  ┌──────────┐       ┌──────────┐     ┌──────────┐                  │
│  │ 📅 12/03 │       │ 📅 --    │     │    0     │                  │
│  └──────────┘       └──────────┘     └──────────┘                  │
│                                                                     │
│  Notes privées                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Mon manhwa préféré, je recommande après le chapitre 30...   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Tags privés                                                        │
│  [#guilty-pleasure] [#à-recommander] [+ Ajouter]                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Champs (tous mappés sur le schéma UserLibrary existant)

| Champ UI | Champ DB (UserLibrary) | Type | Notes |
|---|---|---|---|
| Statut | `status` | ReadingStatus enum | Dropdown |
| Score | `score` | Float? /10 | Slider ou input numérique 1-10 |
| Progression | `progress` | Int | Numéro du chapitre actuel |
| Date de début | `started_at` | DateTime? | Date picker |
| Date de fin | `completed_at` | DateTime? | Date picker |
| Relectures | `reread_count` | Int | Input numérique |
| Score de relecture | `reread_score` | Float? | Si reread_count > 0 |
| Notes privées | via JournalEntry | String | Textarea libre |
| Tags privés | `private_tags` | String[] | Chips éditables |
| Favori | `is_favorite` | Boolean | Toggle cœur |
| Score privé | `score_private` | Float? | Toggle "Note visible publiquement" |

### Implémentation

```tsx
// /components/features/manhwa/ListEditorModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { ReadingStatus } from '@prisma/client'

interface LibraryEntry {
  status: ReadingStatus
  score: number | null
  progress: number
  started_at: string | null
  completed_at: string | null
  reread_count: number
  reread_score: number | null
  is_favorite: boolean
  score_private: number | null
  private_tags: string[]
}

interface Props {
  isOpen: boolean
  onClose: () => void
  manhwa: {
    id: string
    title_en: string
    title_kr: string | null
    cover_url: string | null
    banner_url: string | null
    chapter_count: number | null
  }
  initialEntry: LibraryEntry | null  // null si pas encore dans la bibliothèque
}

export function ListEditorModal({ isOpen, onClose, manhwa, initialEntry }: Props) {
  const t = useTranslations('library')
  
  // State local pour l'édition
  const [entry, setEntry] = useState<LibraryEntry>(
    initialEntry ?? {
      status: 'PLAN_TO_READ',
      score: null,
      progress: 0,
      started_at: null,
      completed_at: null,
      reread_count: 0,
      reread_score: null,
      is_favorite: false,
      score_private: null,
      private_tags: [],
    }
  )
  const [isSaving, setIsSaving] = useState(false)
  const [newTag, setNewTag] = useState('')

  // Reset quand le modal s'ouvre avec de nouvelles données
  useEffect(() => {
    if (initialEntry) setEntry(initialEntry)
  }, [initialEntry])

  if (!isOpen) return null

  async function handleSave() {
    setIsSaving(true)
    try {
      await saveLibraryEntry(manhwa.id, entry)
      onClose()
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  function handleAddTag() {
    if (newTag.trim() && !entry.private_tags.includes(newTag.trim())) {
      setEntry(prev => ({
        ...prev,
        private_tags: [...prev.private_tags, newTag.trim()],
      }))
      setNewTag('')
    }
  }

  function handleRemoveTag(tag: string) {
    setEntry(prev => ({
      ...prev,
      private_tags: prev.private_tags.filter(t => t !== tag),
    }))
  }

  // Auto-fill dates based on status changes
  function handleStatusChange(newStatus: ReadingStatus) {
    const now = new Date().toISOString().split('T')[0]
    setEntry(prev => ({
      ...prev,
      status: newStatus,
      // Si on passe en "En cours" et pas de date de début → auto-fill
      started_at: newStatus === 'READING' && !prev.started_at ? now : prev.started_at,
      // Si on passe en "Terminé" et pas de date de fin → auto-fill
      completed_at: newStatus === 'COMPLETED' && !prev.completed_at ? now : prev.completed_at,
      // Si on passe en "Terminé" et il y a un chapter_count → auto-fill progression
      progress: newStatus === 'COMPLETED' && manhwa.chapter_count 
        ? manhwa.chapter_count 
        : prev.progress,
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-900 shadow-2xl">
        
        {/* Header avec banner */}
        <div className="relative h-[120px] overflow-hidden rounded-t-2xl">
          {manhwa.banner_url ? (
            <Image src={manhwa.banner_url} alt="" fill className="object-cover opacity-50" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-900/30 to-purple-900/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          
          {/* Bouton fermer */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Cover + Titre + Actions */}
        <div className="flex items-start gap-4 px-6 -mt-12 relative z-10">
          <Image 
            src={manhwa.cover_url || '/placeholder-cover.jpg'} 
            alt={manhwa.title_en}
            width={80} height={112}
            className="rounded-lg shadow-lg shrink-0"
          />
          <div className="flex-1 pt-8">
            <h2 className="text-lg font-bold">{manhwa.title_en}</h2>
            {manhwa.title_kr && (
              <p className="text-sm text-gray-400">{manhwa.title_kr}</p>
            )}
          </div>
          <div className="flex items-center gap-3 pt-8">
            {/* Bouton favori */}
            <button
              onClick={() => setEntry(prev => ({ ...prev, is_favorite: !prev.is_favorite }))}
              className={`p-2 rounded-lg transition ${
                entry.is_favorite 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-white/5 text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${entry.is_favorite ? 'fill-current' : ''}`} />
            </button>
            
            {/* Bouton sauvegarder */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isSaving ? t('saving') : t('save')}
            </button>
          </div>
        </div>
        
        {/* Formulaire */}
        <div className="p-6 space-y-6">
          
          {/* Ligne 1 : Statut, Score, Progression, Listes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Statut */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">{t('editor.status')}</label>
              <select
                value={entry.status}
                onChange={(e) => handleStatusChange(e.target.value as ReadingStatus)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Score */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">{t('editor.score')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={entry.score ?? ''}
                  onChange={(e) => setEntry(prev => ({ 
                    ...prev, 
                    score: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                  placeholder="—"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-gray-500 text-sm">/10</span>
              </div>
            </div>
            
            {/* Progression */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">{t('editor.progress')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={manhwa.chapter_count ?? 9999}
                  value={entry.progress}
                  onChange={(e) => setEntry(prev => ({ 
                    ...prev, 
                    progress: parseInt(e.target.value) || 0 
                  }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                />
                {manhwa.chapter_count && (
                  <span className="text-gray-500 text-sm shrink-0">
                    / {manhwa.chapter_count}
                  </span>
                )}
              </div>
            </div>
            
            {/* Placeholder pour Custom Lists (futur) */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">{t('editor.customLists')}</label>
              <p className="text-xs text-gray-600 py-2">{t('editor.noCustomLists')}</p>
            </div>
          </div>
          
          {/* Ligne 2 : Dates, Relectures */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Date de début */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">{t('editor.startDate')}</label>
              <input
                type="date"
                value={entry.started_at ?? ''}
                onChange={(e) => setEntry(prev => ({ 
                  ...prev, 
                  started_at: e.target.value || null 
                }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            
            {/* Date de fin */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">{t('editor.endDate')}</label>
              <input
                type="date"
                value={entry.completed_at ?? ''}
                onChange={(e) => setEntry(prev => ({ 
                  ...prev, 
                  completed_at: e.target.value || null 
                }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            
            {/* Relectures */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">{t('editor.rereads')}</label>
              <input
                type="number"
                min="0"
                value={entry.reread_count}
                onChange={(e) => setEntry(prev => ({ 
                  ...prev, 
                  reread_count: parseInt(e.target.value) || 0 
                }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          
          {/* Tags privés */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('editor.privateTags')}</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {entry.private_tags.map(tag => (
                <span 
                  key={tag} 
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-sm"
                >
                  {tag}
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder={t('editor.addTag')}
                  className="bg-transparent border-b border-white/20 px-2 py-1 text-sm w-32 focus:border-blue-400 outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Notes privées */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('editor.notes')}</label>
            <textarea
              rows={3}
              placeholder={t('editor.notesPlaceholder')}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm resize-y"
            />
            <p className="text-xs text-gray-600 mt-1">{t('editor.notesPrivate')}</p>
          </div>
          
        </div>
      </div>
    </div>
  )
}
```

### Server Action pour sauvegarder

```typescript
// /lib/actions/library.ts (ajouter)
'use server'

export async function saveLibraryEntry(manhwaId: string, entry: LibraryEntry) {
  const session = await getServerSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.userLibrary.upsert({
    where: {
      user_id_manhwa_id: { user_id: session.user.id, manhwa_id: manhwaId },
    },
    create: {
      user_id: session.user.id,
      manhwa_id: manhwaId,
      status: entry.status,
      score: entry.score,
      score_private: entry.score_private,
      progress: entry.progress,
      started_at: entry.started_at ? new Date(entry.started_at) : null,
      completed_at: entry.completed_at ? new Date(entry.completed_at) : null,
      reread_count: entry.reread_count,
      reread_score: entry.reread_score,
      is_favorite: entry.is_favorite,
      private_tags: entry.private_tags,
    },
    update: {
      status: entry.status,
      score: entry.score,
      score_private: entry.score_private,
      progress: entry.progress,
      started_at: entry.started_at ? new Date(entry.started_at) : null,
      completed_at: entry.completed_at ? new Date(entry.completed_at) : null,
      reread_count: entry.reread_count,
      reread_score: entry.reread_score,
      is_favorite: entry.is_favorite,
      private_tags: entry.private_tags,
      updated_at: new Date(),
    },
  })

  // Mettre à jour le score moyen du manhwa si score changé
  if (entry.score !== null) {
    const avgResult = await prisma.userLibrary.aggregate({
      where: { manhwa_id: manhwaId, score: { not: null } },
      _avg: { score: true },
      _count: { score: true },
    })
    
    await prisma.manhwa.update({
      where: { id: manhwaId },
      data: {
        score_avg: avgResult._avg.score,
        score_count: avgResult._count.score,
      },
    })
  }

  // Activité
  await prisma.activity.create({
    data: {
      user_id: session.user.id,
      type: entry.score ? 'RATED' : 'ADDED_TO_LIBRARY',
      manhwa_id: manhwaId,
      metadata: { status: entry.status, score: entry.score },
    },
  })

  revalidatePath(`/manhwa/`)
}
```

### Auto-fill intelligent

Quand l'utilisateur change le statut dans le modal :
- Passe en "En cours" → auto-fill `started_at` avec aujourd'hui (si vide)
- Passe en "Terminé" → auto-fill `completed_at` avec aujourd'hui (si vide) + `progress` = `chapter_count` (si connu)
- Passe en "Relecture" → incrémenter `reread_count` de 1

---

## FEATURE 3 — Reviews longues (mini-blog) avec page dédiée

### Concept
Les reviews longues ont leur propre page avec un layout éditorial : hero banner, texte complet, score en grand, système de like/dislike. C'est aussi du contenu SEO indexable.

### 3.1 — Distinguer les types de reviews

On a déjà `is_micro` dans le schéma Review :
- **Avis rapide** (`is_micro = true`) : ≤ 280 caractères, affiché inline dans l'onglet Critiques
- **Critique longue** (`is_micro = false`) : illimité, a un titre, a sa propre page

Ajouter un champ `title` à la table Review s'il n'existe pas :

```prisma
model Review {
  // ... champs existants ...
  title       String?   // Titre de la review (pour les longues)
}
```

### 3.2 — Formulaire d'écriture de critique longue

Au clic sur "Écrire une critique" (pas "avis rapide"), ouvrir une **page dédiée** ou un **modal large** avec :

```
┌─────────────────────────────────────────────────────────────────┐
│  Écrire une critique — Solo Leveling                            │
│                                                                 │
│  Titre de votre critique                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Ma review détaillée de Solo Leveling                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Votre critique                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  Éditeur riche avec markdown basique :                   │   │
│  │  **gras**, *italique*, paragraphes                       │   │
│  │                                                          │   │
│  │  (minimum 200 caractères pour une critique longue)       │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Notes par dimension (optionnel)                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                  │
│  │ Story  │ │  Art   │ │ Perso  │ │ Monde  │                  │
│  │  8/10  │ │  9/10  │ │  7/10  │ │  8/10  │                  │
│  └────────┘ └────────┘ └────────┘ └────────┘                  │
│                                                                 │
│  Score global                                                   │
│  ★ 8.5 / 10                                                    │
│                                                                 │
│  □ Contient des spoilers                                        │
│                                                                 │
│  [Publier la critique]                                          │
└─────────────────────────────────────────────────────────────────┘
```

Les champs `score_story`, `score_art`, `score_characters`, `score_world` existent déjà dans le schéma.

### 3.3 — Page dédiée pour chaque review longue

**Route : `/manhwa/[slug]/review/[reviewId]`**

Layout inspiré d'AniList :

```
┌──────────────────────────────────────────────────────────────┐
│  [Banner du manhwa en fond, flou + overlay sombre]           │
│                                                              │
│               Solo Leveling                                  │
│          a review by @username                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─────────────── Contenu de la review ──────────────────────────┐
│                                                               │
│  [Titre de la review en h1]                                   │
│                                                               │
│  [Texte complet de la review, avec paragraphes,              │
│   formatage markdown rendu en HTML propre]                    │
│                                                               │
│  ...                                                          │
│                                                               │
│  ┌───────────────────┐                                        │
│  │     ★ 8.5 / 10    │  ← score en grand, coloré             │
│  └───────────────────┘                                        │
│                                                               │
│  Notes détaillées :                                           │
│  Story: 8  Art: 9  Personnages: 7  Monde: 8                  │
│                                                               │
│  ┌───────────────────────────────────┐                        │
│  │  👎  👍   12 sur 15 ont aimé      │                        │
│  └───────────────────────────────────┘                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 3.4 — SEO pour les pages review

```typescript
// /app/[locale]/manhwa/[slug]/review/[reviewId]/page.tsx

export async function generateMetadata({ params }): Promise<Metadata> {
  const review = await getReviewById(params.reviewId)
  if (!review) return {}

  const title = review.title 
    ? `${review.title} — ${review.manhwa.title_en} Review`
    : `${review.manhwa.title_en} Review by ${review.user.username}`

  return {
    title: `${title} — ManhwaVerse`,
    description: review.content.slice(0, 155) + '...',
    openGraph: {
      title,
      description: review.content.slice(0, 155) + '...',
      images: review.manhwa.banner_url ? [review.manhwa.banner_url] : [],
    },
  }
}
```

### 3.5 — Système de like/dislike sur les reviews

Modifier le système existant (ReviewLike) pour supporter like ET dislike :

```prisma
model ReviewVote {
  user_id     String
  user        User      @relation(fields: [user_id], references: [id])
  review_id   String
  review      Review    @relation(fields: [review_id], references: [id])
  value       Int       // +1 (like) ou -1 (dislike)
  created_at  DateTime  @default(now())

  @@id([user_id, review_id])
}
```

**OU** garder `ReviewLike` et ajouter un champ `value` (+1 / -1). Adapter les compteurs :

```typescript
// Ajouter au model Review :
likes_count     Int @default(0)   // nombre de 👍
dislikes_count  Int @default(0)   // nombre de 👎
```

Affichage :
```
👎 3   👍 12    "12 sur 15 ont aimé cette critique"
```

### 3.6 — Affichage des reviews sur la fiche (onglet Critiques)

```
Critiques (8)                          Populaire | Récent

┌────────────────────────────────────────────────────────┐
│  [Avatar] @NordySandwich      ★ 9/10      👍 12       │
│  "Why Solo Leveling changed my perspective on manhwa"  │
│                                                        │
│  I remember the first time I started reading this,     │
│  I wasn't exactly excited. I had just finished a       │
│  couple of high-energy series...                       │
│  [Lire la critique complète →]                         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  [Avatar] @ManhwaFan42        ★ 8/10      👍 7        │
│  Un vrai chef-d'œuvre en 200 chapitres. L'arc du       │
│  donjon double est incroyable...                       │
│  [Lire la critique complète →]                         │
└────────────────────────────────────────────────────────┘

Avis rapides (14)
┌────────────────────────────────────────────────────────┐
│  [Avatar] @reader123   ★ 10   "Peak manhwa 🔥"        │
│  [Avatar] @webtoonlvr  ★ 7    "Bon mais la fin..."    │
│  [Avatar] @slime_king   ★ 9    "대박 !!!"             │
└────────────────────────────────────────────────────────┘
```

Les critiques longues sont affichées en preview (titre + premiers ~150 chars) avec un lien vers la page complète. Les avis rapides sont affichés inline en mode compact.

---

## TRADUCTIONS

```json
// fr.json
{
  "library": {
    "addToLibrary": "Ajouter à la bibliothèque",
    "openEditor": "Éditeur avancé",
    "remove": "Retirer de la bibliothèque",
    "save": "Enregistrer",
    "saving": "Enregistrement...",
    "status": {
      "reading": "En cours",
      "planToRead": "À lire",
      "completed": "Terminé",
      "onHold": "En pause",
      "rereading": "En relecture",
      "dropped": "Abandonné"
    },
    "editor": {
      "status": "Statut",
      "score": "Note",
      "progress": "Progression",
      "startDate": "Date de début",
      "endDate": "Date de fin",
      "rereads": "Relectures",
      "privateTags": "Tags privés",
      "addTag": "Ajouter un tag...",
      "notes": "Notes privées",
      "notesPlaceholder": "Vos notes personnelles sur ce titre...",
      "notesPrivate": "Ces notes ne sont visibles que par vous.",
      "customLists": "Listes personnalisées",
      "noCustomLists": "Aucune liste personnalisée"
    }
  },
  "review": {
    "writeQuick": "Écrire un avis rapide",
    "writeFull": "Écrire une critique",
    "title": "Titre de votre critique",
    "content": "Votre critique",
    "minLength": "Minimum 200 caractères pour une critique",
    "scoreStory": "Scénario",
    "scoreArt": "Dessin",
    "scoreCharacters": "Personnages",
    "scoreWorld": "Univers",
    "globalScore": "Note globale",
    "hasSpoilers": "Contient des spoilers",
    "publish": "Publier la critique",
    "readFull": "Lire la critique complète →",
    "quickReviews": "Avis rapides",
    "outOf": "sur",
    "liked": "ont aimé cette critique"
  }
}
```

---

## CHECKLIST

**Feature 1 — Quick Add Dropdown :**
- [ ] Dropdown avec tous les statuts au clic sur le bouton bibliothèque
- [ ] Changement de statut en un seul clic (optimistic update)
- [ ] Statut actuel affiché sur le bouton avec checkmark dans le dropdown
- [ ] Option "Éditeur avancé" ouvre le modal
- [ ] Option "Retirer" visible uniquement si déjà dans la bibliothèque

**Feature 2 — List Editor Modal :**
- [ ] Modal avec banner + cover + titre en header
- [ ] Tous les champs : statut, score /10, progression, dates, relectures, tags, notes
- [ ] Auto-fill des dates et progression au changement de statut
- [ ] Bouton favori ♥ dans le modal
- [ ] Sauvegarde avec mise à jour des compteurs (score_avg, reader_count)
- [ ] Création d'activité dans le feed

**Feature 3 — Reviews longues :**
- [ ] Formulaire de critique longue avec titre + éditeur + scores par dimension
- [ ] Page dédiée `/manhwa/[slug]/review/[reviewId]` avec layout éditorial
- [ ] Hero banner + texte complet + score en grand + like/dislike
- [ ] `generateMetadata()` et OG tags pour chaque page review
- [ ] Séparation critiques longues / avis rapides dans l'onglet Critiques
- [ ] Preview des critiques longues (titre + 150 chars + "Lire la suite")
- [ ] Compteur like/dislike avec "X sur Y ont aimé"

**Général :**
- [ ] Toutes les strings via i18n (FR/EN)
- [ ] Mobile responsive
- [ ] Pas de `any` TypeScript

```bash
git add .
git commit -m "feat: quick add dropdown, list editor modal, long reviews with dedicated pages"
git push origin feat/library-and-reviews-upgrade
```
