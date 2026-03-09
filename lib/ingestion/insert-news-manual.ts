/**
 * Manual news insertion — run with: npx tsx lib/ingestion/insert-news-manual.ts
 * Articles written by ManhwaVerse editorial (Claude Code) based on real industry events.
 * Each article is an original synthesis/editorial, not a 1:1 rewrite.
 */

import { prisma } from '../db/client'

function buildSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

async function findManhwaIds(titles: string[]): Promise<string[]> {
  if (!titles.length) return []
  const results = await prisma.manhwa.findMany({
    where: {
      OR: titles.map((t) => ({ title_en: { contains: t, mode: 'insensitive' as const } })),
      is_published: true,
    },
    select: { id: true },
    take: 8,
  })
  return results.map((r) => r.id)
}

async function insertArticle(data: {
  title_en: string
  title_fr: string
  content_en: string
  content_fr: string
  excerpt_en: string
  excerpt_fr: string
  reading_time: number
  source_url: string
  published_at: Date
  manhwa_keywords: string[]
}) {
  const existing = await prisma.article.findUnique({ where: { source_url: data.source_url } })
  if (existing) {
    console.log(`  ⚠ Skipped (duplicate): ${data.title_en}`)
    return
  }

  let slug = buildSlug(data.title_en)
  const slugExists = await prisma.article.findUnique({ where: { slug } })
  if (slugExists) slug = `${slug}-${Date.now()}`

  const manhwaIds = await findManhwaIds(data.manhwa_keywords)

  await prisma.article.create({
    data: {
      slug,
      title_en:    data.title_en,
      title_fr:    data.title_fr,
      content_en:  data.content_en,
      content_fr:  data.content_fr,
      excerpt_en:  data.excerpt_en.slice(0, 499),
      excerpt_fr:  data.excerpt_fr.slice(0, 499),
      category:    'NEWS',
      status:      'PUBLISHED',
      published_at: data.published_at,
      author_name: 'ManhwaVerse Editorial',
      reading_time: data.reading_time,
      source_url:  data.source_url,
      manhwa_links: manhwaIds.length > 0
        ? { create: manhwaIds.map((manhwa_id) => ({ manhwa_id })) }
        : undefined,
    },
  })
  console.log(`  ✓ Inserted: ${data.title_en}`)
}

