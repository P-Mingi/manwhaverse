import { prisma } from '../db/client'
import type { ReadingStatus, Prisma } from '@prisma/client'

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

interface Archetype {
  key: string
  readerClass: string
  primaryGenres: string[]
  secondaryGenres: string[]
  tropes: string[]
  librarySize: [number, number]
  statusWeights: Record<ReadingStatus, number>
  scoreRange: [number, number]
  scoreBias: number
  favoriteRate: number
  reviewChance: number
}

interface SeedUserDef {
  username: string
  displayName: string
  bio: string
  locale: 'en' | 'fr'
  archetype: Archetype
}

type ManhwaRow = {
  id: string
  slug: string
  title_en: string
  status: string
  chapter_count: number | null
  genre_links: { genre: { slug: string } }[]
  trope_links: { trope: { slug: string } }[]
}

// ═══════════════════════════════════════════════════
// ARCHETYPES
// ═══════════════════════════════════════════════════

const ARCHETYPES: Archetype[] = [
  {
    key: 'action_junkie',
    readerClass: 'Action Addict',
    primaryGenres: ['action', 'adventure'],
    secondaryGenres: ['fantasy', 'sci-fi', 'supernatural'],
    tropes: ['overpowered-mc', 'system', 'gate-dungeon', 'tower-climbing'],
    librarySize: [15, 25],
    statusWeights: { READING: 4, COMPLETED: 3, ON_HOLD: 1, DROPPED: 1, PLAN_TO_READ: 2, REREADING: 0 },
    scoreRange: [6.0, 9.5],
    scoreBias: 1.0,
    favoriteRate: 0.15,
    reviewChance: 0.15,
  },
  {
    key: 'romance_fan',
    readerClass: 'Heart Seeker',
    primaryGenres: ['romance', 'drama'],
    secondaryGenres: ['slice-of-life', 'comedy', 'psychological'],
    tropes: ['romance', 'school', 'female-lead'],
    librarySize: [12, 22],
    statusWeights: { READING: 3, COMPLETED: 4, ON_HOLD: 1, DROPPED: 1, PLAN_TO_READ: 2, REREADING: 1 },
    scoreRange: [5.0, 10.0],
    scoreBias: 1.5,
    favoriteRate: 0.25,
    reviewChance: 0.20,
  },
  {
    key: 'isekai_obsessed',
    readerClass: 'Dimension Walker',
    primaryGenres: ['fantasy', 'adventure'],
    secondaryGenres: ['action', 'romance', 'comedy'],
    tropes: ['isekai', 'reincarnation', 'regression', 'system'],
    librarySize: [18, 30],
    statusWeights: { READING: 5, COMPLETED: 2, ON_HOLD: 2, DROPPED: 1, PLAN_TO_READ: 3, REREADING: 0 },
    scoreRange: [5.5, 9.0],
    scoreBias: 0.5,
    favoriteRate: 0.10,
    reviewChance: 0.10,
  },
  {
    key: 'dark_reader',
    readerClass: 'Shadow Sovereign',
    primaryGenres: ['psychological', 'thriller', 'horror'],
    secondaryGenres: ['drama', 'mystery', 'action'],
    tropes: ['dark', 'revenge', 'villain-mc', 'survival'],
    librarySize: [10, 20],
    statusWeights: { READING: 3, COMPLETED: 3, ON_HOLD: 2, DROPPED: 2, PLAN_TO_READ: 1, REREADING: 0 },
    scoreRange: [4.0, 9.5],
    scoreBias: 0.5,
    favoriteRate: 0.12,
    reviewChance: 0.20,
  },
  {
    key: 'comedy_reader',
    readerClass: 'Vibes Curator',
    primaryGenres: ['comedy', 'slice-of-life'],
    secondaryGenres: ['romance', 'adventure', 'fantasy'],
    tropes: ['comedy', 'school', 'found-family'],
    librarySize: [8, 18],
    statusWeights: { READING: 3, COMPLETED: 2, ON_HOLD: 1, DROPPED: 0, PLAN_TO_READ: 3, REREADING: 1 },
    scoreRange: [6.5, 9.5],
    scoreBias: 1.0,
    favoriteRate: 0.20,
    reviewChance: 0.10,
  },
  {
    key: 'murim_master',
    readerClass: 'Murim Cultivator',
    primaryGenres: ['action', 'adventure'],
    secondaryGenres: ['fantasy', 'drama'],
    tropes: ['murim', 'overpowered-mc', 'revenge', 'underdog'],
    librarySize: [12, 22],
    statusWeights: { READING: 4, COMPLETED: 3, ON_HOLD: 1, DROPPED: 1, PLAN_TO_READ: 2, REREADING: 1 },
    scoreRange: [5.5, 9.5],
    scoreBias: 1.0,
    favoriteRate: 0.15,
    reviewChance: 0.15,
  },
  {
    key: 'casual',
    readerClass: 'Casual Scroller',
    primaryGenres: ['action', 'romance', 'comedy', 'fantasy'],
    secondaryGenres: ['drama', 'slice-of-life', 'adventure'],
    tropes: [],
    librarySize: [5, 12],
    statusWeights: { READING: 2, COMPLETED: 1, ON_HOLD: 1, DROPPED: 1, PLAN_TO_READ: 5, REREADING: 0 },
    scoreRange: [6.0, 8.5],
    scoreBias: 0,
    favoriteRate: 0.05,
    reviewChance: 0.05,
  },
  {
    key: 'completionist',
    readerClass: 'Completionist',
    primaryGenres: ['action', 'fantasy', 'adventure', 'romance'],
    secondaryGenres: ['drama', 'comedy', 'thriller'],
    tropes: [],
    librarySize: [20, 30],
    statusWeights: { READING: 1, COMPLETED: 8, ON_HOLD: 0, DROPPED: 0, PLAN_TO_READ: 1, REREADING: 1 },
    scoreRange: [5.0, 9.5],
    scoreBias: 0.3,
    favoriteRate: 0.10,
    reviewChance: 0.15,
  },
  {
    key: 'binge_reader',
    readerClass: 'Binge Beast',
    primaryGenres: ['action', 'fantasy', 'romance'],
    secondaryGenres: ['adventure', 'drama', 'comedy', 'thriller'],
    tropes: ['system', 'gate-dungeon', 'regression'],
    librarySize: [18, 30],
    statusWeights: { READING: 7, COMPLETED: 1, ON_HOLD: 1, DROPPED: 0, PLAN_TO_READ: 2, REREADING: 0 },
    scoreRange: [6.0, 9.0],
    scoreBias: 0.5,
    favoriteRate: 0.08,
    reviewChance: 0.08,
  },
  {
    key: 'critic',
    readerClass: 'Ink Critic',
    primaryGenres: ['drama', 'psychological', 'thriller', 'romance'],
    secondaryGenres: ['action', 'fantasy', 'comedy', 'horror', 'mystery'],
    tropes: [],
    librarySize: [15, 25],
    statusWeights: { READING: 2, COMPLETED: 5, ON_HOLD: 1, DROPPED: 2, PLAN_TO_READ: 1, REREADING: 0 },
    scoreRange: [2.0, 9.5],
    scoreBias: -0.5,
    favoriteRate: 0.05,
    reviewChance: 0.80,
  },
]

