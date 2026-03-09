/**
 * Seed 20 creative community lists from 20 different users
 * Run: npx tsx lib/ingestion/seed-lists.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const LIST_DEFINITIONS = [
  {
    username: 'ShadowHunter99',
    title: 'The Ultimate Hunter Tier List',
    description: 'S-tier hunters only. If the MC does not carry the entire ecosystem on their back, they do not make this list.',
    items: ['Solo Leveling', 'Tomb Raider King', 'The Hero Returns', 'The Max Level Returner', 'Jack Be Invincible', 'My S-Class Hunters', 'I Am the Sorcerer King'],
  },
  {
    username: 'HeartOfInk',
    title: 'Manhwa That Made Me Cry at 3am',
    description: 'I was NOT prepared. Put down your snacks before reading any of these.',
    items: ['Marry My Husband', 'Touch My Little Brother and You', 'The Twins', 'Crimson Karma', 'For Better or For Worse', 'The Beloved Little Princess'],
  },
  {
    username: 'BlitzReaderX',
    title: 'If You Liked Solo Leveling Read These Next',
    description: 'The essential reading list for anyone still in withdrawal after finishing Solo Leveling.',
    items: ['Mythic Item Obtained', 'The 100th Regression of the Max-Level Player', 'The Gamer', 'Dungeon Reset', 'I Am the Sorcerer King', 'The Last Adventurer', 'Solo Leveling: Ragnarok'],
  },
  {
    username: 'RomanceAddict',
    title: 'Best Villainess Protagonists Ever Written',
    description: 'Forget the original FL. These villainess leads steal every scene and the whole story.',
    items: ['The Villainess Flips the Script!', 'I Woke Up as the Villain', 'Villain Duke', 'I Failed to Oust the Villain!', 'The Villainess', 'I Became the Villain'],
  },
  {
    username: 'SwordSaint77',
    title: 'Murim Beginner Pack',
    description: 'New to murim? Start here. Old school cultivation energy meets modern storytelling.',
    items: ['Log-in Murim', 'Chronicles of the Demon Faction', 'Infinite Leveling: Murim', 'The Martial God Who Regressed Back to Level 2', 'Reverse Villain', 'Hwasanjeonsaeng'],
  },
  {
    username: 'SecondLeadStan',
    title: 'Romance That Hits Completely Different',
    description: 'Not your average love story. Slow burn, enemies-to-lovers, second leads that deserved better.',
    items: ['Flirting With The Villain', 'From a Knight to a Lady', 'The Lady and the Beast', 'Secret Lady', 'My Secretly Hot Husband', 'Little Rabbit and the Big Bad Leopard', 'My Gently Raised Beast'],
  },
  {
    username: 'RebirthReader',
    title: 'Regression Done Right',
    description: 'Not all time-loop manhwa are equal. These use the premise to tell something meaningful.',
    items: ['The Art of Reincarnation', 'The Legendary Spearman Returns', 'MEMORIZE', '66,666 Years: Advent of the Dark Mage', 'The 100th Regression of the Max-Level Player', 'Relife Player', 'The Reborn Ranker Chronicles'],
  },
  {
    username: 'DungeonCrusher',
    title: 'Dungeon Crawler Essentials',
    description: 'Gates. Dungeons. Boss raids. If it has a dungeon and a power system, it belongs here.',
    items: ['Dungeon Reset', 'The Gamer', 'QUESTISM', 'Yongsa High: Dungeon Raiders', 'Surviving the Game as a Barbarian', 'Taming Master', 'The Top Dungeon Farmer'],
  },
  {
    username: 'FlutterPanel',
    title: 'Manhwa with Jaw-Dropping Artwork',
    description: 'Reading these feels like flipping through a gallery. Every panel could be framed.',
    items: ['Lord of the Mysteries', 'Barbarian Quest', 'Crimson Karma', 'Solo Leveling', 'Log-in Murim', 'The Divine Twilight', 'A Dance of Swords in the Night'],
  },
  {
    username: 'DimensionHopper',
    title: 'Isekai But Make It Actually Interesting',
    description: 'No harem, no overpowered cheat skills. Just genuinely clever isekai with actual stakes.',
    items: ['The Constellations Are My Disciples', 'MEMORIZE', 'Reborn as a Scholar', '8th Circle Mage Reborn', 'Becoming the Monarch', 'Release that Witch', 'The Divine Surgeon'],
  },
  {
    username: 'IsekaiVeteran',
    title: 'Necromancer Power Fantasy',
    description: 'They said necromancers are the bad guys. They lied. This subgenre hits harder than anything else.',
    items: ["Seoul Station's Necromancer", 'Necromancer, the Ultimate Scourge!', 'All-Master Necromancer', 'The 100th Regression of the Max-Level Player', 'MEMORIZE'],
  },
  {
    username: 'LoveInkStained',
    title: 'Slow Burn Romance That Was Worth Every Chapter',
    description: 'I waited 80+ chapters for the confession and I would do it again without hesitation.',
    items: ['Happily Ever Afterwards', 'My Gently Raised Beast', 'The Lady and the Beast', 'Caught by the Villain', 'The Twins', 'For Better or For Worse'],
  },
  {
    username: 'TearDropPage',
    title: "Endings That Actually Stuck the Landing",
    description: 'In a sea of rushed or anticlimactic endings, these manhwa finished strong.',
    items: ['For Better or For Worse', 'Marry My Husband', 'Solo Leveling', 'The Hero Returns', 'Happily Ever Afterwards', 'Crimson Karma'],
  },
  {
    username: 'NewGamePlusKR',
    title: 'Hidden Gems Nobody Is Talking About',
    description: 'Slept-on masterpieces. Less than 1K reader reviews each. You are welcome.',
    items: ['Boundless Ascension', 'The Lord of Coins', 'The Divine Twilight', 'Reborn as a Scholar', 'The Apothecary Prince', 'A Flame Reborn', 'The Celestial Returned from Hell'],
  },
  {
    username: 'GateBreaker',
    title: 'Best Power Systems in All of Manhwa',
    description: 'Leveling, skills, constellations — these manhwa made me genuinely study their magic systems.',
    items: ['The Gamer', 'QUESTISM', 'MEMORIZE', 'The 100th Regression of the Max-Level Player', 'Mythic Item Obtained', 'Solo Leveling: Ragnarok', 'The Constellations Are My Disciples'],
  },
  {
    username: 'DramaQueenKR',
    title: 'Manhwa for Your Revenge Era',
    description: 'She suffered. She regressed. Now she is unstoppable and everyone who wronged her will pay.',
    items: ['Crimson Karma', 'Marry My Husband', 'I Woke Up as the Villain', 'The Villainess', 'Touch My Little Brother and You', 'The Genius Assassin Who Takes It All'],
  },
  {
    username: 'HunterOfHunters',
    title: 'Murim Plus Academy Combo Pack',
    description: 'Cultivation energy meets school arc. The best of both subgenres in one reading list.',
    items: ['Infinite Leveling: Murim', 'The Academy', 'Enrolling in the Transcendent Academy', 'Hwasanjeonsaeng', 'The Reborn Ranker Chronicles', 'Becoming a Magic School Mage'],
  },
  {
    username: 'ClicheAndProud',
    title: 'Manhwa I Read Instead of Sleeping',
    description: 'It was 11pm. I said just one chapter. It was 5am. Zero regrets.',
    items: ['Solo Leveling', 'Log-in Murim', 'Flirting With The Villain', 'The Gamer', 'My S-Class Hunters', 'The Villainess Flips the Script!', 'Dungeon Reset'],
  },
  {
    username: 'ShoujoSunrise',
    title: 'Royalty and Nobles Done Right',
    description: 'Ballgowns, court politics, arranged marriages, and MCs who refuse to play by the rules.',
    items: ['The Beloved Little Princess', 'Charlotte and Her 5 Disciples', 'The Male Lead', 'I Belong to House Castielo', 'House Mayton', 'A Tender Heart', 'My Daughter Is The Final Boss'],
  },
  {
    username: 'TruckKunSurvivor',
    title: 'These Manhwa Broke My Brain In the Best Way',
    description: 'Plot twists I did not see coming. Lore so deep I needed a spreadsheet. Endings that still haunt me.',
    items: ['Lord of the Mysteries', 'The Live', 'Demon King of the Royal Class', 'MEMORIZE', 'Chronicles of the Demon Faction', 'Reverse Villain', 'The Reborn Young Lord is an Assassin'],
  },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

async function uniqueSlug(base: string): Promise<string> {
  const slug = slugify(base)
  let candidate = slug
  let attempt = 0
  while (true) {
    const existing = await prisma.manhwaList.findUnique({ where: { slug: candidate } })
    if (!existing) return candidate
    attempt++
    candidate = `${slug}-${attempt}`
  }
}

async function main() {
  console.log('Loading users and manhwa...')

  const users = await prisma.user.findMany({ select: { id: true, username: true } })
  const manhwas = await prisma.manhwa.findMany({
    where: { is_published: true, deleted_at: null },
    select: { id: true, title_en: true },
  })

  const userMap = new Map(users.map((u) => [u.username, u.id]))
  const manhwaList = manhwas.map((m) => ({ id: m.id, title: m.title_en }))

  function findManhwaId(query: string): string | null {
    const lower = query.toLowerCase()
    // exact
    const exact = manhwaList.find((m) => m.title.toLowerCase() === lower)
    if (exact) return exact.id
    // starts with
    const startsWith = manhwaList.find((m) => m.title.toLowerCase().startsWith(lower))
    if (startsWith) return startsWith.id
    // query starts with title
    const queryStartsWith = manhwaList.find((m) => lower.startsWith(m.title.toLowerCase()))
    if (queryStartsWith) return queryStartsWith.id
    // contains
    const contains = manhwaList.find(
      (m) => m.title.toLowerCase().includes(lower) || lower.includes(m.title.toLowerCase()),
    )
    return contains?.id ?? null
  }

  let created = 0
  let skipped = 0

  for (const def of LIST_DEFINITIONS) {
    const userId = userMap.get(def.username)
    if (!userId) {
      console.warn(`  User not found: ${def.username}`)
      skipped++
      continue
    }

    const itemIds: string[] = []
    for (const q of def.items) {
      const id = findManhwaId(q)
      if (id) {
        itemIds.push(id)
      } else {
        console.warn(`    Manhwa not found: "${q}"`)
      }
    }

    if (itemIds.length === 0) {
      console.warn(`  No manhwa resolved for "${def.title}", skipping`)
      skipped++
      continue
    }

    const existing = await prisma.manhwaList.findFirst({
      where: { user_id: userId, title: def.title },
    })
    if (existing) {
      console.log(`  Already exists: "${def.title}"`)
      skipped++
      continue
    }

    const slug = await uniqueSlug(def.title)

    const list = await prisma.manhwaList.create({
      data: {
        slug,
        title: def.title,
        description: def.description,
        is_public: true,
        user_id: userId,
        item_count: itemIds.length,
      },
    })

    await prisma.listItem.createMany({
      data: itemIds.map((manhwaId, i) => ({
        list_id: list.id,
        manhwa_id: manhwaId,
        position: i + 1,
      })),
    })

    await prisma.manhwa.updateMany({
      where: { id: { in: itemIds } },
      data: { list_count: { increment: 1 } },
    })

    console.log(`  OK  "${def.title}" by ${def.username} — ${itemIds.length} items`)
    created++
  }

  console.log(`\nDone — ${created} lists created, ${skipped} skipped.`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