const ARTICLES = [

  // ── Article 1 — World Webtoon Festival 2025 ──────────────────────────────────
  {
    title_en: "Seoul Celebrates: The 2025 World Webtoon Festival Marks a Culture Coming of Age",
    title_fr: "Seoul fête le manhwa : le World Webtoon Festival 2025 consacre une culture en pleine maturité",
    excerpt_en: "Four days, one city, and an entire industry gathered in Seoul. The 2025 World Webtoon Festival signaled that manhwa is no longer a niche — it's a global institution.",
    excerpt_fr: "Quatre jours, une ville, toute une industrie réunie à Seoul. Le World Webtoon Festival 2025 confirme que le manhwa n'est plus une niche — c'est une institution mondiale.",
    reading_time: 3,
    published_at: new Date('2025-10-21T11:00:00Z'),
    source_url: 'news:world-webtoon-festival-2025:20251021',
    manhwa_keywords: ['Solo Leveling', 'Tower of God', 'True Beauty'],
    content_en: `
From October 19 to 22, Seoul hosted the **2025 World Webtoon Festival** — a four-day celebration of the medium that Korea invented and the world adopted. What started a decade ago as a domestic promotional event has grown into something more consequential: a gathering point for publishers, creators, licensors, and fans from across the globe.

## More Than a Convention

The festival isn't an anime expo or a book fair. It sits at its own intersection: part industry summit, part fan celebration, part diplomatic soft power. Korean officials have made no secret that they view webtoons as a cultural export on par with K-pop and K-drama — and the festival's programming reflects that ambition, with panels on international licensing, adaptation pipelines, and creator economies.

## The Numbers Behind the Party

The timing matters. The global webtoon market is now valued at roughly **$9.7 billion**, with projections pushing it past $12 billion by 2026. Korea's domestic market, meanwhile, has hit a consolidation phase — platforms are rationalizing after years of hyper-growth. The festival arrives at a moment of transition: the initial explosion is over; the industry is now figuring out what sustainable looks like.

## What It Means for Readers

For fans outside Korea, the festival offers the most visible annual proof that manhwa is being taken seriously at every level of the industry. Licensing deals get announced. Adaptations get confirmed. Creators become recognizable faces. The distance between a panel on Naver and a seat at a Seoul convention shrinks a little more each year.

The webtoon is no longer a curiosity. It's a format with a festival.
    `.trim(),
    content_fr: `
Du 19 au 22 octobre, Seoul a accueilli le **World Webtoon Festival 2025** — quatre jours de célébration du medium que la Corée a inventé et que le monde entier a adopté. Ce qui était, il y a dix ans, un simple événement promotionnel national est devenu quelque chose de bien plus important : un point de convergence pour les éditeurs, les créateurs, les licenseurs et les fans du monde entier.

## Plus qu'une convention

Le festival ne ressemble ni à une expo d'anime ni à un salon du livre. Il occupe sa propre intersection : mi-sommet professionnel, mi-célébration de fans, mi-instrument de soft power culturel. Les autorités coréennes ne cachent pas que le webtoon est considéré comme une exportation culturelle comparable à la K-pop et aux K-dramas — et la programmation du festival reflète cette ambition, avec des tables rondes sur les licences internationales, les pipelines d'adaptation et les économies créatives.

## Les chiffres derrière la fête

Le moment n'est pas anodin. Le marché mondial du webtoon est aujourd'hui valorisé à environ **9,7 milliards de dollars**, avec des projections dépassant les 12 milliards en 2026. Le marché intérieur coréen, lui, est entré dans une phase de consolidation — les plateformes rationalisent après des années de croissance explosive. Le festival arrive à un moment de transition : l'explosion initiale est derrière nous ; l'industrie cherche maintenant à définir ce que la durabilité signifie.

## Ce que ça signifie pour les lecteurs

Pour les fans hors de Corée, le festival offre la preuve annuelle la plus visible que le manhwa est pris au sérieux à tous les niveaux de l'industrie. Des accords de licence sont annoncés. Des adaptations sont confirmées. Les créateurs deviennent des visages reconnus. La distance entre un panel sur Naver et une place dans une convention à Seoul se réduit un peu plus chaque année.

Le webtoon n'est plus une curiosité. C'est un format qui a son propre festival.
    `.trim(),
  },

  // ── Article 2 — WEBTOON Translate shutdown ───────────────────────────────────
  {
    title_en: "WEBTOON Translate Is Shutting Down — What It Means for Global Readers",
    title_fr: "WEBTOON Translate ferme ses portes : ce que ça change pour les lecteurs du monde entier",
    excerpt_en: "Naver's official fan-translation platform goes dark on November 26. For thousands of international readers, it's the end of a bridge — and a reminder of how fragile free access to manhwa can be.",
    excerpt_fr: "La plateforme officielle de traduction participative de Naver s'éteint le 26 novembre. Pour des milliers de lecteurs, c'est la fin d'un pont — et un rappel de la fragilité de l'accès gratuit au manhwa.",
    reading_time: 3,
    published_at: new Date('2025-11-28T09:30:00Z'),
    source_url: 'news:webtoon-translate-shutdown:20251128',
    manhwa_keywords: [],
    content_en: `
On November 26, Naver's subsidiary **Webtoon Entertainment** shut down **WEBTOON Translate**, the official platform that allowed volunteer translators to localize manhwa and webtoons into dozens of languages. The closure ends a chapter that was uniquely important for international fans — particularly those in smaller markets where official translations rarely arrive.

## What WEBTOON Translate Was

Launched years ago as a way to accelerate global reach without the overhead of professional translation teams, WEBTOON Translate was a structured volunteer program. Fans applied to translate specific series, Naver retained editorial oversight, and approved translations were published directly on the platform — officially, legally, with creator knowledge.

It wasn't fansubbing. It was something rarer: a corporation genuinely partnering with its community to solve a localization bottleneck.

## Why It's Closing

No official reason beyond vague "strategic shifts" was given. The likely reality: as WEBTOON Entertainment pursues professional localization deals — and as its Nasdaq listing demands tighter margin control — volunteer labor becomes harder to manage legally and reputationally. The company is professionalizing. That process has costs.

## Who It Hurts

The impact falls hardest on readers in markets like Eastern Europe, Southeast Asia, and Latin America, where platform licensing is thin and volunteer translations were often the only route to content. Official translations in those regions will now lag further behind — or not come at all.

## The Bigger Picture

WEBTOON Translate's closure is a reminder that international manhwa access still depends heavily on corporate decisions made in Seoul and Los Angeles. For platforms to truly go global, the infrastructure of access needs to catch up with the appetite for content.
    `.trim(),
    content_fr: `
Le 26 novembre, la filiale de Naver **Webtoon Entertainment** a fermé **WEBTOON Translate**, la plateforme officielle qui permettait aux traducteurs bénévoles de localiser des manhwas et des webtoons dans des dizaines de langues. La fermeture met fin à un chapitre qui était particulièrement important pour les fans internationaux — notamment ceux des marchés plus petits où les traductions officielles arrivent rarement.

## Ce qu'était WEBTOON Translate

Lancé il y a plusieurs années comme moyen d'accélérer la portée mondiale sans les coûts d'équipes de traduction professionnelles, WEBTOON Translate était un programme bénévole structuré. Les fans postulaient pour traduire des séries spécifiques, Naver conservait la supervision éditoriale, et les traductions approuvées étaient publiées directement sur la plateforme — officiellement, légalement, avec la connaissance des créateurs.

Ce n'était pas du fansub. C'était quelque chose de plus rare : une entreprise qui s'associait genuinement à sa communauté pour résoudre un goulot d'étranglement de la localisation.

## Pourquoi ça ferme

Aucune raison officielle au-delà de vagues "recentrages stratégiques" n'a été communiquée. La réalité probable : alors que WEBTOON Entertainment poursuit des accords de localisation professionnels — et que sa cotation au Nasdaq exige un contrôle plus strict des marges — le travail bénévole devient plus difficile à gérer légalement et en termes de réputation. L'entreprise se professionnalise. Ce processus a un coût.

## Qui en souffre

L'impact tombe le plus durement sur les lecteurs des marchés comme l'Europe de l'Est, l'Asie du Sud-Est et l'Amérique latine, où les licences de plateforme sont rares et où les traductions bénévoles étaient souvent la seule voie d'accès au contenu. Les traductions officielles dans ces régions vont maintenant prendre encore plus de retard — ou ne viendront pas du tout.

## La vision d'ensemble

La fermeture de WEBTOON Translate rappelle que l'accès international au manhwa dépend encore largement de décisions d'entreprise prises à Seoul et Los Angeles. Pour que les plateformes deviennent vraiment mondiales, l'infrastructure d'accès doit rattraper l'appétit pour le contenu.
    `.trim(),
  },

  // ── Article 3 — WEBTOON goes Hollywood ──────────────────────────────────────
  {
    title_en: "WEBTOON Goes Hollywood: Disney, Marvel, Warner Bros. Deals Signal a Turning Point",
    title_fr: "WEBTOON s'invite à Hollywood : les accords Disney, Marvel et Warner Bros. marquent un tournant",
    excerpt_en: "WEBTOON signed partnerships with Disney, Marvel, and Warner Bros. in 2025. The platform isn't just distributing manhwa anymore — it's positioning itself at the center of IP development.",
    excerpt_fr: "WEBTOON a signé des partenariats avec Disney, Marvel et Warner Bros. en 2025. La plateforme ne distribue plus seulement du manhwa — elle se positionne au cœur du développement d'IP.",
    reading_time: 3,
    published_at: new Date('2025-12-10T14:15:00Z'),
    source_url: 'news:webtoon-hollywood-partnerships:20251210',
    manhwa_keywords: [],
    content_en: `
Two deals signed in 2025 tell you everything about where WEBTOON Entertainment thinks it's going.

First, an **August partnership with Disney** brought Marvel, 20th Century Studios, and Star Wars content to the WEBTOON platform in vertical scroll format — with original webcomics also in development. Then came a deal with **Warner Bros. Animation** to co-produce 10 fan-favorite WEBTOON series for global distribution.

Read those twice. An app that started as a place for Korean creators to publish manhwa is now co-producing with Warner Bros. and hosting Star Wars comics.

## The Platform Play

What WEBTOON is building isn't a comic platform in the traditional sense. It's an IP pipeline — a place where a series can be born, find an audience, and get flagged for adaptation before anyone needs to write a pilot. The vertical scroll format is the UI; the real product is the data on what readers engage with.

Disney and Warner Bros. aren't on WEBTOON because they love manhwa. They're there because WEBTOON has demonstrated it can find and develop properties with proven audience demand.

## The "Cuts" Factor

In September, WEBTOON also launched **Cuts** — a short-form animated video feature letting creators and fans produce brief animated clips from existing series. It's a TikTok-adjacent play, extending manhwa content into formats the algorithm rewards.

## What's at Stake

For Korean and independent creators on WEBTOON, these partnerships carry weight in both directions. The platform's rise in legitimacy brings exposure. But as Hollywood money enters the building, the question of whose creative interests get prioritized becomes more urgent — not less.

WEBTOON is no longer just a reading app. It's in the IP business now.
    `.trim(),
    content_fr: `
Deux accords signés en 2025 disent tout sur les ambitions de WEBTOON Entertainment.

D'abord, un **partenariat en août avec Disney** a amené du contenu Marvel, 20th Century Studios et Star Wars sur la plateforme WEBTOON en format défilement vertical — avec des webtoons originaux également en développement. Puis est venu un accord avec **Warner Bros. Animation** pour co-produire 10 séries WEBTOON pour une distribution mondiale.

Relisez ça. Une appli qui a commencé comme un espace pour les créateurs coréens est désormais en co-production avec Warner Bros. et héberge des comics Star Wars.

## Le jeu de la plateforme

Ce que WEBTOON est en train de construire n'est pas une plateforme de comics au sens traditionnel. C'est un pipeline IP — un endroit où une série peut naître, trouver un public, et être identifiée pour une adaptation avant même qu'un pilote soit écrit. Le format défilement vertical est l'interface ; le vrai produit, ce sont les données sur ce qui engage les lecteurs.

Disney et Warner Bros. ne sont pas sur WEBTOON parce qu'ils aiment le manhwa. Ils y sont parce que WEBTOON a démontré qu'il peut trouver et développer des propriétés avec une demande d'audience prouvée.

## Le facteur "Cuts"

En septembre, WEBTOON a également lancé **Cuts** — une fonctionnalité vidéo animée en format court permettant aux créateurs et aux fans de produire de brèves clips animées à partir de séries existantes. C'est un mouvement adjacent à TikTok, qui étend le contenu manhwa vers les formats que l'algorithme récompense.

## Ce qui est en jeu

Pour les créateurs coréens et indépendants sur WEBTOON, ces partenariats pèsent dans les deux sens. La montée en légitimité de la plateforme apporte de l'exposition. Mais avec l'entrée de l'argent hollywoodien, la question de savoir quels intérêts créatifs sont prioritaires devient plus urgente — pas moins.

WEBTOON n'est plus seulement une application de lecture. C'est désormais dans le business de l'IP.
    `.trim(),
  },

  // ── Article 4 — 2026 manhwa anime wave ──────────────────────────────────────
  {
    title_en: "2026 Is the Year of the Manhwa Anime: ORV, Tomb Raider King, and the Adaptation Flood",
    title_fr: "2026 : l'année de l'anime manhwa — ORV, Tomb Raider King et le raz-de-marée des adaptations",
    excerpt_en: "Omniscient Reader's Viewpoint. Tomb Raider King. True Beauty Season 2. The 2026 anime slate for manhwa adaptations is the biggest in history — and the pressure is enormous.",
    excerpt_fr: "Omniscient Reader's Viewpoint. Tomb Raider King. True Beauty Saison 2. Le programme anime 2026 pour les adaptations de manhwa est le plus ambitieux de l'histoire — et la pression est immense.",
    reading_time: 4,
    published_at: new Date('2026-01-20T10:00:00Z'),
    source_url: 'news:manhwa-anime-wave-2026:20260120',
    manhwa_keywords: ['Omniscient Reader', 'Tomb Raider King', 'True Beauty', 'Solo Leveling', 'Tower of God', 'The Boxer'],
    content_en: `
If 2024 was the year Solo Leveling proved manhwa could anchor a premium anime production, then 2026 is the year the industry tests whether that was a fluke or a formula.

The slate of manhwa anime adaptations confirmed for 2026 is the largest in the medium's history. Here's what's incoming — and what's at stake.

## The Big Three

**Omniscient Reader's Viewpoint** arrives in Spring 2026 with a confirmed 24-episode first season. ORV is arguably the most beloved ongoing manhwa globally — a self-referential, structurally inventive story that has built one of the most passionate fanbases in the medium. The adaptation pressure is real: ORV readers are *extremely* invested in how this is handled.

**Tomb Raider King** is eyeing a summer 2026 release, with Japanese dubbing already confirmed — a signal of serious distribution intent. Creator SAN.G. has been involved in the production. The series blends dungeon-raiding action with light novel energy.

**True Beauty Season 2**, announced in early 2025, is moving toward a mid-2026 window. The first season was a modest success; the second has a cleaner production roadmap and a fanbase that has spent years waiting.

## The Supporting Cast

*The Boxer* (Studio MIR) came in late 2025 — a psychological sports thriller that almost defies genre. *Dark Moon: The Lost Altar* hit Crunchyroll in January with an ENHYPEN tie-in that blurs the line between anime and K-pop merchandise. *Terror Man* aired on TVLing in January 2026.

## Why This Moment Matters

The manhwa-to-anime pipeline is still being built in real-time. Each adaptation either deepens trust with anime studios and streaming platforms, or damages it. ORV, in particular, will set a benchmark — not just for how one series is adapted, but for how ambitious the industry is willing to be with manhwa source material.

The flood is here. Now comes the quality test.
    `.trim(),
    content_fr: `
Si 2024 a été l'année où Solo Leveling a prouvé que le manhwa pouvait ancrer une production anime premium, alors 2026 est l'année où l'industrie teste si c'était un accident ou une formule reproductible.

Le programme des adaptations anime de manhwa confirmées pour 2026 est le plus ambitieux de l'histoire du medium. Voici ce qui arrive — et ce qui est en jeu.

## Les trois grands

**Omniscient Reader's Viewpoint** arrive au printemps 2026 avec une première saison de 24 épisodes confirmés. ORV est sans doute le manhwa le plus aimé au monde en ce moment — une histoire autoréférentielle et structurellement inventive qui a construit l'une des communautés les plus passionnées du medium. La pression sur l'adaptation est réelle : les lecteurs d'ORV sont *extrêmement* investis dans la façon dont cela sera traité.

**Tomb Raider King** vise une sortie à l'été 2026, avec un doublage japonais déjà confirmé — un signal d'intentions de distribution sérieuses. Le créateur SAN.G. est impliqué dans la production. La série mélange action de raid de donjon et énergie light novel.

**True Beauty Saison 2**, annoncée début 2025, se dirige vers une fenêtre mi-2026. La première saison a été un succès modeste ; la deuxième dispose d'un plan de production plus clair et d'une fanbase qui attend depuis des années.

## La distribution

*The Boxer* (Studio MIR) est arrivé fin 2025 — un thriller sportif psychologique qui défie presque les genres. *Dark Moon: The Lost Altar* a débarqué sur Crunchyroll en janvier avec un tie-in ENHYPEN qui brouille la frontière entre anime et merchandising K-pop. *Terror Man* a été diffusé sur TVLing en janvier 2026.

## Pourquoi ce moment compte

Le pipeline manhwa vers anime est encore en construction en temps réel. Chaque adaptation renforce soit la confiance des studios d'animation et des plateformes de streaming, soit l'érode. ORV, en particulier, établira un benchmark — non seulement pour la façon dont une série est adaptée, mais pour l'ambition que l'industrie est prête à afficher avec le matériau source manhwa.

Le raz-de-marée est là. Vient maintenant le test de qualité.
    `.trim(),
  },

  // ── Article 5 — Market slowdown / paradox ───────────────────────────────────
  {
    title_en: "Webtoon's Paradox: A Slowing Korean Market Meets a $9.7B Global Valuation",
    title_fr: "Le paradoxe du webtoon : un marché coréen qui ralentit face à une valorisation mondiale de 9,7 Md$",
    excerpt_en: "Korea's domestic webtoon market slowed sharply in H1 2025 while the global industry hit $9.7B. The gap between home and abroad reveals the tensions defining webtoon's next era.",
    excerpt_fr: "Le marché coréen du webtoon a ralenti fortement au premier semestre 2025, tandis que le marché mondial atteignait 9,7 Md$. L'écart entre local et mondial révèle les tensions qui définissent la prochaine ère.",
    reading_time: 4,
    published_at: new Date('2026-02-14T08:00:00Z'),
    source_url: 'news:webtoon-market-paradox:20260214',
    manhwa_keywords: [],
    content_en: `
Two numbers define the webtoon industry heading into 2026 — and they seem to contradict each other.

The **global webtoon market hit $9.7 billion** in 2025, with projections pointing toward $12.6 billion by 2026. Meanwhile, Korea's domestic market — the one that invented webtoons — **slowed sharply in the first half of 2025**, as platforms hit saturation and user growth stalled.

This isn't a contradiction. It's a map of where the industry is heading.

## What's Happening at Home

Korea's slowdown is a story of consolidation. After years of aggressive platform expansion, Naver Webtoon, Kakao Page, and Lezhin are all rationalizing: fewer originals greenlighted, more emphasis on proven IP, tighter creator compensation structures. The domestic market isn't collapsing — it's maturing. That looks like a slowdown.

Compounding the pressure: **Webtoon Entertainment's Nasdaq debut** exposed the company to currency risk. With the Korean won weakening against the dollar, the company's earnings came under pressure even as revenue held — a structural problem that will shape investment decisions for years.

## What's Happening Abroad

Outside Korea, webtoon is still a growth story. Lezhin invested **$12 million in a Paris animation studio** in 2025 to accelerate European adaptations. WEBTOON signed Hollywood partnerships with Disney and Warner Bros. KOMACON is funding 250 new projects specifically to diversify content for international markets.

The industry's center of gravity is shifting. Korea remains the creative engine, but the business logic increasingly runs through global distribution deals, adaptation pipelines, and IP licensing.

## The Pressure on Creators

Caught between a slowing home market and escalating global expectations, Korean creators face a specific kind of pressure: write for local readers who know the genre conventions, but also produce content legible enough for international adaptation. That's a harder brief than it sounds.

The webtoon paradox isn't going away. Navigating it is the defining challenge of the industry's next chapter.
    `.trim(),
    content_fr: `
Deux chiffres définissent l'industrie du webtoon à l'aube de 2026 — et ils semblent se contredire.

Le **marché mondial du webtoon a atteint 9,7 milliards de dollars** en 2025, avec des projections pointant vers 12,6 milliards en 2026. Pendant ce temps, le marché coréen — celui qui a inventé le webtoon — **a ralenti fortement au premier semestre 2025**, les plateformes ayant atteint une saturation et la croissance des utilisateurs s'étant stabilisée.

Ce n'est pas une contradiction. C'est une carte de la direction que prend l'industrie.

## Ce qui se passe à la maison

Le ralentissement coréen est une histoire de consolidation. Après des années d'expansion agressive des plateformes, Naver Webtoon, Kakao Page et Lezhin rationalisent : moins d'originaux approuvés, plus d'accent sur les IP confirmées, des structures de rémunération des créateurs plus strictes. Le marché domestique ne s'effondre pas — il mûrit. Ce qui ressemble à un ralentissement.

La pression est amplifiée par : **la cotation en bourse de Webtoon Entertainment au Nasdaq** qui a exposé la société au risque de change. Avec l'affaiblissement du won coréen face au dollar, les bénéfices de l'entreprise ont subi des pressions même si les revenus se maintenaient — un problème structurel qui façonnera les décisions d'investissement pour des années.

## Ce qui se passe à l'étranger

Hors de Corée, le webtoon reste une histoire de croissance. Lezhin a investi **12 millions de dollars dans un studio d'animation parisien** en 2025 pour accélérer les adaptations européennes. WEBTOON a signé des partenariats hollywoodiens avec Disney et Warner Bros. La KOMACON finance 250 nouveaux projets spécifiquement pour diversifier le contenu destiné aux marchés internationaux.

Le centre de gravité de l'industrie se déplace. La Corée reste le moteur créatif, mais la logique commerciale passe de plus en plus par des accords de distribution mondiale, des pipelines d'adaptation et des licences IP.

## La pression sur les créateurs

Coincés entre un marché intérieur qui ralentit et des attentes mondiales qui s'amplifient, les créateurs coréens font face à une pression particulière : écrire pour des lecteurs locaux qui connaissent les conventions du genre, mais aussi produire un contenu suffisamment lisible pour une adaptation internationale. C'est un brief plus difficile qu'il n'y paraît.

Le paradoxe du webtoon ne va pas disparaître. Le naviguer est le défi définissant du prochain chapitre de l'industrie.
    `.trim(),
  },

]

async function main() {
  console.log(`\nInserting ${ARTICLES.length} articles...\n`)
  for (const article of ARTICLES) {
    await insertArticle(article)
  }
  console.log('\nDone.\n')
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