// ═══════════════════════════════════════════════════
// NICKNAMES & BIOS
// ═══════════════════════════════════════════════════

const USERNAMES: Record<string, string[]> = {
  action_junkie: [
    'ShadowHunter99', 'GateBreaker', 'BerserkBlade', 'RaidKingLee', 'DungeonCrusher',
    'ChaosFistKR', 'HunterOfHunters', 'BlitzReaderX', 'SwordSaint77', 'RankUpOrDie',
  ],
  romance_fan: [
    'HeartOfInk', 'RomanceAddict', 'TearDropPage', 'SecondLeadStan', 'ShoujoSunrise',
    'LoveInkStained', 'FlutterPanel', 'ClicheAndProud', 'DramaQueenKR', 'SoftGlowReader',
  ],
  isekai_obsessed: [
    'IsekaiVeteran', 'RebirthReader', 'DimensionHopper', 'SecondLifeStan', 'PortalAddict',
    'RegressedReader', 'NewGamePlusKR', 'TruckKunSurvivor', 'AnotherWorldNow', 'CheatSkillEnjoyer',
  ],
  dark_reader: [
    'NightPanelReader', 'GrimInkDrinker', 'VoidGazer404', 'DarkPageTurner', 'NoirWebtoon',
    'TwistedPlotFan', 'AbyssWatcher', 'ShadowManhwa', 'MidnightBinge', 'CrimsonReader',
  ],
  comedy_reader: [
    'VibeCheckReader', 'LolManhwa', 'PanelClownKR', 'GagReaderOnly', 'ChillAndScroll',
    'FluffyInkLover', 'WeekendVibes42', 'LightReadOnly', 'HappyPanelFan', 'ComfyScroller',
  ],
  murim_master: [
    'MurimMaster', 'QiFlowReader', 'MartialPeakFan', 'SectLeaderKim', 'HeavenlyDemon',
    'MurimCultivator', 'UnbreakableFist', 'InnerQiReader', 'WuxiaLover', 'NamgungReader',
  ],
  casual: [
    'JustBrowsing', 'WebtoonNewbie', 'RandomPicker', 'CasualLee', 'SundayScroller',
    'PageFlipperKR', 'LightReader01', 'WeeklyCheck', 'ChillVibesMh', 'InkSipper',
  ],
  completionist: [
    'AllChaptersDone', 'CompletionKing', 'FinisherKR', 'NoDropGang', 'FullClearReader',
    'LibrarySweeper', 'EndingHunter', 'AllCaughtUp', 'BacklogZero', 'OneHundredPct',
  ],
  binge_reader: [
    'OneMoreChapter', 'BingeKingKR', 'NoSleepReader', 'AllNightScroll', 'ChapterVacuum',
    'PanelSprinter', 'CantStopWontStop', 'SpeedReader99', 'MidnightMarathon', 'SerialBinger',
  ],
  critic: [
    'InkCritic', 'HonestReviewKR', 'PanelAnalyst', 'StoryDissector', 'ScoreKeeperKR',
    'ArtJudge', 'HarshButFair', 'ThreeStarAvg', 'ReviewsFromHell', 'CriticalInk',
  ],
}

