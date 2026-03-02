import { PrismaClient } from '@prisma/client'
import { pickArchetype, type Archetype } from './archetypes'
import { randomInt, randomDate, pickOne } from './utils'

const prisma = new PrismaClient()

// ── Username pools ──────────────────────────────────────────

const EN_PREFIXES = [
  'manga', 'webtoon', 'comic', 'reader', 'binge', 'night', 'dark', 'solo',
  'tower', 'shadow', 'steel', 'crystal', 'storm', 'blade', 'void', 'neon',
  'pixel', 'nova', 'echo', 'frost', 'flame', 'lunar', 'astral', 'cyber',
  'zen', 'rogue', 'max', 'kai', 'leo', 'mika', 'alex', 'jay', 'sky',
  'arc', 'ink', 'page', 'scroll', 'epic', 'myth', 'quest', 'hunt',
]

const EN_SUFFIXES = [
  'reader', 'fan', 'lover', 'addict', 'hunter', 'devourer', 'otaku',
  'reads', 'scroll', 'verse', 'world', 'saga', 'tale', 'knight',
  'wolf', 'fox', 'hawk', 'crow', 'cat', 'bear', 'lion', 'dragon',
]

const FR_PREFIXES = [
  'lecture', 'manga', 'webtoon', 'dark', 'solo', 'tour', 'ombre',
  'lune', 'flamme', 'acier', 'cristal', 'pixel', 'nova', 'echo',
  'zen', 'max', 'lea', 'hugo', 'emma', 'nina', 'paul', 'jade',
  'liam', 'axel', 'rose', 'encre', 'page', 'epique',
]

const FR_SUFFIXES = [
  'lecteur', 'fan', 'accro', 'chasseur', 'otaku',
  'lit', 'scroll', 'verse', 'monde', 'saga', 'conte',
  'loup', 'renard', 'faucon', 'chat', 'dragon',
]

const BIO_TEMPLATES_EN = [
  'Solo Leveling got me into manhwa. Now I can\'t stop. ⚔️',
  'Just here to track my reads and find hidden gems.',
  'Manhwa > manga, fight me.',
  'Reading is my superpower.',
  'I read way too much and I regret nothing.',
  'Fantasy and action enthusiast. Always looking for the next binge.',
  'Casual reader with strong opinions.',
  'I rate based on writing quality, art, and originality. No hype bias.',
  'Romance addict. My heart can\'t take it anymore.',
  'Action junkie. The more OP the MC, the better.',
  'Murim specialist. If there\'s no martial arts, I\'m not interested.',
  'Currently reading 20+ titles at once. Send help.',
  'Here to discover new manhwa and share my thoughts.',
  'Art style matters more than story. Change my mind.',
  'Slice of life enjoyer. No drama needed.',
  'Tower of God changed my life.',
  'I cry at romance manhwa and I\'m not ashamed.',
  'Manhwa collector since 2020.',
  null, null, null, null, // Some users have no bio
]

const BIO_TEMPLATES_FR = [
  'Solo Leveling m\'a fait découvrir les manhwa. Maintenant je suis accro.',
  'Je lis surtout des romances et des slice of life. Mon guilty pleasure.',
  'Manhwa > manga, venez me chercher.',
  'La lecture est mon super pouvoir.',
  'Je lis beaucoup trop et je ne regrette rien.',
  'Fan de fantasy et d\'action. Toujours à la recherche du prochain binge.',
  'Lecteur casual avec des opinions tranchées.',
  'Je note selon la qualité d\'écriture, l\'art et l\'originalité.',
  'Accro aux romances. Mon cœur n\'en peut plus.',
  'Drogué d\'action. Plus le MC est OP, mieux c\'est.',
  'Spécialiste murim. S\'il n\'y a pas d\'arts martiaux, ça ne m\'intéresse pas.',
  'En train de lire 20+ titres en même temps. Envoyez de l\'aide.',
  'Ici pour découvrir de nouveaux manhwa et partager mes avis.',
  'Le style artistique compte plus que l\'histoire.',
  'Slice of life enjoyer. Pas besoin de drama.',
  'Tower of God a changé ma vie.',
  'Je pleure devant les manhwa romance et j\'assume.',
  'Collectionneur de manhwa depuis 2020.',
  null, null, null, null,
]

function generateUsername(index: number, locale: 'fr' | 'en'): string {
  const prefixes = locale === 'fr' ? FR_PREFIXES : EN_PREFIXES
  const suffixes = locale === 'fr' ? FR_SUFFIXES : EN_SUFFIXES
  const prefix = pickOne(prefixes)
  const suffix = pickOne(suffixes)
  const separator = pickOne(['_', '', '-'])
  const number = Math.random() > 0.5 ? String(randomInt(1, 999)) : ''
  return `${prefix}${separator}${suffix}${number}`.toLowerCase().slice(0, 25)
}

export interface SeedUser {
  id: string
  username: string
  email: string
  display_name: string | null
  avatar_url: string
  bio: string | null
  locale: 'fr' | 'en'
  archetype: Archetype
  created_at: Date
}

export async function generateUsers(count: number): Promise<SeedUser[]> {
  const now = new Date()
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const usedUsernames = new Set<string>()
  const users: SeedUser[] = []

  for (let i = 0; i < count; i++) {
    const archetype = pickArchetype()
    const locale: 'fr' | 'en' = Math.random() < 0.4 ? 'fr' : 'en'

    // Generate unique username
    let username: string
    let attempts = 0
    do {
      username = generateUsername(i, locale)
      attempts++
      if (attempts > 20) username = `${username}${randomInt(100, 9999)}`
    } while (usedUsernames.has(username))
    usedUsernames.add(username)

    // Stagger creation dates (more recent = more accounts)
    let created_at: Date
    if (i < 100) {
      created_at = randomDate(ninetyDaysAgo, sixtyDaysAgo) // Early adopters
    } else if (i < 400) {
      created_at = randomDate(sixtyDaysAgo, thirtyDaysAgo)
    } else if (i < 800) {
      created_at = randomDate(thirtyDaysAgo, sevenDaysAgo)
    } else {
      created_at = randomDate(sevenDaysAgo, now)
    }

    const displayName = Math.random() > 0.3
      ? username.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 20)
      : null

    const bios = locale === 'fr' ? BIO_TEMPLATES_FR : BIO_TEMPLATES_EN
    const bio = pickOne(bios)

    users.push({
      id: '', // Will be set after DB insert
      username,
      email: `${username}@seed.manhwaverse.com`,
      display_name: displayName,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio,
      locale,
      archetype,
      created_at,
    })
  }

  // Batch insert into DB
  console.log(`  Creating ${users.length} users in DB...`)
  const createdUsers: SeedUser[] = []

  for (const user of users) {
    try {
      const dbUser = await prisma.user.create({
        data: {
          username: user.username,
          email: user.email,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          bio: user.bio,
          locale: user.locale,
          is_seed: true,
          created_at: user.created_at,
        },
      })
      createdUsers.push({ ...user, id: dbUser.id })
    } catch {
      // Username collision with existing user — skip
      console.log(`  ⚠ Skipped ${user.username} (collision)`)
    }
  }

  return createdUsers
}
