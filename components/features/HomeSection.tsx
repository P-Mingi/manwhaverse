import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

interface HomeSectionProps {
  title: string
  viewAllHref: string
  locale: string
  children: React.ReactNode
}

export async function HomeSection({ title, viewAllHref, locale, children }: HomeSectionProps) {
  const t = await getTranslations({ locale, namespace: 'common' })

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title-bar font-display text-xl">{title}</h2>
        <Link href={viewAllHref} className="text-sm text-[#00ffff] hover:underline">
          {t('seeAll')}
        </Link>
      </div>
      {children}
    </section>
  )
}
