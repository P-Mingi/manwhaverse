/**
 * Expand all news articles to 800-1000 words for SEO.
 * Run with: npx tsx lib/ingestion/expand-news-articles.ts
 */

import { prisma } from '../db/client'

const EXPANSIONS: Array<{ source_url: string; reading_time: number; content_en: string; content_fr: string }> = [

  // ─── 1. Korea's Webtoon Industry Powers Up ───────────────────────────────────
  {
    source_url: 'synthesis:ann.234655+234656:20260302',
    reading_time: 5,
    content_en: `
The Korean webtoon industry is sending all the right signals heading into 2026, with two major developments dropping simultaneously that underscore just how seriously Korea treats its comics culture as a global export — one arriving from the government, and one from the industry's biggest private player.

## Government Throws $3M at Genre Diversification

The Korea Manhwa Contents Agency (KOMACON) has launched its 2026 "Diversity Comics Production Support" program, committing **4 billion Korean won** (roughly **US$3 million**) to fund approximately **250 projects** from emerging and independent creators.

Around 140 of those projects will receive direct production grants — approximately US$14,000 per project, a meaningful increase over previous years. The rest of the budget goes toward five management consulting firms tasked with helping funded creators navigate the realities of international distribution, IP licensing, and overseas expansion.

Applications open **March 3–19, 2026** for applicants aged 19 and over, with a requirement to submit at least three completed episodes before final evaluation.

**The goal isn't just more manhwa — it's different manhwa.** Korean webtoon platforms have long been dominated by romance and fantasy-heavy content, and officials are explicitly naming this as a problem they want to solve. The initiative's language around "underrepresented genres" and a "more sustainable creative ecosystem" reflects growing awareness inside the industry that genre monoculture is both a creative risk and a market risk.

When your entire sector is dependent on romantic fantasy clicks, you're one trend shift away from a revenue crisis. KOMACON's investment is, at its core, a hedge against that.

## Naver's AI Characters Are Talking Back — And Readers Love It

On the platform side, Naver Webtoon's **Character Chat** service has crossed **6 million cumulative users**, with **230 million total messages** exchanged. The AI analyzes character speech patterns, personality traits, and canonical story data to simulate in-character conversations — so Therdeo from *My In-Laws Are Obsessed With Me* doesn't sound like a generic language model. He sounds like Therdeo.

The demographics are striking: **78% of users are teenagers or people in their 20s**, the exact demographic that platforms need to lock in for long-term retention. Character Chat isn't a marketing gimmick — it's a retention engine disguised as a fan feature.

Monetization is already happening. **52% of interactions with the Therdeo chatbot were paid** in its first month of availability. The Baek Dohwa chatbot from *Operation: True Love* ranked #1 in engagement for three consecutive months, suggesting readers are willing to return repeatedly — and pay — for the experience.

In Japan, the service launched in late February 2026 on **LINE Manga** under the localized name "Kyara Chat," opening with characters from *My In-Laws Are Obsessed With Me* and *Operation: True Love*. Japan is a critical market for Naver's global ambitions, and "Kyara Chat" represents the first real test of whether AI character companions can travel across cultural contexts without losing their appeal.

## Why These Two Stories Belong Together

At first glance, a government grant program and an AI chatbot feature don't have much in common. But both are responses to the same underlying pressure: the Korean webtoon industry needs to grow in ways it hasn't grown before.

KOMACON is addressing the **supply side** — funding the creation of content that wouldn't otherwise get made. Naver is addressing the **demand side** — finding new ways to monetize existing IP and deepen reader engagement beyond the episode view.

Neither approach alone is sufficient. An industry that only diversifies its content without extending reader engagement will see new titles disappear without an audience. An industry that only deepens engagement with existing titles will eventually exhaust the emotional bandwidth of its readers.

The fact that both moves are happening simultaneously — one from a government agency, one from a private platform — suggests something closer to coordination than coincidence. The Korean webtoon ecosystem is maturing. These two announcements are what maturation looks like.

## What It Means for the Global Market

For readers and observers outside Korea, the significance is straightforward: the country that invented the webtoon format is actively investing in its long-term health, not just its short-term revenue. That's a positive signal for the medium's future — for creators who want to work in it, for readers who want to consume it, and for the platforms building business models around it.

The next generation of manhwa is being funded right now in Seoul. And its readers are already talking to the characters.
    `.trim(),
    content_fr: `
L'industrie du webtoon coréen envoie des signaux très positifs en ce début d'année 2026, avec deux développements majeurs qui confirment l'ambition de la Corée de faire de sa culture BD une référence mondiale — l'un venant du gouvernement, l'autre du plus grand acteur privé du secteur.

## 3 M$ pour diversifier les genres

La Korea Manhwa Contents Agency (KOMACON) vient de lancer son programme 2026 de "Soutien à la production de comics diversifiés", avec un budget de **4 milliards de wons coréens** (environ **3 M$**) pour financer quelque **250 projets** portés par des créateurs émergents et indépendants.

Environ 140 de ces projets bénéficieront de subventions directes — environ 14 000 $ par projet, en hausse notable par rapport aux années précédentes. Le reste du budget finance cinq sociétés de conseil en management chargées d'accompagner les créateurs sélectionnés sur les réalités de la distribution internationale, du licensing IP et de l'expansion à l'étranger.

Les candidatures sont ouvertes du **3 au 19 mars 2026**, pour les candidats de 19 ans et plus, avec l'obligation de soumettre au moins trois épisodes complets avant l'évaluation finale.

**L'objectif n'est pas simplement plus de manhwa — c'est un manhwa différent.** Les plateformes coréennes sont depuis longtemps dominées par le romance et la fantasy, et les autorités nomment explicitement ce phénomène comme un problème à résoudre. Le langage de l'initiative autour des "genres sous-représentés" et d'un "écosystème créatif plus durable" reflète une prise de conscience croissante que la monoculture de genre est à la fois un risque créatif et un risque commercial.

Quand tout un secteur dépend des clics de romance fantasy, un seul changement de tendance peut provoquer une crise de revenus. L'investissement de la KOMACON est, à la base, une couverture contre ce risque.

## Les personnages IA de Naver répondent — et les lecteurs adorent

Du côté des plateformes, le service **Character Chat** de Naver Webtoon a franchi le cap des **6 millions d'utilisateurs cumulés**, avec **230 millions de messages** échangés au total. L'IA analyse les modèles de discours, les traits de personnalité et les données canoniques de l'histoire pour simuler des conversations in-character — si bien que Therdeo de *My In-Laws Are Obsessed With Me* ne ressemble pas à un modèle de langage générique. Il ressemble à Therdeo.

Les données démographiques sont frappantes : **78 % des utilisateurs sont des adolescents ou des vingtenaires**, exactement le segment que les plateformes doivent fidéliser pour assurer leur pérennité. Character Chat n'est pas un gadget marketing — c'est un moteur de rétention déguisé en fonctionnalité fan.

La monétisation est déjà en place. **52 % des interactions avec le chatbot Therdeo étaient payantes** dès le premier mois. Le chatbot de Baek Dohwa, tiré d'*Operation: True Love*, a dominé les classements d'engagement trois mois d'affilée, suggérant que les lecteurs sont prêts à revenir régulièrement — et à payer — pour l'expérience.

Au Japon, le service s'est lancé fin février 2026 sur **LINE Manga** sous le nom localisé "Kyara Chat", débutant avec des personnages de *My In-Laws Are Obsessed With Me* et *Operation: True Love*. Le Japon est un marché crucial pour les ambitions mondiales de Naver, et "Kyara Chat" représente le premier vrai test de la capacité des compagnons IA à traverser les frontières culturelles sans perdre leur attrait.

## Pourquoi ces deux histoires vont ensemble

À première vue, un programme de subventions gouvernementales et une fonctionnalité de chatbot IA n'ont pas grand-chose en commun. Mais les deux sont des réponses à la même pression sous-jacente : l'industrie coréenne du webtoon doit croître d'une façon qu'elle n'a pas encore explorée.

La KOMACON s'attaque à l'**offre** — financer la création de contenus qui ne verraient pas le jour autrement. Naver s'attaque à la **demande** — trouver de nouvelles façons de monétiser l'IP existante et d'approfondir l'engagement des lecteurs au-delà de la simple vue d'épisode.

Ni l'une ni l'autre de ces approches ne suffit seule. Une industrie qui diversifie uniquement son contenu sans prolonger l'engagement des lecteurs verra les nouveaux titres disparaître sans audience. Une industrie qui ne fait qu'approfondir l'engagement sur les titres existants finira par épuiser la capacité émotionnelle de ses lecteurs.

Le fait que ces deux mouvements se produisent simultanément — l'un d'une agence gouvernementale, l'autre d'une plateforme privée — suggère quelque chose qui ressemble davantage à une coordination qu'à une coïncidence. L'écosystème coréen du webtoon mûrit. Ces deux annonces en sont le visage.

## Ce que ça signifie pour le marché mondial

Pour les lecteurs et observateurs hors de Corée, la signification est claire : le pays qui a inventé le format webtoon investit activement dans sa santé à long terme, pas seulement dans ses revenus à court terme. C'est un signal positif pour l'avenir du medium — pour les créateurs qui veulent y travailler, pour les lecteurs qui veulent le consommer, et pour les plateformes qui construisent des modèles économiques autour de lui.

La prochaine génération de manhwa est en train d'être financée en ce moment à Seoul. Et ses lecteurs parlent déjà aux personnages.
    `.trim(),
  },

  // ─── 2. AI Companions editorial ──────────────────────────────────────────────
  {
    source_url: 'editorial:naver-ai-parasocial:20260302',
    reading_time: 5,
    content_en: `
When Naver Webtoon says its AI Character Chat users have exchanged **230 million messages**, that's not just a vanity metric — it's a window into how manhwa readership is evolving in ways nobody quite predicted.

The number matters because of what it represents: readers who finished the last available chapter of a series they love and, instead of waiting, kept talking. To the characters. In real-time. Using an AI that had been trained to respond as those characters would.

That's not consumption. That's something else.

## What Character Chat Actually Does

Character Chat is Naver's AI feature that lets readers have real conversations with characters from their webtoons. The system isn't a generic chatbot with a character name slapped on it — it's trained on personality traits, speech patterns, story context, and canonical character data to maintain internal consistency.

Therdeo from *My In-Laws Are Obsessed With Me* sounds like Therdeo. Baek Dohwa from *Operation: True Love* responds the way Baek Dohwa would respond. The AI knows the story, knows the character's history, and stays within the boundaries of established canon.

The recently launched Japan version — "Kyara Chat" on LINE Manga — signals that Naver sees this as a global product. Japan's reading culture is different from Korea's, and the fact that Naver chose Japan as the first international market for Character Chat isn't accidental. LINE Manga is one of Japan's largest manga platforms, and manga readers already have deeply parasocial relationships with characters. The transition to AI-mediated interaction may feel more natural there than anywhere else.

## The Parasocial Architecture of Manhwa

To understand why Character Chat works, you need to understand how manhwa already functions as a parasocial medium.

Webtoons are published in chapters, often weekly, with comment sections that appear between panels or at the bottom of each episode. Readers don't just consume manhwa — they react to it, in real-time, as they read. The comment sections on major Naver series can have hundreds of thousands of entries per episode. Readers direct-address characters. They make predictions. They fight with each other about plot developments.

The medium is structurally built for parasocial engagement in ways that print manga isn't. There's no equivalent comment infrastructure in a physical volume. The digital format created habits of interaction that AI is now simply extending.

Character Chat is the logical endpoint of a system that was always pointing in this direction.

## The Monetization Angle

What's financially notable about Character Chat is how quickly it became a revenue product. **52% of interactions with the Therdeo chatbot were paid** in its first month — meaning more than half of users chose to pay to continue conversations rather than stop when they hit the free limit.

That's an extraordinary conversion rate. Most freemium products convert 2–5% of users to paid tiers. Character Chat is converting the majority of active users in its first month, which suggests the value proposition is immediately legible: readers understand what they're getting and are willing to pay for it.

The **Baek Dohwa chatbot ranking #1 in engagement for three consecutive months** shows this isn't a novelty spike. Users are returning. They're building ongoing relationships with AI versions of characters they love.

## The Harder Questions

Character Chat raises questions that the industry isn't fully ready to answer.

**For creators:** The AI speaks in a character's voice that the original author developed. It generates new dialogue, new interactions, new "moments" — none of which were written by the person who created the character. The revenue goes to Naver, with royalties presumably going to publishers, and creators receiving their share through existing contracts that may not have contemplated this use case.

Whether this is a violation of creative ownership, a legitimate extension of IP, or something in between depends entirely on how you frame the question — and who's asking.

**For readers:** The lines between canon and non-canon blur when AI can produce character responses that feel authentic. If Therdeo says something in Character Chat, did Therdeo say it? Most users probably know the answer is no — but in the emotional grammar of parasocial relationships, "technically no" doesn't always matter.

**For the industry:** Character Chat is a proof of concept that AI companions can be monetized at scale within an existing platform. Every major manhwa platform will have to develop a position on this technology. Ignoring it means ceding the reader engagement layer to competitors.

## What Comes Next

Naver is building a product stack around manhwa characters that extends well beyond reading: Character Chat for conversation, Tarotoon for AI-powered fortune readings from characters, and AI Caricature for transforming user photos into webtoon-style art.

The strategic picture is a platform that captures readers not just during the episode but in the spaces between chapters — the most emotionally charged moments of a serialized reading experience. Character Chat is currently not available in the United States, but international expansion appears to be the trajectory.

For readers outside Korea and Japan, the question isn't whether this is coming. It's how long before it arrives.
    `.trim(),
    content_fr: `
Quand Naver Webtoon annonce que ses utilisateurs de Character Chat ont échangé **230 millions de messages**, ce n'est pas qu'un simple indicateur marketing — c'est une fenêtre sur l'évolution des pratiques de lecture de manhwa d'une façon que personne n'avait tout à fait anticipée.

Ce chiffre compte parce qu'il représente quelque chose de précis : des lecteurs qui ont fini le dernier chapitre disponible d'une série qu'ils aiment et qui, au lieu d'attendre, ont continué à parler. Aux personnages. En temps réel. Via une IA entraînée à répondre comme ces personnages le feraient.

Ce n'est plus de la consommation. C'est autre chose.

## Ce que fait vraiment Character Chat

Character Chat est la fonctionnalité IA de Naver qui permet aux lecteurs d'avoir de vraies conversations avec des personnages de leurs webtoons. Le système n'est pas un chatbot générique auquel on a collé un nom de personnage — il est entraîné sur les traits de personnalité, les modèles de discours, le contexte de l'histoire et les données canoniques du personnage pour maintenir une cohérence interne.

Therdeo de *My In-Laws Are Obsessed With Me* parle comme Therdeo. Baek Dohwa de *Operation: True Love* répond comme Baek Dohwa répondrait. L'IA connaît l'histoire, l'histoire du personnage, et reste dans les limites du canon établi.

La version japonaise récemment lancée — "Kyara Chat" sur LINE Manga — signale que Naver voit cela comme un produit mondial. La culture de lecture au Japon est différente de celle de Corée, et le fait que Naver ait choisi le Japon comme premier marché international pour Character Chat n'est pas accidentel. LINE Manga est l'une des plus grandes plateformes de manga du Japon, et les lecteurs de manga ont déjà des relations profondément parasociales avec les personnages. La transition vers l'interaction médiée par l'IA peut y sembler plus naturelle qu'ailleurs.

## L'architecture parasociale du manhwa

Pour comprendre pourquoi Character Chat fonctionne, il faut comprendre comment le manhwa fonctionne déjà comme un medium parasocial.

Les webtoons sont publiés en chapitres, souvent chaque semaine, avec des sections de commentaires qui apparaissent entre les cases ou en bas de chaque épisode. Les lecteurs ne se contentent pas de consommer le manhwa — ils y réagissent, en temps réel, pendant leur lecture. Les sections de commentaires des grandes séries Naver peuvent compter des centaines de milliers d'entrées par épisode. Les lecteurs s'adressent directement aux personnages. Ils font des prédictions. Ils se disputent sur les développements de l'intrigue.

Le medium est structurellement conçu pour l'engagement parasocial d'une façon que le manga papier n'est pas. Il n'y a pas d'infrastructure de commentaires équivalente dans un volume physique. Le format numérique a créé des habitudes d'interaction que l'IA étend maintenant simplement.

Character Chat est l'aboutissement logique d'un système qui pointait toujours dans cette direction.

## L'angle monétisation

Ce qui est financièrement notable avec Character Chat, c'est la rapidité avec laquelle il est devenu un produit générateur de revenus. **52 % des interactions avec le chatbot Therdeo étaient payantes** dès le premier mois — ce qui signifie que plus de la moitié des utilisateurs ont choisi de payer pour continuer les conversations plutôt que de s'arrêter à la limite gratuite.

C'est un taux de conversion extraordinaire. La plupart des produits freemium convertissent 2 à 5 % des utilisateurs vers des niveaux payants. Character Chat convertit la majorité des utilisateurs actifs dès le premier mois, ce qui suggère que la proposition de valeur est immédiatement intelligible : les lecteurs comprennent ce qu'ils obtiennent et sont prêts à le payer.

Le fait que **le chatbot Baek Dohwa se classe n°1 en engagement pendant trois mois consécutifs** montre que ce n'est pas un pic de nouveauté. Les utilisateurs reviennent. Ils construisent des relations continues avec des versions IA de personnages qu'ils aiment.

## Les questions plus difficiles

Character Chat soulève des questions auxquelles l'industrie n'est pas tout à fait prête à répondre.

**Pour les créateurs :** L'IA parle avec la voix d'un personnage que l'auteur original a développé. Elle génère de nouveaux dialogues, de nouvelles interactions, de nouveaux "moments" — qu'aucune des personnes qui ont créé le personnage n'a écrits. Les revenus vont à Naver, avec des redevances allant vraisemblablement aux éditeurs, et les créateurs recevant leur part via des contrats existants qui n'ont peut-être pas anticipé ce cas d'usage.

Que cela constitue une violation de la propriété créative, une extension légitime de l'IP, ou quelque chose entre les deux, dépend entièrement de la façon dont on cadre la question — et de qui pose la question.

**Pour les lecteurs :** Les lignes entre canon et non-canon se brouillent quand l'IA peut produire des réponses de personnages qui semblent authentiques. Si Therdeo dit quelque chose dans Character Chat, est-ce que Therdeo l'a dit ? La plupart des utilisateurs savent probablement que la réponse est non — mais dans la grammaire émotionnelle des relations parasociales, "techniquement non" ne compte pas toujours.

**Pour l'industrie :** Character Chat est une preuve de concept que les compagnons IA peuvent être monétisés à grande échelle au sein d'une plateforme existante. Chaque grande plateforme de manhwa devra développer une position sur cette technologie. L'ignorer signifie céder la couche d'engagement des lecteurs aux concurrents.

## Ce qui vient ensuite

Naver construit une pile de produits autour des personnages de manhwa qui s'étend bien au-delà de la lecture : Character Chat pour la conversation, Tarotoon pour des lectures de tarot IA effectuées par les personnages, et AI Caricature pour transformer les photos des utilisateurs en illustrations de style webtoon.

Le tableau stratégique est celui d'une plateforme qui capte les lecteurs non seulement pendant l'épisode, mais dans les espaces entre les chapitres — les moments les plus chargés émotionnellement d'une expérience de lecture sérialisée. Character Chat n'est actuellement pas disponible aux États-Unis, mais l'expansion internationale semble être la trajectoire.

Pour les lecteurs hors de Corée et du Japon, la question n'est pas de savoir si cela arrive. C'est de savoir combien de temps avant que ça arrive.
    `.trim(),
  },

  // ─── 3. World Webtoon Festival ───────────────────────────────────────────────
  {
    source_url: 'news:world-webtoon-festival-2025:20251021',
    reading_time: 5,
    content_en: `
From October 19 to 22, Seoul hosted the **2025 World Webtoon Festival** — a four-day celebration of the medium that Korea invented and the world adopted. What started a decade ago as a modest domestic promotional event has grown into something more consequential: one of the most significant annual gatherings in the global comics industry.

## The Festival's Origins

The World Webtoon Festival was conceived at a moment when Korean policymakers were beginning to recognize webtoons not just as an entertainment product but as a strategic cultural export. K-pop and K-drama had already demonstrated that Korean popular culture could generate significant soft power abroad. Webtoons, officials argued, could do the same — with the added advantage of an inherently digital format that scaled globally without the logistical overhead of physical production.

The early festivals were modest affairs: domestic creator panels, publisher booths, some international guests. But as Naver Webtoon and Kakao began their global expansions, and as manhwa-to-anime adaptations started attracting mainstream attention, the event's ambitions grew correspondingly.

## What Makes 2025 Different

The 2025 edition arrived at a critical inflection point for the industry. Several tensions were in play simultaneously.

On the positive side: the global webtoon market had just been valued at **$9.7 billion**, manhwa anime adaptations were multiplying rapidly, and Hollywood partnerships were elevating the medium's profile in ways that would have seemed implausible five years ago.

On the complicated side: Korea's domestic market was showing signs of consolidation and slowdown after years of aggressive expansion. Platform labor practices were under scrutiny — allegations of unpaid or underpaid creator work surfaced during South Korea's National Assembly audit proceedings in November. Webtoon Entertainment's post-Nasdaq debut performance was being weighed against a weakening Korean won.

The festival became a space to celebrate the global wins while quietly acknowledging the structural challenges at home.

## What Happens at the Festival

The World Webtoon Festival is organized around three overlapping audiences: **industry professionals**, **creators**, and **fans**.

For professionals, it's a deal-making environment. International licensing agreements get signed. Adaptation discussions that have been happening over email get advanced in face-to-face meetings. Streaming platforms and Korean publishers compare notes on which titles are ready for global audiences.

For creators, it's a rare public platform. Korean webtoon creators typically interact with their audiences through digital comment sections and social media — they rarely have in-person convention presences comparable to manga artists in Japan or comic artists in the West. The festival gives them a physical stage.

For fans, it's a pilgrimage. Meeting the creators of series that have shaped years of your reading life, in the city where those series were made, is an experience that no digital substitute provides.

## The Global Attendance Shift

One of the most meaningful changes in recent editions of the World Webtoon Festival is the composition of the international audience. In the early years, international attendees were largely industry observers and journalists. More recently, fans from Europe, Southeast Asia, and North and South America have begun making the trip specifically for the festival.

That shift reflects something real: manhwa has built a global readership that self-identifies with the format, not just with individual series. These aren't readers who happen to have read a manhwa. They're readers who think of themselves as manhwa readers — a distinction that matters enormously for building sustainable international markets.

## The Industry Context

The festival doesn't exist in a vacuum. It's an annual checkpoint for an industry that's navigating the gap between its global ambitions and its domestic realities.

The Korean webtoon market pioneered the format that the world is now adopting. But domestic saturation, platform consolidation, creator compensation debates, and the challenges of Nasdaq-era financial scrutiny are all real pressures. The festival is where the industry comes to remind itself — and the world — of what it's built, and where it's going.

In 2025, what it's built is a $9.7 billion global industry. Where it's going involves AI character companions, Hollywood co-productions, and government-funded genre diversification initiatives.

For four days in October, Seoul is the center of that conversation.
    `.trim(),
    content_fr: `
Du 19 au 22 octobre, Seoul a accueilli le **World Webtoon Festival 2025** — quatre jours de célébration du medium que la Corée a inventé et que le monde entier a adopté. Ce qui était, il y a dix ans, un modeste événement promotionnel national est devenu quelque chose de bien plus important : l'un des rassemblements annuels les plus significatifs de l'industrie mondiale de la bande dessinée.

## Les origines du festival

Le World Webtoon Festival a été conçu à un moment où les décideurs politiques coréens commençaient à considérer les webtoons non pas simplement comme un produit de divertissement, mais comme une exportation culturelle stratégique. La K-pop et les K-dramas avaient déjà démontré que la culture populaire coréenne pouvait générer un soft power significatif à l'étranger. Les webtoons, faisaient valoir les officiels, pouvaient faire de même — avec l'avantage supplémentaire d'un format intrinsèquement numérique qui se déployait mondialement sans les contraintes logistiques de la production physique.

Les premières éditions étaient modestes : panels de créateurs nationaux, stands d'éditeurs, quelques invités internationaux. Mais à mesure que Naver Webtoon et Kakao lançaient leurs expansions mondiales, et que les adaptations manhwa en anime commençaient à attirer l'attention du grand public, les ambitions de l'événement se développèrent en conséquence.

## Ce qui rend 2025 différent

L'édition 2025 est arrivée à un point d'inflexion critique pour l'industrie. Plusieurs tensions étaient en jeu simultanément.

Du côté positif : le marché mondial du webtoon venait d'être valorisé à **9,7 milliards de dollars**, les adaptations anime de manhwa se multipliaient rapidement, et des partenariats hollywoodiens élevaient le profil du medium d'une façon qui aurait semblé improbable cinq ans auparavant.

Du côté plus complexe : le marché coréen montrait des signes de consolidation et de ralentissement après des années d'expansion agressive. Les pratiques de travail des plateformes étaient scrutées — des allégations de travail impayé ou sous-payé des créateurs ont fait surface lors des audits de l'Assemblée nationale sud-coréenne en novembre. Les performances post-introduction en bourse de Webtoon Entertainment au Nasdaq étaient pesées à l'aune d'un won coréen affaibli.

Le festival est devenu un espace pour célébrer les victoires mondiales tout en reconnaissant discrètement les défis structurels à la maison.

## Ce qui se passe au festival

Le World Webtoon Festival est organisé autour de trois audiences qui se chevauchent : les **professionnels de l'industrie**, les **créateurs** et les **fans**.

Pour les professionnels, c'est un environnement de négociation. Des accords de licence internationaux sont signés. Des discussions d'adaptation qui se déroulaient par e-mail avancent lors de réunions en face à face. Les plateformes de streaming et les éditeurs coréens comparent leurs notes sur les titres prêts pour les audiences mondiales.

Pour les créateurs, c'est une rare plateforme publique. Les créateurs de webtoons coréens interagissent généralement avec leur public via des sections de commentaires numériques et les réseaux sociaux — ils ont rarement des présences en convention en personne comparables aux mangakas au Japon ou aux artistes de comics en Occident. Le festival leur offre une scène physique.

Pour les fans, c'est un pèlerinage. Rencontrer les créateurs de séries qui ont façonné des années de leur vie de lecteur, dans la ville où ces séries ont été créées, est une expérience qu'aucun substitut numérique ne peut offrir.

## Le changement dans la fréquentation mondiale

L'un des changements les plus significatifs dans les éditions récentes du World Webtoon Festival est la composition du public international. Dans les premières années, les participants internationaux étaient en grande partie des observateurs de l'industrie et des journalistes. Plus récemment, des fans d'Europe, d'Asie du Sud-Est et d'Amérique du Nord et du Sud ont commencé à faire le voyage spécifiquement pour le festival.

Ce changement reflète quelque chose de réel : le manhwa a construit un lectorat mondial qui s'identifie au format, pas seulement aux séries individuelles. Ce ne sont pas des lecteurs qui ont lu un manhwa par hasard. Ce sont des lecteurs qui se considèrent comme des lecteurs de manhwa — une distinction qui compte énormément pour construire des marchés internationaux durables.

## Le contexte industriel

Le festival n'existe pas dans le vide. C'est un bilan annuel pour une industrie qui navigue l'écart entre ses ambitions mondiales et ses réalités nationales.

Le marché coréen du webtoon a ouvert la voie au format que le monde adopte maintenant. Mais la saturation domestique, la consolidation des plateformes, les débats sur la rémunération des créateurs, et les défis de la transparence financière à l'ère Nasdaq sont de vraies pressions. Le festival est l'endroit où l'industrie vient se rappeler — et rappeler au monde — ce qu'elle a construit, et où elle va.

En 2025, ce qu'elle a construit est une industrie mondiale de 9,7 milliards de dollars. Où elle va implique des compagnons personnages IA, des co-productions hollywoodiennes et des initiatives de diversification de genres financées par le gouvernement.

Pendant quatre jours en octobre, Seoul est le centre de cette conversation.
    `.trim(),
  },

  // ─── 4. WEBTOON Translate shutdown ───────────────────────────────────────────
  {
    source_url: 'news:webtoon-translate-shutdown:20251128',
    reading_time: 5,
    content_en: `
On November 26, Naver's subsidiary **Webtoon Entertainment** shut down **WEBTOON Translate**, the official platform that had allowed volunteer translators to localize manhwa and webtoons into dozens of languages. For thousands of readers in markets where official translations are sparse or nonexistent, it was the end of their primary access point to the medium they love.

## What WEBTOON Translate Was — And Why It Mattered

Launched years ago as a structured volunteer localization program, WEBTOON Translate was something genuinely unusual in the media industry: a large corporation building an official, legal framework for fan translation.

The mechanics were straightforward. Fan translators applied to localize specific series. Naver reviewed applications, selected qualified translators, and maintained editorial oversight of the output. Approved translations were published directly on the platform — officially, with creator and publisher knowledge, under a formal agreement.

This wasn't fansubbing or scanlation, the gray-market fan translation practices that have long existed in anime and manga. WEBTOON Translate was an attempt to formalize those practices, bring them inside the platform, and use community labor to solve a localization bottleneck that professional translation teams couldn't address at scale.

At its peak, WEBTOON Translate supported dozens of language pairs and served readers in markets that professional localization rarely prioritizes — Central and Eastern Europe, parts of Southeast Asia, much of Latin America.

## What Changed

No official explanation beyond vague "strategic shifts" was offered for the closure. But reading between the lines, several factors converge.

**Legal and labor complexity.** Volunteer labor programs create ongoing legal exposure, particularly in jurisdictions with strengthening freelancer and contractor protections. As Webtoon Entertainment navigated its post-Nasdaq public company obligations, the risk profile of the program became harder to justify.

**Professionalization pressure.** WEBTOON has been building professional localization infrastructure — formal partnerships with translation agencies, in-house language teams for priority markets. As that infrastructure grows, the volunteer program becomes harder to integrate cleanly.

**Financial scrutiny.** Post-IPO companies face quarterly earnings pressure in ways that private companies don't. Programs that generate goodwill but not direct revenue become candidates for cuts.

## Who Loses

The closure falls hardest on readers in mid-tier markets — countries that have meaningful manhwa readership but haven't been prioritized for official localization. For these readers, WEBTOON Translate wasn't supplementary. It was the product.

Readers in places like Poland, Hungary, Indonesia, Brazil, and dozens of other markets now face a gap between the manhwa content they want to read and the officially available translations. Some will turn to unlicensed scanlation sites, which exist in abundance. Others will simply stop reading.

The communities built around WEBTOON Translate — translators who had developed institutional knowledge of specific series, editors who had refined localization for specific language communities — don't have an obvious destination.

## The Broader Pattern

WEBTOON Translate's closure fits into a broader pattern: as manhwa platforms mature and professionalize, the community infrastructure that enabled their early global expansion gets rationalized out of existence.

Volunteer translators, fan communities, and informal localization networks are how manhwa reached global readers in the first place. As platforms now pursue professional international expansion — Hollywood deals, formal licensing agreements, in-house localization — the informal infrastructure that built those reader communities in the first place becomes a liability rather than an asset.

There's something uncomfortable about that trajectory. The readers who discovered manhwa through WEBTOON Translate were not just consumers. They were ambassadors who built the demand that professional expansion is now trying to capture.

## What Comes Next

For readers affected by the closure, the practical alternatives are limited: wait for official translations to arrive in their language, read in another language they know, or turn to unlicensed sources.

For WEBTOON Entertainment, the question is whether the efficiency gains from eliminating the program outweigh the goodwill lost — and whether readers in mid-tier markets who lose access simply reduce their engagement or drift away entirely.

The global manhwa market is valued at $9.7 billion. Some of that value was built on community labor that no longer has an official home.
    `.trim(),
    content_fr: `
Le 26 novembre, la filiale de Naver **Webtoon Entertainment** a fermé **WEBTOON Translate**, la plateforme officielle qui avait permis à des traducteurs bénévoles de localiser des manhwas et webtoons dans des dizaines de langues. Pour des milliers de lecteurs dans des marchés où les traductions officielles sont rares ou inexistantes, c'était la fin de leur principal point d'accès au medium qu'ils aiment.

## Ce qu'était WEBTOON Translate — et pourquoi ça comptait

Lancé il y a plusieurs années comme programme structuré de localisation bénévole, WEBTOON Translate était quelque chose de réellement inhabituel dans l'industrie des médias : une grande corporation construisant un cadre officiel et légal pour la traduction par les fans.

La mécanique était simple. Les traducteurs fans postulaient pour localiser des séries spécifiques. Naver examinait les candidatures, sélectionnait les traducteurs qualifiés et maintenait une supervision éditoriale de la production. Les traductions approuvées étaient publiées directement sur la plateforme — officiellement, avec la connaissance des créateurs et des éditeurs, dans le cadre d'un accord formel.

Ce n'était pas du fansub ou de la scanlation, ces pratiques de traduction fan du marché gris qui existent depuis longtemps dans l'anime et le manga. WEBTOON Translate était une tentative de formaliser ces pratiques, de les intégrer dans la plateforme, et d'utiliser le travail communautaire pour résoudre un goulot d'étranglement de localisation que les équipes de traduction professionnelles ne pouvaient pas résoudre à grande échelle.

À son apogée, WEBTOON Translate prenait en charge des dizaines de paires de langues et servait des lecteurs dans des marchés que la localisation professionnelle priorise rarement — l'Europe centrale et orientale, des parties de l'Asie du Sud-Est, une grande partie de l'Amérique latine.

## Ce qui a changé

Aucune explication officielle au-delà de vagues "recentrages stratégiques" n'a été donnée pour la fermeture. Mais en lisant entre les lignes, plusieurs facteurs convergent.

**Complexité juridique et travail.** Les programmes de travail bénévole créent une exposition juridique continue, en particulier dans les juridictions où les protections des freelances et des contractants se renforcent. Alors que Webtoon Entertainment naviguait ses obligations de société cotée post-Nasdaq, le profil de risque du programme est devenu plus difficile à justifier.

**Pression de professionnalisation.** WEBTOON a construit une infrastructure de localisation professionnelle — des partenariats formels avec des agences de traduction, des équipes linguistiques internes pour les marchés prioritaires. À mesure que cette infrastructure se développe, le programme bénévole devient plus difficile à intégrer proprement.

**Contrôle financier.** Les sociétés post-introduction en bourse font face à des pressions trimestrielles sur les résultats d'une façon que les entreprises privées ne connaissent pas. Les programmes qui génèrent de la bonne volonté mais pas de revenus directs deviennent des candidats aux coupes.

## Qui perd

La fermeture tombe le plus durement sur les lecteurs des marchés intermédiaires — des pays qui ont un lectorat de manhwa significatif mais qui n'ont pas été priorisés pour la localisation officielle. Pour ces lecteurs, WEBTOON Translate n'était pas un supplément. C'était le produit.

Les lecteurs de pays comme la Pologne, la Hongrie, l'Indonésie, le Brésil et des dizaines d'autres marchés font maintenant face à un fossé entre le contenu manhwa qu'ils veulent lire et les traductions officiellement disponibles. Certains se tourneront vers des sites de scanlation non licenciés, qui existent en abondance. D'autres arrêteront simplement de lire.

Les communautés construites autour de WEBTOON Translate — des traducteurs qui avaient développé une connaissance institutionnelle de séries spécifiques, des éditeurs qui avaient affiné la localisation pour des communautés linguistiques spécifiques — n'ont pas de destination évidente.

## Le schéma plus large

La fermeture de WEBTOON Translate s'inscrit dans un schéma plus large : à mesure que les plateformes de manhwa mûrissent et se professionnalisent, l'infrastructure communautaire qui a permis leur première expansion mondiale est rationalisée jusqu'à disparaître.

Les traducteurs bénévoles, les communautés fans et les réseaux de localisation informels sont la façon dont le manhwa a atteint les lecteurs mondiaux en premier lieu. Alors que les plateformes poursuivent maintenant une expansion internationale professionnelle — des accords hollywoodiens, des accords de licence formels, une localisation interne — l'infrastructure informelle qui a construit ces communautés de lecteurs devient une responsabilité plutôt qu'un atout.

Il y a quelque chose d'inconfortable dans cette trajectoire. Les lecteurs qui ont découvert le manhwa via WEBTOON Translate n'étaient pas seulement des consommateurs. Ils étaient des ambassadeurs qui ont construit la demande que l'expansion professionnelle essaie maintenant de capturer.

## Ce qui vient ensuite

Pour les lecteurs touchés par la fermeture, les alternatives pratiques sont limitées : attendre que des traductions officielles arrivent dans leur langue, lire dans une autre langue qu'ils connaissent, ou se tourner vers des sources non licenciées.

Pour Webtoon Entertainment, la question est de savoir si les gains d'efficacité liés à l'élimination du programme l'emportent sur la bonne volonté perdue — et si les lecteurs des marchés intermédiaires qui perdent l'accès réduisent simplement leur engagement ou s'éloignent complètement.

Le marché mondial du manhwa est valorisé à 9,7 milliards de dollars. Une partie de cette valeur a été construite sur le travail communautaire qui n'a plus de domicile officiel.
    `.trim(),
  },

  // ─── 5. WEBTOON Goes Hollywood ───────────────────────────────────────────────
  {
    source_url: 'news:webtoon-hollywood-partnerships:20251210',
    reading_time: 5,
    content_en: `
Two deals signed in 2025 tell you more about WEBTOON Entertainment's long-term strategy than any earnings call. The first was an **August partnership with Disney** that brought Marvel, 20th Century Studios, and Star Wars content to the WEBTOON platform in vertical scroll format, with original webcomics also in development. The second was a deal with **Warner Bros. Animation** to co-produce ten fan-favorite WEBTOON series for global distribution.

An app that began as a place for Korean creators to publish manhwa is now co-producing with Warner Bros. and hosting Star Wars comics. The strategic logic behind this is worth unpacking carefully.

## WEBTOON as IP Pipeline

The conventional read of these deals is that WEBTOON is gaining legitimacy by associating with major Western IP. That's partially true, but it misses the more important dynamic.

What WEBTOON is actually building is an **IP pipeline infrastructure** — a system for identifying, validating, and developing intellectual property before it reaches traditional media. The platform has always had this function implicitly: series that accumulate millions of readers on WEBTOON are demonstrably viable IP with proven audience demand. The Hollywood deals make that pipeline explicit.

Disney and Warner Bros. aren't on WEBTOON because they love manhwa. They're there because WEBTOON has demonstrated that it can find and cultivate properties with measurable audience engagement — and because the data on what readers engage with is uniquely valuable for making adaptation and production decisions.

## The Disney Deal in Detail

The Disney partnership is particularly interesting because it runs in both directions. Disney content coming to WEBTOON in vertical scroll format is the obvious, headline element. But the original webcomic development aspect matters more strategically.

When Disney co-develops original webcomics on WEBTOON, it's not just creating promotional content. It's building an audience feedback mechanism — a way to test new characters, storylines, and creative directions with engaged readers before committing to full-scale production. For a studio that routinely spends $200 million on feature film productions, the cost of a webcomic that doesn't find an audience is essentially zero.

## The Warner Bros. Animation Deal in Detail

The Warner Bros. Animation partnership to co-produce ten WEBTOON series for global distribution is more straightforward but equally significant. Ten series is not a pilot program. It's a commitment at scale.

What it signals is that Warner Bros. Animation views WEBTOON's existing series catalog as production-ready IP — properties that have already been market-tested and have established reader communities that could translate into animation audiences. The vertical scroll format that makes manhwa distinctive doesn't necessarily map cleanly onto traditional animation, but it creates familiar visual rhythms for the reader base.

## The "Cuts" Feature: The TikTok Play

In September, alongside these Hollywood announcements, WEBTOON launched **Cuts** — a short-form animated video feature that lets creators and fans produce brief animated clips from existing series. Available across the app, PC, and mobile web, Cuts is WEBTOON's explicit attempt to participate in the short-form video ecosystem that TikTok normalized.

The strategic logic is clear: extend manhwa content into the formats that algorithmic recommendation rewards. A 30-second Cuts clip that goes viral introduces a series to readers who might never have encountered it in its native format. It's a discovery funnel dressed up as a content feature.

## What This Means for Korean and Independent Creators

For the platform's core creator base — Korean manhwa artists and independent creators worldwide — these Hollywood partnerships carry weight in both directions.

The platform's rising legitimacy brings undeniable exposure. When WEBTOON is in the same sentence as Disney and Warner Bros., every series on the platform benefits from the association. Licensing deals that might not have been possible two years ago become possible when the counterparty views WEBTOON as a serious player.

But the shift in platform identity creates real tensions. WEBTOON began as a creator platform — a place where independent artists could build audiences without the gatekeeping of traditional publishing. As Hollywood money enters the relationship, the platform's incentives become more complex. Co-productions with major studios prioritize properties that fit studio development criteria: broadly accessible themes, clear adaptation pathways, minimal localization complexity.

That's not necessarily the same as what makes the best manhwa.

## The Longer View

WEBTOON Entertainment's Hollywood pivot is the most visible manifestation of a broader industry trend: manhwa is transitioning from a format into an IP category. The series on WEBTOON aren't just comics anymore. They're potential film franchises, animation properties, gaming adaptations, and merchandise lines.

That transition creates enormous value — but it also changes what kinds of stories get made, and who gets to make them. The next few years will reveal whether WEBTOON can navigate the tension between its Hollywood ambitions and its creative ecosystem.

For now, the answer to "what is WEBTOON?" is no longer simply "a reading app." It's an IP business.
    `.trim(),
    content_fr: `
Deux accords signés en 2025 en disent plus sur la stratégie à long terme de WEBTOON Entertainment que n'importe quel appel aux investisseurs. Le premier était un **partenariat en août avec Disney** qui a amené du contenu Marvel, 20th Century Studios et Star Wars sur la plateforme WEBTOON en format défilement vertical, avec des webcomics originaux également en développement. Le second était un accord avec **Warner Bros. Animation** pour co-produire dix séries WEBTOON favorites des fans pour une distribution mondiale.

Une application qui a commencé comme un espace pour les créateurs coréens est désormais en co-production avec Warner Bros. et héberge des comics Star Wars. La logique stratégique derrière cela mérite d'être décortiquée soigneusement.

## WEBTOON comme pipeline IP

La lecture conventionnelle de ces accords est que WEBTOON gagne en légitimité en s'associant à des IP occidentales majeures. C'est partiellement vrai, mais cela passe à côté de la dynamique la plus importante.

Ce que WEBTOON est en train de construire en réalité est une **infrastructure de pipeline IP** — un système pour identifier, valider et développer la propriété intellectuelle avant qu'elle n'atteigne les médias traditionnels. La plateforme a toujours eu cette fonction implicitement : les séries qui accumulent des millions de lecteurs sur WEBTOON sont manifestement des IP viables avec une demande d'audience prouvée. Les accords hollywoodiens rendent ce pipeline explicite.

Disney et Warner Bros. ne sont pas sur WEBTOON parce qu'ils aiment le manhwa. Ils sont là parce que WEBTOON a démontré qu'il peut trouver et cultiver des propriétés avec un engagement d'audience mesurable — et parce que les données sur ce qui engage les lecteurs sont d'une valeur unique pour prendre des décisions d'adaptation et de production.

## L'accord Disney en détail

Le partenariat Disney est particulièrement intéressant parce qu'il fonctionne dans les deux sens. Le contenu Disney arrivant sur WEBTOON en format défilement vertical est l'élément évident, le titre accrocheur. Mais l'aspect développement de webcomics originaux compte plus stratégiquement.

Quand Disney co-développe des webcomics originaux sur WEBTOON, il ne crée pas seulement du contenu promotionnel. Il construit un mécanisme de feedback d'audience — un moyen de tester de nouveaux personnages, intrigues et directions créatives avec des lecteurs engagés avant de s'engager dans une production à grande échelle. Pour un studio qui dépense régulièrement 200 millions de dollars pour des productions de films, le coût d'un webcomic qui ne trouve pas d'audience est essentiellement nul.

## L'accord Warner Bros. Animation en détail

Le partenariat Warner Bros. Animation pour co-produire dix séries WEBTOON pour une distribution mondiale est plus simple mais tout aussi significatif. Dix séries ne sont pas un programme pilote. C'est un engagement à grande échelle.

Ce que cela signale, c'est que Warner Bros. Animation considère le catalogue de séries existantes de WEBTOON comme des IP prêtes pour la production — des propriétés qui ont déjà été testées sur le marché et ont des communautés de lecteurs établies qui pourraient se transformer en audiences d'animation. Le format défilement vertical qui rend le manhwa distinctif ne correspond pas nécessairement proprement à l'animation traditionnelle, mais il crée des rythmes visuels familiers pour la base de lecteurs.

## La fonctionnalité "Cuts" : le jeu TikTok

En septembre, parallèlement à ces annonces hollywoodiennes, WEBTOON a lancé **Cuts** — une fonctionnalité vidéo animée en format court qui permet aux créateurs et aux fans de produire de brèves clips animées à partir de séries existantes. Disponible sur l'application, PC et web mobile, Cuts est la tentative explicite de WEBTOON de participer à l'écosystème vidéo court que TikTok a normalisé.

La logique stratégique est claire : étendre le contenu manhwa vers les formats que la recommandation algorithmique récompense. Une clip Cuts de 30 secondes qui devient virale introduit une série à des lecteurs qui ne l'auraient peut-être jamais rencontrée dans son format natif. C'est un entonnoir de découverte déguisé en fonctionnalité de contenu.

## Ce que ça signifie pour les créateurs coréens et indépendants

Pour la base de créateurs principale de la plateforme — des artistes de manhwa coréens et des créateurs indépendants du monde entier — ces partenariats hollywoodiens pèsent dans les deux sens.

La légitimité croissante de la plateforme apporte une exposition indéniable. Quand WEBTOON est dans la même phrase que Disney et Warner Bros., chaque série de la plateforme bénéficie de l'association. Des accords de licence qui n'auraient peut-être pas été possibles il y a deux ans deviennent possibles quand la contrepartie voit WEBTOON comme un acteur sérieux.

Mais le changement d'identité de la plateforme crée de vraies tensions. WEBTOON a commencé comme une plateforme de créateurs — un endroit où les artistes indépendants pouvaient construire des audiences sans le gardiennage de l'édition traditionnelle. À mesure que l'argent hollywoodien entre dans la relation, les incitations de la plateforme deviennent plus complexes.

## La vision à plus long terme

Le pivot hollywoodien de WEBTOON Entertainment est la manifestation la plus visible d'une tendance industrielle plus large : le manhwa est en train de passer d'un format à une catégorie IP. Les séries sur WEBTOON ne sont plus seulement des comics. Ce sont des franchises cinématographiques potentielles, des propriétés d'animation, des adaptations de jeux et des lignes de merchandising.

Cette transition crée une valeur énorme — mais elle change aussi quels types d'histoires sont faites, et qui peut les faire. Les prochaines années révéleront si WEBTOON peut naviguer la tension entre ses ambitions hollywoodiennes et son écosystème créatif.

Pour l'instant, la réponse à "qu'est-ce que WEBTOON?" n'est plus simplement "une application de lecture". C'est un business d'IP.
    `.trim(),
  },

  // ─── 6. 2026 Manhwa Anime Wave ───────────────────────────────────────────────
  {
    source_url: 'news:manhwa-anime-wave-2026:20260120',
    reading_time: 6,
    content_en: `
If 2024 was the year Solo Leveling proved manhwa could anchor a premium anime production, then 2026 is the year the industry tests whether that was a fluke or a repeatable formula. The slate of manhwa anime adaptations confirmed for 2026 is the largest in the medium's history — and the pressure to deliver is enormous.

## Why This Moment Is Different

Manhwa-to-anime adaptations existed before Solo Leveling. *Tower of God* received an adaptation in 2020. *The God of High School* followed the same year. But these were treated as experimental properties — interesting enough to produce, but not expected to compete with the top-tier manga adaptations that dominate the anime calendar.

Solo Leveling changed the calculus. Its first season attracted mainstream viewership well beyond the existing manhwa fanbase. Season 2, *Arise from the Shadow*, continued that momentum through 2025. The message received by studios and streaming platforms: manhwa readers exist in large numbers, they will watch anime adaptations of series they love, and they will recruit new viewers to do the same.

What follows from that message is the 2026 slate.

## Omniscient Reader's Viewpoint: The Benchmark Adaptation

**Omniscient Reader's Viewpoint** is the highest-stakes manhwa adaptation in history. The original series — sometimes abbreviated ORV — is a structurally complex, deeply self-referential story about a reader who finds himself inside the novel he's been reading for years. Its fanbase is not just large; it's *intense*. Readers have been waiting years for an adaptation that does the source material justice.

The confirmed first season runs 24 episodes, giving the adaptation enough runway to establish the series' distinctive tone and narrative architecture before the plot demands begin to compound. The studio and streaming deal details remain under wraps, but the 24-episode commitment signals serious investment.

ORV's adaptation challenge is substantial. The series' appeal is tied to literary self-awareness — its plot operates on multiple layers simultaneously, and much of its emotional power comes from the relationship between the protagonist and the story he's inside. Animation can convey action and character elegantly. Conveying meta-narrative in a format designed for linear viewing is considerably harder.

If the ORV adaptation works, it will demonstrate that the most ambitious manhwa can be adapted without compromise. If it doesn't, it will set an expectation that complex source material should be simplified for accessibility — which would be a significant loss for the medium.

## Tomb Raider King: The Commercial Bet

**Tomb Raider King**, based on creator SAN.G.'s series, is targeting a summer 2026 release. The Japanese dubbing is already confirmed, and the production has international streaming distribution in its sights.

Tomb Raider King is a different kind of adaptation proposition than ORV. Where ORV is a prestige play — an adaptation of a beloved literary manhwa — Tomb Raider King is a commercial bet on a consistently popular genre property. The dungeon-raiding, artifact-hunting premise translates cleanly into animation with high action potential and broad accessibility.

The creator's involvement in production is worth noting. Creator participation in adaptation processes varies enormously across the industry; SAN.G. being part of the process reduces the risk of the adaptation departing dramatically from the tone and characterization that made the source material work.

## True Beauty Season 2: The Romance Return

**True Beauty Season 2** is moving toward a mid-2026 window after its announcement in early 2025. The first season had a clean narrative arc; the second has the advantage of an established visual style and a fanbase that's had time to build expectations.

Romance manhwa adaptations face a specific challenge: the emotional beats that work in serialized reading — slow burn, delayed resolution, the drama of misunderstanding — are harder to sustain in animated form. True Beauty's adaptation strength is its visual design aesthetic, which translates naturally into the manga-influence animation style that's developed around webtoon adaptations.

## The Supporting Slate

*The Boxer* from Studio MIR arrived in late 2025 — a psychological sports thriller that defies easy categorization. Studio MIR's history with high-quality animation (*The Legend of Korra*, *Voltron: Legendary Defender*) suggests the visual execution will be strong.

*Dark Moon: The Lost Altar* landed on Crunchyroll in January 2026, a gothic urban fantasy with an ENHYPEN tie-in that blurs the line between anime and K-pop crossover product. Whether that's a feature or a bug depends on your relationship to both.

*Terror Man* aired on TVLing in January 2026, a Korean streaming platform adaptation that reached domestic audiences before any international distribution announcement.

*Bloodhounds Season 2*, based on the webtoon by Jeong Chan, is confirmed for Netflix in Q2 2026. The first season's noir-action tone translated well to live-action drama; the continuation has a clear audience and a platform with genuine global reach.

*The Remarried Empress* is heading to Disney+ in 2026, bringing one of manhwa's most beloved historical romance series to one of the world's largest streaming platforms.

## The Quality Test

The 2026 slate is the largest, most diverse slate of manhwa adaptations ever assembled for a single year. That's a genuine achievement. But large slates create quality risks — studios stretched thin, productions rushing to meet release windows, adaptations that prioritize speed over care.

The industry needs 2026's adaptations to succeed not just commercially but critically. Readers who have spent years advocating for manhwa's potential as adaptation source material are watching these productions closely. A wave of mediocre adaptations will set the medium back. A wave of strong ones will accelerate everything.

ORV is the one to watch. But so is every other title on this list.
    `.trim(),
    content_fr: `
Si 2024 a été l'année où Solo Leveling a prouvé que le manhwa pouvait ancrer une production anime premium, alors 2026 est l'année où l'industrie teste si c'était un coup de chance ou une formule reproductible. Le programme d'adaptations anime de manhwa confirmées pour 2026 est le plus ambitieux de l'histoire du medium — et la pression pour livrer est énorme.

## Pourquoi ce moment est différent

Les adaptations de manhwa en anime existaient avant Solo Leveling. *Tower of God* a reçu une adaptation en 2020. *The God of High School* a suivi la même année. Mais celles-ci étaient traitées comme des propriétés expérimentales — assez intéressantes pour être produites, mais pas censées rivaliser avec les adaptations de manga de premier rang qui dominent le calendrier anime.

Solo Leveling a changé le calcul. Sa première saison a attiré une audience grand public bien au-delà de la base de fans de manhwa existante. La saison 2, *Arise from the Shadow*, a maintenu cet élan tout au long de 2025. Le message reçu par les studios et les plateformes de streaming : les lecteurs de manhwa existent en grand nombre, ils regarderont des adaptations anime de séries qu'ils aiment, et ils recruteront de nouveaux spectateurs pour faire de même.

Ce qui découle de ce message est le programme 2026.

## Omniscient Reader's Viewpoint : l'adaptation référence

**Omniscient Reader's Viewpoint** est l'adaptation de manhwa la plus attendue de l'histoire. La série originale — parfois abrégée ORV — est une histoire structurellement complexe et profondément autoréférentielle sur un lecteur qui se retrouve à l'intérieur du roman qu'il a lu pendant des années. Sa fanbase n'est pas seulement grande ; elle est *intense*. Les lecteurs attendent depuis des années une adaptation qui rend justice au matériau source.

La première saison confirmée comprend 24 épisodes, donnant à l'adaptation suffisamment de marge pour établir le ton distinctif de la série et son architecture narrative avant que les exigences de l'intrigue ne commencent à se multiplier. Les détails du studio et de l'accord de streaming restent confidentiels, mais l'engagement de 24 épisodes signale un investissement sérieux.

Le défi d'adaptation d'ORV est substantiel. L'attrait de la série est lié à sa conscience littéraire — son intrigue fonctionne sur plusieurs couches simultanément, et une grande partie de sa puissance émotionnelle vient de la relation entre le protagoniste et l'histoire dans laquelle il se trouve. L'animation peut transmettre l'action et le caractère avec élégance. Transmettre une méta-narration dans un format conçu pour une visualisation linéaire est considérablement plus difficile.

Si l'adaptation d'ORV fonctionne, elle démontrera que le manhwa le plus ambitieux peut être adapté sans compromis. Si ce n'est pas le cas, elle fixera une attente selon laquelle le matériau source complexe devrait être simplifié pour l'accessibilité — ce qui serait une perte significative pour le medium.

## Tomb Raider King : le pari commercial

**Tomb Raider King**, basé sur la série du créateur SAN.G., vise une sortie à l'été 2026. Le doublage japonais est déjà confirmé, et la production vise la distribution sur des plateformes de streaming internationales.

Tomb Raider King est un type de proposition d'adaptation différent d'ORV. Là où ORV est un pari de prestige — une adaptation d'un manhwa littéraire très aimé — Tomb Raider King est un pari commercial sur une propriété de genre constamment populaire. La prémisse de raid de donjons et de chasse aux artefacts se traduit proprement en animation avec un fort potentiel d'action et une accessibilité large.

La participation du créateur à la production vaut la peine d'être notée. La participation des créateurs aux processus d'adaptation varie énormément dans l'industrie ; le fait que SAN.G. fasse partie du processus réduit le risque que l'adaptation s'éloigne dramatiquement du ton et de la caractérisation qui ont fait fonctionner le matériau source.

## True Beauty Saison 2 : le retour de la romance

**True Beauty Saison 2** se dirige vers une fenêtre mi-2026 après son annonce début 2025. La première saison avait un arc narratif propre ; la seconde a l'avantage d'un style visuel établi et d'une fanbase qui a eu le temps de construire ses attentes.

Les adaptations de manhwa de romance font face à un défi spécifique : les battements émotionnels qui fonctionnent dans la lecture sérialisée — la lente combustion, la résolution différée, le drame du malentendu — sont plus difficiles à maintenir sous forme animée. La force d'adaptation de True Beauty est son esthétique de design visuel, qui se traduit naturellement dans le style d'animation inspiré du manga qui s'est développé autour des adaptations de webtoons.

## Le programme de soutien

*The Boxer* du Studio MIR est arrivé fin 2025 — un thriller sportif psychologique qui défie toute catégorisation facile. L'histoire du Studio MIR avec l'animation de haute qualité (*La Légende de Korra*, *Voltron: Legendary Defender*) suggère que l'exécution visuelle sera forte.

*Dark Moon: The Lost Altar* a débarqué sur Crunchyroll en janvier 2026, une fantasy urbaine gothique avec un tie-in ENHYPEN qui brouille la frontière entre anime et produit dérivé de K-pop.

*Terror Man* a été diffusé sur TVLing en janvier 2026, une adaptation pour plateforme de streaming coréenne qui a atteint les audiences nationales avant toute annonce de distribution internationale.

*Bloodhounds Saison 2*, basé sur le webtoon de Jeong Chan, est confirmé pour Netflix au deuxième trimestre 2026. Le ton action-noir de la première saison s'est bien traduit en drame live-action ; la suite a un public clair et une plateforme avec une portée mondiale réelle.

*The Remarried Empress* se dirige vers Disney+ en 2026, amenant l'une des séries de romance historique les plus aimées du manhwa sur l'une des plus grandes plateformes de streaming mondiales.

## Le test de qualité

Le programme 2026 est le plus large et le plus diversifié jamais assemblé pour une seule année. C'est une véritable réalisation. Mais les grands programmes créent des risques de qualité — des studios étirés à leur limite, des productions qui se précipitent pour respecter les fenêtres de sortie, des adaptations qui privilégient la vitesse à l'attention.

L'industrie a besoin que les adaptations de 2026 réussissent non seulement commercialement mais aussi de façon critique. Les lecteurs qui ont passé des années à défendre le potentiel d'adaptation du manhwa regardent de près ces productions. Une vague d'adaptations médiocres fera reculer le medium. Une vague de bonnes accélérera tout.

ORV est celle à surveiller. Mais aussi chaque autre titre de cette liste.
    `.trim(),
  },

  // ─── 7. Market Paradox ───────────────────────────────────────────────────────
  {
    source_url: 'news:webtoon-market-paradox:20260214',
    reading_time: 5,
    content_en: `
Two numbers define the webtoon industry heading into 2026, and they seem to contradict each other.

The **global webtoon market hit $9.7 billion** in 2025, with projections pointing toward **$12.6 billion by 2026** and an estimated **$140 billion by 2035**. Meanwhile, Korea's domestic market — the one that invented webtoons — **slowed sharply in the first half of 2025**, as platforms reached saturation and user growth stalled.

This isn't a contradiction. It's a map.

## What's Happening Inside Korea

The Korean webtoon market's slowdown in H1 2025 is a consolidation story. After years of aggressive platform expansion — during which Naver Webtoon, Kakao Page, and Lezhin all competed fiercely for creator partnerships and reader acquisition — the domestic market ran out of easily addressable growth.

The numbers behind the slowdown are multi-dimensional. **User growth slowed** as smartphone penetration reached saturation among the demographics most likely to be webtoon readers. **Platform spending** on original content acquisition compressed as companies moved toward profitability discipline. **Creator acquisition costs** rose as popular creators became more sophisticated about negotiating terms.

The result was a market that continued generating revenue but stopped generating the growth rates that had characterized the preceding decade. By industry metrics, this looks like a slowdown. By historical metrics, this looks like a mature market.

## The Currency Problem

Complicating matters: **Webtoon Entertainment's Nasdaq IPO** exposed the company to structural currency risk that didn't exist when it was privately held.

The company earns the majority of its revenue in Korean won, but its shares are denominated in USD. When the Korean won weakened against the dollar through late 2025, Webtoon Entertainment's reported earnings came under pressure even as the underlying business remained stable. This isn't an operational problem — it's an accounting problem — but it shapes investor perception and creates pressure to grow dollar-denominated revenue streams: international markets, licensing deals, co-productions.

That currency pressure is, ironically, an acceleration mechanism for the platform's global ambitions. The financial incentive to develop international revenue is now greater than it's ever been.

## What's Happening Outside Korea

Outside Korea, webtoon is still a growth story — and the gap between domestic deceleration and global acceleration is the defining tension in the industry's current chapter.

**Lezhin Comics** invested **$12 million in a Paris animation studio** in May 2025, signaling that European webtoon adaptation is a strategic priority, not an experiment. French manga and comics markets are among the most developed in the world outside Japan; building animation production capacity in Paris positions Lezhin to serve both the adaptation pipeline and potential co-productions with European partners.

**WEBTOON** is pursuing Hollywood partnerships with Disney and Warner Bros. while simultaneously launching Cuts, its short-form video feature designed to extend manhwa content into social media ecosystems.

**KOMACON** is funding 250 new projects specifically designed for genre diversification — both to improve domestic creative health and to produce content legible to international audiences who don't share Korean genre conventions around romance and fantasy.

## The Creator Economy in Transition

For individual creators, the domestic slowdown and global acceleration create specific pressures.

**Top-tier creators** — those with established series and proven audience numbers — are in a stronger position than ever. Global interest in manhwa IP means their properties have potential beyond the platform they publish on. Adaptation conversations, licensing deals, and international distribution opportunities that were speculative five years ago are now concrete.

**Emerging creators** face more complexity. Platforms rationalizing their original content investments means fewer greenlight decisions and more rigorous performance requirements before investment is extended. The government's KOMACON funding is a partial counterweight, but $14,000 per project doesn't replace platform investment at scale.

**The genre question** is particularly acute. The domestic market's romance and fantasy dominance created reliable revenue but limited creative diversity. The push for genre diversification — from KOMACON, from international audiences, from creators who want to tell different stories — is real. But the market dynamics that made romance and fantasy dominant haven't fundamentally changed. New genres have to earn their audience against established competition.

## The Long View

The webtoon paradox — a decelerating domestic market inside a rapidly growing global industry — is not temporary. It's structural.

Korea will likely never again be the primary growth engine for the webtoon industry it invented. The global market is growing faster than the domestic market and will eventually dwarf it. The center of webtoon readership is shifting toward Southeast Asia, Europe, and North and South America.

That shift is good news for the medium's long-term health: a format dependent on a single national market is fragile. A format with genuinely global readership is resilient.

But it creates a specific challenge for Korean creators and platforms. Building for a global audience requires different creative decisions than building for a domestic audience. The stories that resonate universally aren't always the same as the stories that dominate at home.

The webtoon industry's next decade will be defined by how well Korean creators and platforms navigate that gap — and whether the global infrastructure for manhwa readership can catch up with the global appetite for it.
    `.trim(),
    content_fr: `
Deux chiffres définissent l'industrie du webtoon à l'aube de 2026, et ils semblent se contredire.

Le **marché mondial du webtoon a atteint 9,7 milliards de dollars** en 2025, avec des projections pointant vers **12,6 milliards en 2026** et une estimation de **140 milliards d'ici 2035**. Pendant ce temps, le marché coréen — celui qui a inventé le webtoon — **a ralenti fortement au premier semestre 2025**, les plateformes ayant atteint une saturation et la croissance des utilisateurs s'étant stabilisée.

Ce n'est pas une contradiction. C'est une carte.

## Ce qui se passe en Corée

Le ralentissement du marché coréen du webtoon au premier semestre 2025 est une histoire de consolidation. Après des années d'expansion agressive des plateformes — pendant lesquelles Naver Webtoon, Kakao Page et Lezhin ont tous rivalisé férocement pour les partenariats de créateurs et l'acquisition de lecteurs — le marché domestique a épuisé la croissance facilement adressable.

Les chiffres derrière le ralentissement sont multidimensionnels. **La croissance des utilisateurs a ralenti** à mesure que la pénétration des smartphones atteignait la saturation parmi les démographies les plus susceptibles d'être des lecteurs de webtoons. **Les dépenses des plateformes** en acquisition de contenu original se sont comprimées à mesure que les entreprises se tournaient vers la discipline de rentabilité. **Les coûts d'acquisition des créateurs** ont augmenté à mesure que les créateurs populaires sont devenus plus sophistiqués dans la négociation de leurs conditions.

Le résultat était un marché qui continuait à générer des revenus mais avait cessé de générer les taux de croissance qui avaient caractérisé la décennie précédente.

## Le problème de la devise

Pour compliquer les choses : **l'introduction en bourse de Webtoon Entertainment au Nasdaq** a exposé l'entreprise à un risque de change structurel qui n'existait pas quand elle était privée.

L'entreprise gagne la majorité de ses revenus en wons coréens, mais ses actions sont libellées en dollars. Quand le won coréen s'est affaibli face au dollar au cours de la fin 2025, les bénéfices déclarés de Webtoon Entertainment ont subi des pressions même si l'activité sous-jacente restait stable. Ce n'est pas un problème opérationnel — c'est un problème comptable — mais il façonne la perception des investisseurs et crée une pression pour développer des flux de revenus libellés en dollars : marchés internationaux, accords de licence, co-productions.

Cette pression sur les devises est, ironiquement, un mécanisme d'accélération pour les ambitions mondiales de la plateforme.

## Ce qui se passe hors de Corée

Hors de Corée, le webtoon reste une histoire de croissance — et l'écart entre la décélération domestique et l'accélération mondiale est la tension définissante dans le chapitre actuel de l'industrie.

**Lezhin Comics** a investi **12 millions de dollars dans un studio d'animation parisien** en mai 2025, signalant que l'adaptation du webtoon en Europe est une priorité stratégique, pas une expérimentation. Les marchés du manga et de la bande dessinée français sont parmi les plus développés au monde en dehors du Japon ; construire une capacité de production d'animation à Paris positionne Lezhin pour servir à la fois le pipeline d'adaptation et de potentielles co-productions avec des partenaires européens.

**WEBTOON** poursuit des partenariats hollywoodiens avec Disney et Warner Bros. tout en lançant simultanément Cuts, sa fonctionnalité vidéo format court conçue pour étendre le contenu manhwa dans les écosystèmes des médias sociaux.

**KOMACON** finance 250 nouveaux projets spécifiquement conçus pour la diversification des genres — à la fois pour améliorer la santé créative domestique et pour produire du contenu lisible pour les audiences internationales.

## L'économie créative en transition

Pour les créateurs individuels, le ralentissement domestique et l'accélération mondiale créent des pressions spécifiques.

**Les créateurs de premier rang** — ceux avec des séries établies et des chiffres d'audience prouvés — sont en meilleure position que jamais. L'intérêt mondial pour les IP de manhwa signifie que leurs propriétés ont un potentiel au-delà de la plateforme sur laquelle ils publient.

**Les créateurs émergents** font face à plus de complexité. Les plateformes rationalisant leurs investissements en contenu original signifient moins de décisions de feu vert et des exigences de performance plus rigoureuses avant que l'investissement ne soit étendu. Le financement gouvernemental de la KOMACON est un contrepoids partiel, mais 14 000 $ par projet ne remplace pas l'investissement de plateforme à grande échelle.

## La vision à long terme

Le paradoxe du webtoon — un marché domestique qui décélère à l'intérieur d'une industrie mondiale en croissance rapide — n'est pas temporaire. Il est structurel.

La Corée ne sera probablement plus jamais le principal moteur de croissance de l'industrie du webtoon qu'elle a inventée. Le marché mondial croît plus vite que le marché domestique et finira par l'éclipser. Le centre de lecture du webtoon se déplace vers l'Asie du Sud-Est, l'Europe et l'Amérique du Nord et du Sud.

Ce changement est une bonne nouvelle pour la santé à long terme du medium. Mais il crée un défi spécifique pour les créateurs et plateformes coréens. Créer pour une audience mondiale nécessite des décisions créatives différentes que créer pour une audience domestique.

La prochaine décennie de l'industrie du webtoon sera définie par la façon dont les créateurs et les plateformes coréens naviguent cet écart — et si l'infrastructure mondiale pour la lecture de manhwa peut rattraper l'appétit mondial pour elle.
    `.trim(),
  },

]

async function main() {
  console.log(`\nExpanding ${EXPANSIONS.length} articles...\n`)

  for (const item of EXPANSIONS) {
    const result = await prisma.article.updateMany({
      where: { source_url: item.source_url },
      data: {
        content_en: item.content_en,
        content_fr: item.content_fr,
        reading_time: item.reading_time,
      },
    })
    if (result.count > 0) {
      console.log(`  ✓ Expanded (${item.reading_time} min): ${item.source_url}`)
    } else {
      console.log(`  ⚠ Not found: ${item.source_url}`)
    }
  }

  console.log('\nDone.\n')
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
