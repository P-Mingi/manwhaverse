'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useRef } from 'react'

interface RichEditorProps {
  name: string
  placeholder?: string
  defaultValue?: string
  onChange?: (html: string) => void
}

const TOOLBAR_BTN = 'rounded px-2 py-1 text-xs font-medium text-text-secondary hover:bg-elevated hover:text-text-primary disabled:opacity-30'
const TOOLBAR_BTN_ACTIVE = 'rounded px-2 py-1 text-xs font-medium bg-elevated text-crystal-blue'

export function RichEditor({ name, placeholder = 'Start writing…', defaultValue = '', onChange }: RichEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: 'min-h-[200px] focus:outline-none prose prose-invert prose-sm max-w-none',
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML()
      if (inputRef.current) inputRef.current.value = html
      onChange?.(html)
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  return (
    <div className="rounded-lg border border-border bg-elevated overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border-b border-border bg-base/50 px-2 py-1.5">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}><em>I</em></button>
        <span className="mx-1 border-l border-border" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}>H3</button>
        <span className="mx-1 border-l border-border" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}>• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}>1. List</button>
        <span className="mx-1 border-l border-border" />
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}>" Quote</button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? TOOLBAR_BTN_ACTIVE : TOOLBAR_BTN}>{'<>'}</button>
      </div>

      {/* Editor area */}
      <div className="px-4 py-3 text-text-primary [&_.tiptap_p.is-editor-empty:first-child::before]:text-text-muted [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:h-0">
        <EditorContent editor={editor} />
      </div>

      {/* Hidden input to carry value through form submission */}
      <input ref={inputRef} type="hidden" name={name} defaultValue={defaultValue} />
    </div>
  )
}
