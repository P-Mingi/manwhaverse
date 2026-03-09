'use client'

import { useState, useTransition } from 'react'
import { addFanArtCommentAction } from '@/lib/actions/fan-art'

interface Props {
  postId: string
  parentId?: string
  placeholder: string
  submitLabel: string
  onDone?: () => void
}

export function CommentForm({ postId, parentId, placeholder, submitLabel, onDone }: Props) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    startTransition(async () => {
      await addFanArtCommentAction({ postId, content: content.trim(), parentId })
      setContent('')
      onDone?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        maxLength={1000}
        className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-crystal-blue focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="rounded-lg bg-crystal-blue px-4 py-2 text-sm font-medium text-white hover:bg-crystal-blue/90 disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </form>
  )
}
