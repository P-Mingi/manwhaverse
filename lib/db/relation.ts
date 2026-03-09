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

  const seen = new Set<string>()
  const relations: RelationWithManhwa[] = []

  for (const r of asSource) {
    if (!seen.has(r.target.id)) {
      seen.add(r.target.id)
      relations.push({ relation_type: r.relation_type, direction: 'source', manhwa: r.target })
    }
  }
  for (const r of asTarget) {
    if (!seen.has(r.source.id)) {
      seen.add(r.source.id)
      relations.push({ relation_type: r.relation_type, direction: 'target', manhwa: r.source })
    }
  }

  return relations
}
