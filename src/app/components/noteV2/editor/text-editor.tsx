import React, { useCallback, useEffect, useMemo } from 'react'

import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react'
import Document from '@tiptap/extension-document'

import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Code from '@tiptap/extension-code'

import Link from '@tiptap/extension-link'
import TextFormatting, { ManageLink } from './text-formatting'
import { LinkActionsMenu } from './link-menu/LinkActionsMenu'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { ID } from '../../../../common/types'
import { EditorState } from '@tiptap/pm/state'

function addAttributes() {
  return {
    ...this.parent?.(),
    carriedOverCount: {
      default: 0,
      keepOnSplit: false,
      parseHTML: (element: HTMLElement) => {
        return element.hasAttribute('data-carried-over-count')
          ? element.getAttribute('data-carried-over-count')
          : 0
      },
      renderHTML: (attributes: Record<string, string>) => {
        return {
          'data-carried-over-count': attributes.carriedOverCount,
        }
      },
    },
  }
}

const CustomTaskList = TaskList.extend({
  addAttributes,
})

const CustomTaskItem = TaskItem.extend({
  addAttributes,
})

type TextEditorProps = {
  placeholder?: string
  className?: string
  content?: string
  noteId: ID
  editable?: boolean
  onChange?: (value: string) => void
}

export const TextEditor = ({
  placeholder,
  noteId,
  content,
  editable,
  onChange,
  className,
}: TextEditorProps) => {
  const [manageLink, setManageLink] = React.useState<ManageLink>({
    linkUrl: '',
    isEditing: false,
  })
  const [prevNoteId, setPrevNoteId] = React.useState<ID>(null)

  const CustomDocument = useMemo(
    () =>
      Document.extend({
        content: 'heading taskList',
      }),
    []
  )

  const extensions = useMemo(
    () => [
      CustomDocument,
      StarterKit.configure({
        document: false,
      }),
      Placeholder.configure({
        showOnlyCurrent: false,
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'What’s the title?'
          }
        },
      }),
      CustomTaskList.configure({
        HTMLAttributes: {},
      }),
      CustomTaskItem.configure({
        nested: true,
      }),
      Code.configure({
        HTMLAttributes: {
          'data-accent-color': 'gray',
          class: 'rt-Code rt-variant-soft',
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          'data-accent-color': 'indigo',
          class: 'rt-Text rt-reset rt-Link rt-underline-auto',
        },
      }),
    ],
    [placeholder]
  )

  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    autofocus: 'end',
  })

  // see https://github.com/ueberdosis/tiptap/issues/491#issuecomment-1317578507
  const resetContentAndState = (newContent: string) => {
    if (!editor) return

    // clear before setting content, there's a bug if you don't clear first
    // some of the task items attribute will inherit value from the previous content
    editor.commands.clearContent()
    editor.commands.setContent(newContent)

    const newEditorState = EditorState.create({
      doc: editor.state.doc,
      plugins: editor.state.plugins,
      schema: editor.state.schema,
    })
    editor.view.updateState(newEditorState)

    editor.commands.focus('end')
  }

  // for performance and experience, we should only reset content
  // when note id is different from the previous note id
  // this willl make us avoid resetting the content when the user is typing
  // and data is saved to the DB
  const resetEditor = useCallback(() => {
    if (noteId !== prevNoteId) {
      resetContentAndState(content)
      setPrevNoteId(noteId)
    }
  }, [content, noteId, prevNoteId])

  useEffect(() => {
    resetEditor()
  }, [resetEditor])

  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editable,
      })
    }
  }, [editable, editor])

  return (
    <div className={className}>
      {editor && (
        <>
          {editor && <LinkActionsMenu editor={editor} />}
          <EditorContent editor={editor} />
          <BubbleMenu
            editor={editor}
            tippyOptions={{
              onHidden: () => {
                setManageLink({ linkUrl: '', isEditing: false })
              },
            }}
          >
            <TextFormatting
              editor={editor}
              manageLink={manageLink}
              setManageLink={setManageLink}
            />
          </BubbleMenu>
        </>
      )}
    </div>
  )
}

const emptyContent =
  '<h1></h1><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p></p></div></li></ul>'

export const isEmpty = (value: string) => {
  return !value || value === emptyContent
}