const BIO_TEMPLATES: Record<string, string[]> = {
  action_junkie: [
    'Living for the next power-up scene.',
    'If there are no fight panels, I\'m out.',
    'S-Rank reader, E-Rank sleep schedule.',
    'Action manhwa is not a genre, it\'s a lifestyle.',
  ],
  romance_fan: [
    'Here for the slow burn and the butterflies.',
    'Second lead syndrome is a lifestyle.',
    'Will cry over fictional relationships. No regrets.',
    'If the FL is strong, I\'m already hooked.',
  ],
  isekai_obsessed: [
    'Waiting for Truck-kun to send me to another world.',
    'If it has a status window, I\'m reading it.',
    'Regressed 3 times, still reading.',
    'Another isekai? Don\'t mind if I do.',
  ],
  dark_reader: [
    'I like my manhwa like I like my coffee: dark and bitter.',
    'The darker the plot, the brighter my screen.',
    'Psychological damage is a feature, not a bug.',
    'Give me morally grey characters or give me nothing.',
  ],
  comedy_reader: [
    'Just here for the good vibes.',
    'If it makes me laugh, it\'s a 10/10.',
    'Life\'s too short for sad manhwa.',
    'Comedy is an underrated genre and I will die on this hill.',
  ],
  murim_master: [
    'Cultivation is not a hobby, it\'s a way of life.',
    'Heavenly Demon? More like Heavenly Read.',
    'Inner qi flowing, chapters loading.',
    'Mount Hua Sect forever.',
  ],
  casual: [
    'I read sometimes.',
    'Just picking up whatever looks cool.',
    'Recommendations welcome!',
    'No strong opinions, just vibes.',
  ],
  completionist: [
    'If I start it, I finish it. No exceptions.',
    'Backlog at zero. Always.',
    'Dropping a manhwa is not in my vocabulary.',
    'My completion rate is my pride.',
  ],
  binge_reader: [
    'One more chapter... said 47 chapters ago.',
    'Sleep is for people who aren\'t mid-arc.',
    'Started at 11pm. It\'s now 4am. No regrets.',
    'I don\'t read manhwa. I inhale them.',
  ],
  critic: [
    'Someone has to keep standards high.',
    'I rate fairly. You just don\'t like my scores.',
    'Story, art, characters, world — I judge them all.',
    'Honest reviews only. No sugarcoating.',
  ],
}

