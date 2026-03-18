import { Badge } from '@/components/ui/Badge'

const STATUS_LABELS: Record<string, { fr: string; en: string }> = {
  READING: { fr: 'En cours', en: 'Reading' },
  COMPLETED: { fr: 'Terminé', en: 'Completed' },
  PLAN_TO_READ: { fr: 'À lire', en: 'Plan to Read' },
  ON_HOLD: { fr: 'En pause', en: 'On Hold' },
  DROPPED: { fr: 'Abandonné', en: 'Dropped' },
  REREADING: { fr: 'Relecteur', en: 'Rereading' },
}

const STATUS_VARIANT: Record<string, 'status' | 'type' | 'danger'> = {
  READING: 'status',
  COMPLETED: 'status',
  PLAN_TO_READ: 'type',
  ON_HOLD: 'type',
  DROPPED: 'danger',
  REREADING: 'status',
}

interface Props {
  status: string
  locale?: string
}

export function LibraryStatusBadge({ status, locale = 'en' }: Props) {
  const label = STATUS_LABELS[status]?.[locale as 'fr' | 'en'] ?? status
  const variant = STATUS_VARIANT[status] ?? 'type'
  return <Badge variant={variant}>{label}</Badge>
}
