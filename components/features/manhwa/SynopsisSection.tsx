'use client'

import { useState } from 'react'

interface Props {
  synopsis: string
}

export function SynopsisSection({ synopsis }: Props) {
  const [expanded, setExpanded] = useState(false)
  const isLong = synopsis.length > 400

  return (
    <div>
      <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Synopsis
      </h2>
      <p
        style={{
          margin: 0,
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          overflow: isLong && !expanded ? 'hidden' : undefined,
          display: isLong && !expanded ? '-webkit-box' : undefined,
          WebkitLineClamp: isLong && !expanded ? 6 : undefined,
          WebkitBoxOrient: isLong && !expanded ? 'vertical' : undefined,
        }}
      >
        {synopsis}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((p) => !p)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--accent)',
            fontSize: '12px',
            fontWeight: 600,
            padding: '0.5rem 0 0',
            display: 'block',
          }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}
