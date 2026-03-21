import { getAdminStats } from '@/lib/db/admin'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'text-crystal-blue' },
    { label: 'Real Users', value: stats.realUsers, color: 'text-green-500' },
    { label: 'Seed Users', value: stats.seedUsers, color: 'text-text-muted' },
    { label: 'Banned', value: stats.bannedUsers, color: 'text-red-500' },
    { label: 'Manhwas', value: stats.totalManhwas, color: 'text-purple-500' },
    { label: 'Reviews', value: stats.totalReviews, color: 'text-yellow-500' },
    { label: 'Reactions', value: stats.totalReactions, color: 'text-pink-500' },
  ]

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Overview</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg bg-elevated p-4">
            <p className="text-xs text-text-muted">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>
              {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
