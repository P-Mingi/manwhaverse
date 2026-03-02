/**
 * Seed script: creates sample blog articles.
 * Usage: npx tsx scripts/seed-articles.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const articles = [
  {
    slug: 'best-manhwa-2025',
    title_en: 'The 10 Best Manhwa of 2025',
    title_fr: 'Les 10 meilleurs manhwa de 2025',
    excerpt_en: 'Our curated list of the must-read manhwa titles released or continued in 2025.',
    excerpt_fr: 'Notre sélection des manhwa incontournables sortis ou poursuivis en 2025.',
    content_en: `# The 10 Best Manhwa of 2025

2025 has been an incredible year for manhwa. From breathtaking art to captivating storytelling, Korean webtoons continue to push the boundaries of what's possible in the medium.

## What Makes These Titles Stand Out?

We evaluated each title based on:
- **Art quality** — consistency, detail, and visual storytelling
- **Story depth** — world-building, character development, plot complexity
- **Community reception** — reader scores and engagement
- **Cultural impact** — influence on the genre and community discussions

## The List

Stay tuned as we reveal our picks throughout the month!

---

*What are your top manhwa of 2025? Share your thoughts in the comments!*`,
    content_fr: `# Les 10 meilleurs manhwa de 2025

2025 a été une année incroyable pour les manhwa. De l'art époustouflant à une narration captivante, les webtoons coréens continuent de repousser les limites du medium.

## Qu'est-ce qui distingue ces titres ?

Nous avons évalué chaque titre selon :
- **Qualité artistique** — consistance, détails et narration visuelle
- **Profondeur de l'histoire** — world-building, développement des personnages, complexité de l'intrigue
- **Réception communautaire** — scores et engagement des lecteurs
- **Impact culturel** — influence sur le genre et discussions communautaires

## La Liste

Restez connectés, nous révélerons nos choix tout au long du mois !

---

*Quels sont vos meilleurs manhwa de 2025 ? Partagez vos avis !*`,
    category: 'LIST' as const,
    author_name: 'ManhwaVerse Team',
    reading_time: 8,
  },
  {
    slug: 'beginner-guide-manhwa',
    title_en: "Beginner's Guide: How to Start Reading Manhwa",
    title_fr: 'Guide du débutant : comment commencer à lire des manhwa',
    excerpt_en: 'New to manhwa? Here is everything you need to know to get started.',
    excerpt_fr: 'Nouveau dans les manhwa ? Voici tout ce qu\'il faut savoir pour commencer.',
    content_en: `# Beginner's Guide: How to Start Reading Manhwa

## What is Manhwa?

Manhwa (만화) refers to Korean comics and webtoons. Unlike Japanese manga, manhwa is typically read vertically (scroll format) and published in full color.

## Where to Read

There are many legitimate platforms to read manhwa:
- **Webtoon** — The largest platform with many free titles
- **Tapas** — Great for indie creators
- **Tappytoon** — Premium titles with official translations
- **Lezhin Comics** — Known for mature content and high quality

## Recommended Starter Titles

1. **Solo Leveling** — The gateway manhwa for many readers
2. **Tower of God** — Epic world-building and complex plot
3. **The Beginning After the End** — Isekai done right
4. **Omniscient Reader's Viewpoint** — Meta-narrative masterpiece

## Tips for New Readers

- Start with completed series if you don't like waiting
- Use ManhwaVerse to track your reading progress
- Join the community to get personalized recommendations

Happy reading!`,
    content_fr: `# Guide du débutant : comment commencer à lire des manhwa

## Qu'est-ce qu'un manhwa ?

Manhwa (만화) désigne les bandes dessinées et webtoons coréens. Contrairement aux mangas japonais, les manhwa se lisent généralement verticalement (format scroll) et sont publiés en couleur.

## Où lire

Il existe de nombreuses plateformes légitimes :
- **Webtoon** — La plus grande plateforme avec de nombreux titres gratuits
- **Tapas** — Idéal pour les créateurs indépendants
- **Tappytoon** — Titres premium avec traductions officielles
- **Lezhin Comics** — Connu pour son contenu mature et sa qualité

## Titres recommandés pour débuter

1. **Solo Leveling** — Le manhwa d'introduction pour beaucoup de lecteurs
2. **Tower of God** — World-building épique et intrigue complexe
3. **The Beginning After the End** — L'isekai bien fait
4. **Omniscient Reader's Viewpoint** — Chef-d'œuvre de méta-narration

## Conseils pour les nouveaux lecteurs

- Commencez par des séries terminées si vous n'aimez pas attendre
- Utilisez ManhwaVerse pour suivre votre progression
- Rejoignez la communauté pour des recommandations personnalisées

Bonne lecture !`,
    category: 'GUIDE' as const,
    author_name: 'ManhwaVerse Team',
    reading_time: 5,
  },
  {
    slug: 'rise-of-murim-manhwa',
    title_en: 'The Rise of Murim Manhwa: Why Martial Arts Stories Dominate',
    title_fr: 'L\'essor des manhwa Murim : pourquoi les histoires d\'arts martiaux dominent',
    excerpt_en: 'Exploring the murim genre explosion and what makes these martial arts manhwa so addictive.',
    excerpt_fr: 'Exploration de l\'explosion du genre murim et ce qui rend ces manhwa d\'arts martiaux si addictifs.',
    content_en: `# The Rise of Murim Manhwa

The murim (martial arts world) genre has exploded in popularity over the past few years. But what exactly is driving this trend?

## What is Murim?

Murim literally translates to "martial arts forest" — it refers to a fictional world where martial artists live, train, and compete. Think of it as Korea's answer to Chinese wuxia.

## Key Elements

- **Cultivation systems** — Characters grow stronger through training and enlightenment
- **Sect politics** — Power dynamics between martial arts schools
- **Revenge arcs** — A classic motivation that never gets old
- **Overpowered protagonists** — The power fantasy we all love

## Why It Works

The murim setting provides a perfect framework for:
1. Clear power progression that readers can follow
2. Rich world-building with established conventions
3. Exciting action sequences
4. Satisfying underdog stories

The genre shows no signs of slowing down!`,
    content_fr: null,
    category: 'ANALYSIS' as const,
    author_name: 'ManhwaVerse Team',
    reading_time: 6,
  },
  {
    slug: 'manhwa-vs-manga-2025',
    title_en: 'Manhwa vs Manga in 2025: The Shift in Global Readership',
    title_fr: 'Manhwa vs Manga en 2025 : le basculement du lectorat mondial',
    excerpt_en: 'How Korean webtoons are changing the global comics landscape and challenging manga dominance.',
    excerpt_fr: 'Comment les webtoons coréens changent le paysage mondial de la BD et défient la domination du manga.',
    content_en: `# Manhwa vs Manga in 2025

The global comics landscape is shifting. While manga remains dominant, manhwa is rapidly closing the gap.

## By the Numbers

- Webtoon platform: 89M monthly active users
- Korean content exports: $12.5B in 2024
- Animated adaptations of manhwa: up 340% since 2020

## What Manhwa Does Differently

### Full Color
Every manhwa is published in full color, making it more accessible to new readers.

### Vertical Scroll Format
Optimized for mobile reading, which is how most people consume content today.

### Faster Release Cycles
Weekly chapters are the norm, keeping readers engaged.

## The Future

As more manhwa get animated adaptations and global distribution deals, expect the gap to narrow even further.`,
    content_fr: null,
    category: 'OPINION' as const,
    author_name: 'ManhwaVerse Team',
    reading_time: 4,
  },
]

async function main() {
  for (const article of articles) {
    const created = await prisma.article.create({
      data: {
        ...article,
        status: 'PUBLISHED',
        published_at: new Date(),
      },
    })
    console.log(`Created article: "${created.title_en}" (${created.slug})`)
  }

  console.log(`\nDone! Created ${articles.length} articles.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
