/**
 * Seed script: creates sample polls for top manhwas + 1 global poll.
 * Usage: npx tsx scripts/seed-polls.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Global poll
  const globalPoll = await prisma.poll.create({
    data: {
      question_en: 'What type of manhwa protagonist do you prefer?',
      question_fr: 'Quel type de protagoniste de manhwa préférez-vous ?',
      is_active: true,
      options: {
        create: [
          { label_en: 'Overpowered from the start', label_fr: 'Surpuissant dès le début', position: 0 },
          { label_en: 'Underdog who grows stronger', label_fr: 'Outsider qui devient plus fort', position: 1 },
          { label_en: 'Strategic/intelligent hero', label_fr: 'Héros stratège/intelligent', position: 2 },
          { label_en: 'Anti-hero / morally grey', label_fr: 'Anti-héros / moralement ambigu', position: 3 },
        ],
      },
    },
  })
  console.log(`Created global poll: ${globalPoll.id}`)

  // 2. Find top 5 popular manhwa with characters
  const topManhwas = await prisma.manhwa.findMany({
    where: { is_published: true },
    orderBy: { reader_count: 'desc' },
    take: 5,
    select: { id: true, title_en: true },
  })

  const manhwaPollQuestions = [
    { en: 'What do you enjoy most about this series?', fr: 'Qu\'est-ce que vous aimez le plus dans cette série ?' },
    { en: 'How would you rate the pacing?', fr: 'Comment évaluez-vous le rythme ?' },
    { en: 'Which arc is your favorite?', fr: 'Quel arc est votre préféré ?' },
    { en: 'Would you recommend this to a new reader?', fr: 'Recommanderiez-vous cette série à un nouveau lecteur ?' },
    { en: 'What could be improved?', fr: 'Que pourrait-on améliorer ?' },
  ]

  const optionSets = [
    [
      { en: 'The art style', fr: 'Le style artistique' },
      { en: 'The story & plot', fr: 'L\'histoire & l\'intrigue' },
      { en: 'The characters', fr: 'Les personnages' },
      { en: 'The action scenes', fr: 'Les scènes d\'action' },
    ],
    [
      { en: 'Too slow', fr: 'Trop lent' },
      { en: 'Just right', fr: 'Parfait' },
      { en: 'Too fast', fr: 'Trop rapide' },
      { en: 'Inconsistent', fr: 'Irrégulier' },
    ],
    [
      { en: 'Beginning arc', fr: 'Arc du début' },
      { en: 'Middle arc', fr: 'Arc du milieu' },
      { en: 'Latest arc', fr: 'Arc le plus récent' },
      { en: 'All equally good', fr: 'Tous aussi bons' },
    ],
    [
      { en: 'Absolutely yes!', fr: 'Absolument oui !' },
      { en: 'Yes, with warnings', fr: 'Oui, avec des réserves' },
      { en: 'Maybe', fr: 'Peut-être' },
      { en: 'Not really', fr: 'Pas vraiment' },
    ],
    [
      { en: 'More character depth', fr: 'Plus de profondeur des personnages' },
      { en: 'Better pacing', fr: 'Meilleur rythme' },
      { en: 'More world-building', fr: 'Plus de world-building' },
      { en: 'Nothing, it\'s perfect', fr: 'Rien, c\'est parfait' },
    ],
  ]

  for (let i = 0; i < topManhwas.length; i++) {
    const manhwa = topManhwas[i]!
    const q = manhwaPollQuestions[i]!
    const opts = optionSets[i]!

    const poll = await prisma.poll.create({
      data: {
        question_en: q.en,
        question_fr: q.fr,
        manhwa_id: manhwa.id,
        is_active: true,
        options: {
          create: opts.map((o, idx) => ({
            label_en: o.en,
            label_fr: o.fr,
            position: idx,
          })),
        },
      },
    })
    console.log(`Created poll for "${manhwa.title_en}": ${poll.id}`)
  }

  console.log('Done seeding polls!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
