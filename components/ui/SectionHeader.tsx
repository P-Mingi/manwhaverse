import Link from 'next/link'

interface SectionHeaderProps {
  title: string
  href?: string
  seeAllLabel?: string
}

export function SectionHeader({ title, href, seeAllLabel = 'See all →' }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div className="section-title">
        <div className="section-title-dot" />
        {title}
      </div>
      {href && (
        <Link href={href} className="section-see-all">{seeAllLabel}</Link>
      )}
    </div>
  )
}