// ═══════════════════════════════════════════════════
// REVIEW TEMPLATES
// ═══════════════════════════════════════════════════

const REVIEW_HIGH = [
  'Absolute masterpiece. The art alone is worth it.',
  'Cannot put this down. Best thing I\'ve read this year.',
  'Peak manhwa. Everything just clicks.',
  'The character development in this is insane.',
  'Art is gorgeous, story keeps getting better.',
  'Genuinely surprised how good this is.',
  'This deserves way more readers.',
  'S-tier. No notes.',
  'The worldbuilding is phenomenal.',
  'Every chapter is a banger.',
  'One of the few manhwa where every arc delivers.',
  'The art style perfectly matches the tone. Chef\'s kiss.',
]

const REVIEW_MID = [
  'Decent read, nothing groundbreaking.',
  'Good art, story is a bit generic.',
  'Started strong but lost steam around chapter 30.',
  'Enjoyable if you like the genre, otherwise skip.',
  'Has potential but needs better pacing.',
  'Solid B-tier. Not bad, not amazing.',
  'The premise is great, execution is mid.',
  'Worth reading if you have nothing else.',
  'Some interesting ideas buried under cliches.',
  'Fun but forgettable.',
  'Art carries an otherwise average story.',
  'It\'s fine. Just... fine.',
]

