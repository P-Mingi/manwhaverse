'use client'

import { useState } from 'react'
import Link from 'next/link'

interface NewsGeneratorButtonProps {
  locale: string
}

type Status = 'idle' | 'loading' | 'done' | 'error'

export function NewsGeneratorButton({ locale }: NewsGeneratorButtonProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<{ created: number; duplicates: number; failed: number } | null>(null)

  async function run() {
    setStatus('loading')
    setResult(null)
    try {
      const res = await fetch('/api/admin/run-news-pipeline', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      setResult(data)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">News Generator</p>
          <p className="text-xs text-text-muted">Scrape RSS feeds + generate AI articles</p>
        </div>
        <Link
          href={`/${locale}/admin/news`}
          className="text-xs text-crystal-blue hover:underline"
        >
          Review drafts →
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={status === 'loading'}
          className="rounded-lg border border-[rgba(0,255,255,0.25)] bg-[rgba(0,255,255,0.08)] px-4 py-2 text-sm font-medium text-[#00bfff] transition-all hover:border-[rgba(0,255,255,0.4)] hover:bg-[rgba(0,255,255,0.12)] disabled:opacity-50"
        >
          {status === 'loading' ? 'Running…' : 'Run pipeline'}
        </button>

        {status === 'done' && result && (
          <span className="text-xs text-text-secondary">
            ✓ {result.created} new · {result.duplicates} skipped · {result.failed} failed
          </span>
        )}
        {status === 'error' && (
          <span className="text-xs text-error">Pipeline failed — check server logs</span>
        )}
      </div>
    </div>
  )
}
