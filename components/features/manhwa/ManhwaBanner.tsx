import Image from 'next/image'

interface ManhwaBannerProps {
  bannerUrl: string | null
  coverUrl: string | null
  title: string
}

export function ManhwaBanner({ bannerUrl }: ManhwaBannerProps) {
  if (!bannerUrl) return null

  return (
    <div className="relative -z-10 h-[180px] w-full overflow-hidden md:h-[250px]">
      <Image
        src={bannerUrl}
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-base via-base/70 to-transparent" />
    </div>
  )
}