const REVIEW_LOW = [
  'Dropped. The writing is painful.',
  'Generic power fantasy #4729.',
  'Art carries an otherwise empty story.',
  'I tried. I really tried. But no.',
  'How does this have so many readers?',
  'The pacing is all over the place.',
  'Characters have the depth of a puddle.',
  'Not for me. At all.',
  'Started promising, became unbearable.',
  'I want those hours of my life back.',
]

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFloat(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function round1(val: number): number {
  return Math.round(val * 10) / 10
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function dedupe(manhwas: ManhwaRow[]): ManhwaRow[] {
  const seen = new Set<string>()
  return manhwas.filter((m) => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })
}

function pickWeightedStatus(weights: Record<ReadingStatus, number>): ReadingStatus {
  const entries = Object.entries(weights) as [ReadingStatus, number][]
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let roll = Math.random() * total
  for (const [status, weight] of entries) {
    roll -= weight
    if (roll <= 0) return status
  }
  return 'PLAN_TO_READ'
}

// ═══════════════════════════════════════════════════
// PHASE 1: LOAD MANHWA
// ═══════════════════════════════════════════════════

async function loadManhwaIndex() {
  const allManhwa = await prisma.manhwa.findMany({
    where: { is_published: true },
    select: {
      id: true,
      slug: true,
      title_en: true,
      status: true,
      chapter_count: true,
      genre_links: { select: { genre: { select: { slug: true } } } },
      trope_links: { select: { trope: { select: { slug: true } } } },
    },
  })

  const genreIndex = new Map<string, ManhwaRow[]>()
  const tropeIndex = new Map<string, ManhwaRow[]>()

  for (const m of allManhwa) {
    for (const gl of m.genre_links) {
      const slug = gl.genre.slug
      if (!genreIndex.has(slug)) genreIndex.set(slug, [])
      genreIndex.get(slug)!.push(m)
    }
    for (const tl of m.trope_links) {
      const slug = tl.trope.slug
      if (!tropeIndex.has(slug)) tropeIndex.set(slug, [])
      tropeIndex.get(slug)!.push(m)
    }
  }

  return { allManhwa, genreIndex, tropeIndex }
}

// ═══════════════════════════════════════════════════
// PHASE 2: GENERATE USERS
// ═══════════════════════════════════════════════════

function generateUsers(): SeedUserDef[] {
  const users: SeedUserDef[] = []

  for (const archetype of ARCHETYPES) {
    const names = USERNAMES[archetype.key] ?? []
    const bios = BIO_TEMPLATES[archetype.key] ?? []

    for (let i = 0; i < names.length; i++) {
      const username = names[i]!
      // 2 French users per archetype (indices 8 and 9)
      const locale = i >= 8 ? 'fr' as const : 'en' as const

      users.push({
        username,
        displayName: username.replace(/([A-Z])/g, ' $1').trim().replace(/\d+/g, '').trim() || username,
        bio: pick(bios!),
        locale,
        archetype,
      })
    }
  }

  return users
}

// ═══════════════════════════════════════════════════
// PHASE 3: GENERATE LIBRARY ENTRIES
// ═══════════════════════════════════════════════════

function selectManhwaForUser(
  archetype: Archetype,
  genreIndex: Map<string, ManhwaRow[]>,
  tropeIndex: Map<string, ManhwaRow[]>,
  allManhwa: ManhwaRow[],
): ManhwaRow[] {
  const [minSize, maxSize] = archetype.librarySize
  const targetCount = randInt(minSize, maxSize)
  const selected = new Set<string>()
  const result: ManhwaRow[] = []

  const addManhwa = (m: ManhwaRow) => {
    if (selected.has(m.id)) return false
    selected.add(m.id)
    result.push(m)
    return true
  }

  // 60% from primary genres (prefer those matching tropes)
  const primaryTarget = Math.ceil(targetCount * 0.6)
  const primaryPool = shuffle(
    dedupe(archetype.primaryGenres.flatMap((g) => genreIndex.get(g) ?? []))
  )
  // Sort: trope matches first
  if (archetype.tropes.length > 0) {
    primaryPool.sort((a, b) => {
      const aMatch = a.trope_links.filter((tl) => archetype.tropes.includes(tl.trope.slug)).length
      const bMatch = b.trope_links.filter((tl) => archetype.tropes.includes(tl.trope.slug)).length
      return bMatch - aMatch
    })
  }
  for (const m of primaryPool) {
    if (result.length >= primaryTarget) break
    addManhwa(m)
  }

  // 25% from secondary genres
  const secondaryTarget = result.length + Math.ceil(targetCount * 0.25)
  const secondaryPool = shuffle(
    dedupe(archetype.secondaryGenres.flatMap((g) => genreIndex.get(g) ?? []))
      .filter((m) => !selected.has(m.id))
  )
  for (const m of secondaryPool) {
    if (result.length >= secondaryTarget) break
    addManhwa(m)
  }

  // 15% wildcard
  const wildcardPool = shuffle(allManhwa.filter((m) => !selected.has(m.id)))
  for (const m of wildcardPool) {
    if (result.length >= targetCount) break
    addManhwa(m)
  }

  return result
}

function generateScore(
  archetype: Archetype,
  manhwa: ManhwaRow,
  status: ReadingStatus,
): number | null {
  if (status === 'PLAN_TO_READ') return null
  if (status === 'ON_HOLD' && Math.random() > 0.3) return null
  if (status === 'READING' && Math.random() > 0.6) return null

  const [min, max] = archetype.scoreRange
  let base = randFloat(min, max)

  const matchesPrimary = manhwa.genre_links.some((gl) =>
    archetype.primaryGenres.includes(gl.genre.slug)
  )
  if (matchesPrimary) base += archetype.scoreBias

  if (status === 'DROPPED') base -= 2.0 + Math.random() * 1.5

  return round1(clamp(base, 1.0, 10.0))
}

function generateProgress(status: ReadingStatus, chapterCount: number | null): number {
  const total = chapterCount ?? 100
  switch (status) {
    case 'COMPLETED':
    case 'REREADING':
      return total
    case 'READING':
      return Math.floor(total * (0.1 + Math.random() * 0.8))
    case 'ON_HOLD':
      return Math.floor(total * (0.2 + Math.random() * 0.5))
    case 'DROPPED':
      return Math.floor(total * (0.05 + Math.random() * 0.3))
    case 'PLAN_TO_READ':
      return 0
  }
}

function generateDates(status: ReadingStatus) {
  const now = Date.now()
  const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000
  const created = new Date(sixMonthsAgo + Math.random() * (now - sixMonthsAgo))

  const started = status !== 'PLAN_TO_READ' ? created : null
  const completed =
    status === 'COMPLETED' || status === 'REREADING'
      ? new Date(created.getTime() + Math.random() * (now - created.getTime()))
      : null

  return { started_at: started, completed_at: completed, created_at: created, updated_at: created }
}

function buildLibraryEntries(
  userMap: Map<string, { id: string; archetype: Archetype }>,
  genreIndex: Map<string, ManhwaRow[]>,
  tropeIndex: Map<string, ManhwaRow[]>,
  allManhwa: ManhwaRow[],
): { entries: Prisma.UserLibraryCreateManyInput[]; userManhwa: Map<string, { manhwaId: string; score: number | null }[]> } {
  const entries: Prisma.UserLibraryCreateManyInput[] = []
  const userManhwa = new Map<string, { manhwaId: string; score: number | null }[]>()

  for (const [username, { id: userId, archetype }] of userMap) {
    const manhwas = selectManhwaForUser(archetype, genreIndex, tropeIndex, allManhwa)
    const userEntries: { manhwaId: string; score: number | null }[] = []

    for (const m of manhwas) {
      const status = pickWeightedStatus(archetype.statusWeights)
      const score = generateScore(archetype, m, status)
      const progress = generateProgress(status, m.chapter_count)
      const isFavorite = status === 'COMPLETED' && Math.random() < archetype.favoriteRate
      const dates = generateDates(status)

      entries.push({
        user_id: userId,
        manhwa_id: m.id,
        status,
        score,
        progress,
        is_favorite: isFavorite,
        started_at: dates.started_at,
        completed_at: dates.completed_at,
        created_at: dates.created_at,
        updated_at: dates.updated_at,
      })

      userEntries.push({ manhwaId: m.id, score })
    }

    userManhwa.set(username, userEntries)
  }

  return { entries, userManhwa }
}

// ═══════════════════════════════════════════════════
// PHASE 4: GENERATE REVIEWS
// ═══════════════════════════════════════════════════

function generateSubScores(mainScore: number) {
  const vary = () => round1(clamp(mainScore + (Math.random() - 0.5) * 3, 1, 10))
  return {
    score_story: vary(),
    score_art: vary(),
    score_characters: vary(),
    score_world: vary(),
  }
}

function buildReviews(
  userMap: Map<string, { id: string; archetype: Archetype }>,
  userManhwa: Map<string, { manhwaId: string; score: number | null }[]>,
): Prisma.ReviewCreateManyInput[] {
  const reviews: Prisma.ReviewCreateManyInput[] = []

  for (const [username, { id: userId, archetype }] of userMap) {
    if (Math.random() > archetype.reviewChance) continue

    const entries = userManhwa.get(username) ?? []
    const scoredEntries = entries.filter((e) => e.score !== null)
    if (scoredEntries.length === 0) continue

    const reviewCount = archetype.key === 'critic' ? randInt(2, 4) : randInt(1, 2)
    const toReview = shuffle(scoredEntries).slice(0, reviewCount)

    for (const entry of toReview) {
      const score = entry.score!
      let content: string
      if (score >= 8) content = pick(REVIEW_HIGH)
      else if (score >= 5) content = pick(REVIEW_MID)
      else content = pick(REVIEW_LOW)

      const isCritic = archetype.key === 'critic'
      const subScores = isCritic ? generateSubScores(score) : {}

      const now = Date.now()
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000
      const reviewDate = new Date(oneMonthAgo + Math.random() * (now - oneMonthAgo))

      reviews.push({
        user_id: userId,
        manhwa_id: entry.manhwaId,
        content,
        score,
        is_micro: true,
        has_spoilers: false,
        ...subScores,
        created_at: reviewDate,
        updated_at: reviewDate,
      })
    }
  }

  return reviews
}

// ═══════════════════════════════════════════════════
// PHASE 5: GENERATE FOLLOWS
// ═══════════════════════════════════════════════════

function buildFollows(
  userMap: Map<string, { id: string; archetype: Archetype }>,
): Prisma.FollowCreateManyInput[] {
  const follows: Prisma.FollowCreateManyInput[] = []
  const allUsers = [...userMap.entries()]
  const seen = new Set<string>()

  for (const [, { id: followerId, archetype }] of allUsers) {
    const followCount = randInt(3, 10)

    // Bias: 60% same archetype, 40% random
    const sameArchetype = allUsers.filter(
      ([, u]) => u.archetype.key === archetype.key && u.id !== followerId
    )
    const otherUsers = allUsers.filter(
      ([, u]) => u.archetype.key !== archetype.key
    )

    const targets: string[] = []
    const sameTarget = Math.ceil(followCount * 0.6)

    for (const [, u] of shuffle(sameArchetype).slice(0, sameTarget)) {
      targets.push(u.id)
    }
    for (const [, u] of shuffle(otherUsers).slice(0, followCount - targets.length)) {
      targets.push(u.id)
    }

    for (const followingId of targets) {
      const key = `${followerId}:${followingId}`
      if (seen.has(key) || followerId === followingId) continue
      seen.add(key)
      follows.push({ follower_id: followerId, following_id: followingId })
    }
  }

  return follows
}

// ═══════════════════════════════════════════════════
// PHASE 6: RECALCULATE COUNTERS
// ═══════════════════════════════════════════════════

async function recalculateManhwaCounters(manhwaId: string) {
  const [readerCount, scores, favoriteCount, reviewCount] = await Promise.all([
    prisma.userLibrary.count({ where: { manhwa_id: manhwaId } }),
    prisma.userLibrary.findMany({
      where: { manhwa_id: manhwaId, score: { not: null } },
      select: { score: true },
    }),
    prisma.userLibrary.count({ where: { manhwa_id: manhwaId, is_favorite: true } }),
    prisma.review.count({ where: { manhwa_id: manhwaId, deleted_at: null } }),
  ])

  const scoreValues = scores.map((s) => s.score!).filter((s) => s > 0)
  const scoreCount = scoreValues.length
  const scoreAvg =
    scoreCount > 0 ? scoreValues.reduce((a, b) => a + b, 0) / scoreCount : null
  const scoreStddev =
    scoreCount > 1
      ? Math.sqrt(
          scoreValues.reduce((sum, s) => sum + Math.pow(s - scoreAvg!, 2), 0) / (scoreCount - 1)
        )
      : null
  const scorePositiveRate =
    scoreCount > 0 ? scoreValues.filter((s) => s >= 7).length / scoreCount : null

  await prisma.manhwa.update({
    where: { id: manhwaId },
    data: {
      reader_count: readerCount,
      score_count: scoreCount,
      score_avg: scoreAvg,
      score_stddev: scoreStddev,
      score_positive_rate: scorePositiveRate,
      favorite_count: favoriteCount,
      review_count: reviewCount,
    },
  })
}

async function batchRecalculate(manhwaIds: Set<string>) {
  const ids = [...manhwaIds]
  const BATCH_SIZE = 20
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map((id) => recalculateManhwaCounters(id)))
    process.stdout.write(`\r  [seed] Recalculated ${Math.min(i + BATCH_SIZE, ids.length)}/${ids.length}`)
  }
  console.log()
}

