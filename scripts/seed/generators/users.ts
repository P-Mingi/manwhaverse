// /scripts/seed/generators/users.ts
import type { PrismaClient } from '@prisma/client'
import type { Archetype } from '../archetypes'
import { USERNAMES } from '../templates/usernames'
import { BIO_TEMPLATES, POPULAR_TITLES } from '../templates/bios'
import { randomInt, randomDate, getAvatarUrl, pickOne, replacePlaceholders } from '../utils'

export interface SeedUser {
  id: string
  username: string
  email: string
  locale: 'fr' | 'en'
  archetype: Archetype
  created_at: Date
}

function pickLocale(archetype: Archetype): 'fr' | 'en' {
  if (archetype.locale === 'fr') return 'fr'
  if (archetype.locale === 'en') return 'en'
  return Math.random() < 0.4 ? 'fr' : 'en'
}

function generateBio(archetype: Archetype): string {
  const templates = BIO_TEMPLATES[archetype.name] ?? BIO_TEMPLATES['CASUAL_READER']!
  const template = pickOne(templates)
  return replacePlaceholders(template, {
    year: randomInt(2018, 2025),
    count: randomInt(50, 500),
    fav_title: pickOne(POPULAR_TITLES),
  })
}

export async function generateUsers(
  prisma: PrismaClient,
  totalUsers: number,
  archetypes: Archetype[],
): Promise<SeedUser[]> {
  // Check existing seed users
  const existingCount = await prisma.user.count({ where: { is_seed: true } })
  if (existingCount > 0) {
    console.log(`  ⚠ Found ${existingCount} existing seed users. Skipping user creation.`)
    const existing = await prisma.user.findMany({
      where: { is_seed: true },
      select: { id: true, username: true, email: true, locale: true, created_at: true },
    })
    // We can't reconstruct archetype from DB, return minimal seed users
    // The generators that need archetype will re-query differently
    return existing.map((u) => ({
      id: u.id,
      username: u.username ?? '',
      email: u.email ?? '',
      locale: (u.locale ?? 'en') as 'fr' | 'en',
      archetype: archetypes[0]!, // placeholder
      created_at: u.created_at,
    }))
  }

  // Shuffle usernames pool
  const shuffledNames = [...USERNAMES].sort(() => Math.random() - 0.5)
  if (shuffledNames.length < totalUsers) {
    throw new Error(`Not enough usernames: need ${totalUsers}, have ${shuffledNames.length}`)
  }

  // Build user list according to archetype proportions
  const userDefs: Array<{ username: string; archetype: Archetype; locale: 'fr' | 'en' }> = []
  let nameIdx = 0

  for (const arch of archetypes) {
    for (let i = 0; i < arch.count; i++) {
      if (nameIdx >= totalUsers) break
      const username = shuffledNames[nameIdx++]!
      const locale = pickLocale(arch)
      userDefs.push({ username, archetype: arch, locale })
    }
  }

  // Stagger creation dates over ~90 days
  const now = new Date()
  const earliest = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const seedUsers: SeedUser[] = []

  // Create in batches of 100 to avoid memory issues
  const batchSize = 100
  for (let i = 0; i < userDefs.length; i += batchSize) {
    const batch = userDefs.slice(i, i + batchSize)
    const created = await Promise.all(
      batch.map(async ({ username, archetype, locale }) => {
        const created_at = randomDate(earliest, now)
        const bio = generateBio(archetype)
        const avatar_url = getAvatarUrl(username)
        const display_name = username.replace(/_/g, ' ')

        try {
          const user = await prisma.user.create({
            data: {
              username,
              email: `${username}@seed.manhwaverse.com`,
              display_name,
              avatar_url,
              bio,
              locale,
              is_seed: true,
              created_at,
            },
            select: { id: true, created_at: true },
          })
          return {
            id: user.id,
            username,
            email: `${username}@seed.manhwaverse.com`,
            locale,
            archetype,
            created_at: user.created_at,
          } as SeedUser
        } catch {
          // Username collision — skip
          return null
        }
      }),
    )

    for (const u of created) {
      if (u) seedUsers.push(u)
    }

    if ((i / batchSize + 1) % 5 === 0) {
      console.log(`    Created ${seedUsers.length}/${totalUsers} users...`)
    }
  }

  return seedUsers
}
