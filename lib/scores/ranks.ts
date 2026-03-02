export interface Rank {
  slug: string
  label: string
  labelKr: string
  creature: string
  creatureKr: string
  minScore: number
  maxScore: number
  color: string
  colorGlow: string
}

export const RANKS: Rank[] = [
  {
    slug: 'sss-rank', label: 'SSS-Rank', labelKr: 'SSS급',
    creature: 'Hwanin', creatureKr: '환인',
    minScore: 10, maxScore: 10,
    color: '#FFFFFF', colorGlow: 'rgba(255,255,255,0.6)',
  },
  {
    slug: 'ss-rank', label: 'SS-Rank', labelKr: 'SS급',
    creature: 'Cheong-ryong', creatureKr: '청룡',
    minScore: 9.5, maxScore: 9.99,
    color: '#E879F9', colorGlow: 'rgba(232,121,249,0.4)',
  },
  {
    slug: 's-rank', label: 'S-Rank', labelKr: 'S급',
    creature: 'Gumiho', creatureKr: '구미호',
    minScore: 9.0, maxScore: 9.49,
    color: '#C9A84C', colorGlow: 'rgba(201,168,76,0.4)',
  },
  {
    slug: 'a-rank', label: 'A-Rank', labelKr: 'A급',
    creature: 'Imugi', creatureKr: '이무기',
    minScore: 8.0, maxScore: 8.99,
    color: '#F59E0B', colorGlow: 'rgba(245,158,11,0.3)',
  },
  {
    slug: 'b-rank', label: 'B-Rank', labelKr: 'B급',
    creature: 'Bulgasari', creatureKr: '불가사리',
    minScore: 7.0, maxScore: 7.99,
    color: '#10B981', colorGlow: 'rgba(16,185,129,0.3)',
  },
  {
    slug: 'c-rank', label: 'C-Rank', labelKr: 'C급',
    creature: 'Haetae', creatureKr: '해태',
    minScore: 6.0, maxScore: 6.99,
    color: '#3B82F6', colorGlow: 'rgba(59,130,246,0.3)',
  },
  {
    slug: 'd-rank', label: 'D-Rank', labelKr: 'D급',
    creature: 'Dokkaebi', creatureKr: '도깨비',
    minScore: 4.0, maxScore: 5.99,
    color: '#8B5CF6', colorGlow: 'rgba(139,92,246,0.2)',
  },
  {
    slug: 'e-rank', label: 'E-Rank', labelKr: 'E급',
    creature: 'Slime', creatureKr: '슬라임',
    minScore: 0, maxScore: 3.99,
    color: '#6B7280', colorGlow: 'rgba(107,114,128,0.2)',
  },
]

export function getRankFromScore(score: number | null, voteCount: number): Rank | null {
  if (score === null || voteCount < 10) return null
  return RANKS.find(r => score >= r.minScore && score <= r.maxScore) ?? null
}