async function updateUserStats(userIds: string[]) {
  for (const userId of userIds) {
    const [completedCount, totalChapters] = await Promise.all([
      prisma.userLibrary.count({ where: { user_id: userId, status: 'COMPLETED' } }),
      prisma.userLibrary.aggregate({ where: { user_id: userId }, _sum: { progress: true } }),
    ])

    await prisma.user.update({
      where: { id: userId },
      data: {
        total_manhwas_completed: completedCount,
        total_chapters_read: totalChapters._sum.progress ?? 0,
      },
    })
  }
}

// ═══════════════════════════════════════════════════
// CLEANUP
// ═══════════════════════════════════════════════════

async function cleanSeedData() {
  console.log('[seed] Cleaning previous seed data...')

  const seedUserWhere = { user: { email: { endsWith: '@seed.manhwabox.dev' } } }

  // Delete in correct order (FK constraints)
  await prisma.reviewReaction.deleteMany({ where: seedUserWhere })
  await prisma.reviewLike.deleteMany({ where: seedUserWhere })
  await prisma.review.deleteMany({ where: seedUserWhere })
  await prisma.userLibrary.deleteMany({ where: seedUserWhere })
  await prisma.follow.deleteMany({ where: { follower: { email: { endsWith: '@seed.manhwabox.dev' } } } })
  await prisma.follow.deleteMany({ where: { following: { email: { endsWith: '@seed.manhwabox.dev' } } } })

  // Delete accounts and sessions (Auth.js tables)
  await prisma.account.deleteMany({ where: { user: { email: { endsWith: '@seed.manhwabox.dev' } } } })
  await prisma.session.deleteMany({ where: { user: { email: { endsWith: '@seed.manhwabox.dev' } } } })

  await prisma.user.deleteMany({ where: { email: { endsWith: '@seed.manhwabox.dev' } } })

  console.log('[seed] Cleaned.')
}

