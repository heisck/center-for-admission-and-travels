'use client'

import { useEffect, useRef } from 'react'
import { mergeAttributes, type Editor } from '@tiptap/core'
import BulletList from '@tiptap/extension-bullet-list'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { DOMParser as ProseMirrorDOMParser } from '@tiptap/pm/model'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { contentToSafeHtml } from '@/lib/safe-html'
import { plainTextToHtml } from '@/lib/plain-text-to-html'

type BlogRichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

type ToolbarButtonProps = {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

const StyledBulletList = BulletList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyle: {
        default: 'disc',
        parseHTML: (element) =>
          element.getAttribute('data-list-style') === 'circle' ? 'circle' : 'disc',
        renderHTML: (attributes) => ({
          'data-list-style': attributes.listStyle === 'circle' ? 'circle' : 'disc',
        }),
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['ul', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
})

function CircleListIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="4" cy="6" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="4" cy="18" r="1.5" />
      <path d="M8 6h12M8 12h12M8 18h12" />
    </svg>
  )
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex h-11 min-w-11 items-center justify-center rounded-lg px-2.5 text-slate-600',
        'transition-colors hover:bg-orange-50 hover:text-orange-700',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-35',
        active && 'bg-primary text-white shadow-sm hover:bg-primary hover:text-white'
      )}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="mx-1 w-px self-stretch bg-border" aria-hidden="true" />
}

function setBulletListStyle(editor: Editor, listStyle: 'disc' | 'circle') {
  if (editor.isActive('bulletList', { listStyle })) {
    editor.chain().focus().toggleBulletList().run()
    return
  }

  if (editor.isActive('bulletList')) {
    editor.chain().focus().updateAttributes('bulletList', { listStyle }).run()
    return
  }

  editor
    .chain()
    .focus()
    .toggleBulletList()
    .updateAttributes('bulletList', { listStyle })
    .run()
}

function editLink(editor: Editor) {
  const previousUrl = String(editor.getAttributes('link').href || '')
  const url = window.prompt('Enter the link URL', previousUrl)
  if (url === null) return

  const trimmed = url.trim()
  if (!trimmed) {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: trimmed })
    .run()
}

export function BlogRichTextEditor({
  value,
  onChange,
  placeholder = 'Write or paste the blog post here…',
}: BlogRichTextEditorProps) {
  const lastSyncedValue = useRef(value)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        bulletList: false,
        code: false,
        codeBlock: false,
        heading: { levels: [2, 3] },
        link: {
          autolink: true,
          linkOnPaste: true,
          openOnClick: false,
          defaultProtocol: 'https',
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        },
      }),
      StyledBulletList.configure({
        keepMarks: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: contentToSafeHtml(value),
    editorProps: {
      attributes: {
        class:
          'blog-rich-text-editor min-h-[22rem] px-5 py-4 text-base text-slate-800 focus:outline-none',
        'aria-label': 'Blog post content',
      },
      handlePaste(view, event) {
        const clipboard = event.clipboardData
        const html = clipboard?.getData('text/html') || ''
        const plainText = clipboard?.getData('text/plain') || ''

        // Keep genuine rich-text pastes intact. For multiline plain text,
        // infer headings, benefit lists, numbered lists, paragraphs, and URLs.
        if (html.trim() || !plainText.trim() || !plainText.includes('\n')) {
          return false
        }

        event.preventDefault()
        const wrapper = document.createElement('div')
        wrapper.innerHTML = plainTextToHtml(plainText)
        const slice = ProseMirrorDOMParser.fromSchema(view.state.schema).parseSlice(wrapper)
        view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView())
        return true
      },
    },
    onUpdate({ editor: currentEditor }) {
      const html = currentEditor.isEmpty ? '' : currentEditor.getHTML()
      lastSyncedValue.current = html
      onChange(html)
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value === lastSyncedValue.current) return

    const nextValue = contentToSafeHtml(value)
    const currentValue = editor.isEmpty ? '' : editor.getHTML()
    if (nextValue !== currentValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false })
    }
    lastSyncedValue.current = value
  }, [editor, value])

  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive('bold') || false,
      italic: currentEditor?.isActive('italic') || false,
      underline: currentEditor?.isActive('underline') || false,
      heading2: currentEditor?.isActive('heading', { level: 2 }) || false,
      heading3: currentEditor?.isActive('heading', { level: 3 }) || false,
      discList:
        (currentEditor?.isActive('bulletList') &&
          !currentEditor?.isActive('bulletList', { listStyle: 'circle' })) ||
        false,
      circleList:
        currentEditor?.isActive('bulletList', { listStyle: 'circle' }) || false,
      orderedList: currentEditor?.isActive('orderedList') || false,
      alignLeft:
        currentEditor?.isActive({ textAlign: 'left' }) ||
        (!currentEditor?.isActive({ textAlign: 'center' }) &&
          !currentEditor?.isActive({ textAlign: 'right' })) ||
        false,
      alignCenter: currentEditor?.isActive({ textAlign: 'center' }) || false,
      alignRight: currentEditor?.isActive({ textAlign: 'right' }) || false,
      link: currentEditor?.isActive('link') || false,
    }),
  })

  const state = toolbarState || {
    bold: false,
    italic: false,
    underline: false,
    heading2: false,
    heading3: false,
    discList: false,
    circleList: false,
    orderedList: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
    link: false,
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <div
        className="flex min-h-12 items-stretch overflow-x-auto border-b border-border bg-slate-50 p-1.5"
        role="toolbar"
        aria-label="Blog text formatting"
      >
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            label="Bold"
            active={state.bold}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4.5 w-4.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={state.italic}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4.5 w-4.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={state.underline}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <Underline className="h-4.5 w-4.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Add or edit link"
            active={state.link}
            disabled={!editor}
            onClick={() => editor && editLink(editor)}
          >
            <Link2 className="h-4.5 w-4.5" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            label="Heading level 2"
            active={state.heading2}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4.5 w-4.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading level 3"
            active={state.heading3}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4.5 w-4.5" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            label="Dot bullet list"
            active={state.discList}
            disabled={!editor}
            onClick={() => editor && setBulletListStyle(editor, 'disc')}
          >
            <List className="h-4.5 w-4.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Circle bullet list"
            active={state.circleList}
            disabled={!editor}
            onClick={() => editor && setBulletListStyle(editor, 'circle')}
          >
            <CircleListIcon className="h-4.5 w-4.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={state.orderedList}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4.5 w-4.5" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            label="Align left"
            active={state.alignLeft}
            disabled={!editor}
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="h-4.5 w-4.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Align center"
            active={state.alignCenter}
            disabled={!editor}
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="h-4.5 w-4.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Align right"
            active={state.alignRight}
            disabled={!editor}
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="h-4.5 w-4.5" />
          </ToolbarButton>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
