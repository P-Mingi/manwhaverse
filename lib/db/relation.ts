import { prisma } from './client'
import type { Prisma } from '@prisma/client'

const relationSelect = {
  id: true,
  slug: true,
  title_en: true,
  title_fr: true,
  cover_url: true,
  type: true,
  status: true,
} satisfies Prisma.ManhwaSelect

export type RelationWithManhwa = {
  relation_type: string
  direction: 'source' | 'target'
  manhwa: Prisma.ManhwaGetPayload<{ select: typeof relationSelect }>
}

export async function getRelationsByManhwaId(
  manhwaId: string
): Promise<RelationWithManhwa[]> {
  const [asSource, asTarget] = await Promise.all([
    prisma.manhwaRelation.findMany({
      where: { source_id: manhwaId },
      include: { target: { select: relationSelect } },
    }),
    prisma.manhwaRelation.findMany({
      where: { target_id: manhwaId },
      include: { source: { select: relationSelect } },
    }),
  ])

  const relations: RelationWithManhwa[] = [
    ...asSource.map((r) => ({
      relation_type: r.relation_type,
      direction: 'source' as const,
      manhwa: r.target,
    })),
    ...asTarget.map((r) => ({
      relation_type: r.relation_type,
      direction: 'target' as const,
      manhwa: r.source,
    })),
  ]

  return relations
}