// ═══════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════

export async function seedUsers() {
  // Phase 0: Clean
  await cleanSeedData()

  // Phase 1: Load manhwa
  const { allManhwa, genreIndex, tropeIndex } = await loadManhwaIndex()
  console.log(`[seed] Loaded ${allManhwa.length} manhwa`)

  if (allManhwa.length === 0) {
    throw new Error('No manhwa in database. Run the AniList bootstrap first.')
  }

  // Phase 2: Generate & insert users
  const seedUserDefs = generateUsers()
  await prisma.user.createMany({
    data: seedUserDefs.map((u) => ({
      email: `${u.username.toLowerCase()}@seed.manhwabox.dev`,
      name: u.displayName,
      username: u.username,
      display_name: u.displayName,
      bio: u.bio,
      locale: u.locale,
      reader_class: u.archetype.readerClass,
    })),
    skipDuplicates: true,
  })

  const createdUsers = await prisma.user.findMany({
    where: { email: { endsWith: '@seed.manhwabox.dev' } },
    select: { id: true, username: true },
  })
  console.log(`[seed] Created ${createdUsers.length} users`)

  // Build lookup: username → { id, archetype }
  const userMap = new Map<string, { id: string; archetype: Archetype }>()
  for (const u of createdUsers) {
    const def = seedUserDefs.find((d) => d.username === u.username)
    if (def) userMap.set(u.username!, { id: u.id, archetype: def.archetype })
  }

  // Phase 3: Library entries
  const { entries, userManhwa } = buildLibraryEntries(userMap, genreIndex, tropeIndex, allManhwa)
  await prisma.userLibrary.createMany({ data: entries, skipDuplicates: true })
  console.log(`[seed] Created ${entries.length} library entries`)

  // Phase 4: Reviews
  const reviews = buildReviews(userMap, userManhwa)
  await prisma.review.createMany({ data: reviews, skipDuplicates: true })
  console.log(`[seed] Created ${reviews.length} reviews`)

  // Phase 5: Follows
  const follows = buildFollows(userMap)
  await prisma.follow.createMany({ data: follows, skipDuplicates: true })
  console.log(`[seed] Created ${follows.length} follow relationships`)

  // Phase 6: Recalculate counters
  const affectedManhwaIds = new Set(entries.map((e) => e.manhwa_id))
  await batchRecalculate(affectedManhwaIds)

  // Phase 7: Update user stats
  console.log('[seed] Updating user stats...')
  await updateUserStats(createdUsers.map((u) => u.id))

  return {
    usersCreated: createdUsers.length,
    libraryEntries: entries.length,
    reviews: reviews.length,
    follows: follows.length,
    manhwaRecalculated: affectedManhwaIds.size,
  }
}
