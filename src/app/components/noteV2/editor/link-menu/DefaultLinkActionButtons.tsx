import React, { useMemo } from 'react'
import type { Editor } from '@tiptap/react'
import debounce from 'lodash/debounce'

import {
  TrashIcon,
  OpenInNewWindowIcon,
  Pencil1Icon,
  CheckIcon,
} from '@radix-ui/react-icons'
import { IconButton, TextField } from '@radix-ui/themes'
import { ToolbarButton } from './ToolbarButton'

export interface LinkEditingMenu {
  linkUrl: string
  setLinkUrl: React.Dispatch<React.SetStateAction<string>>
  editor: Editor
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  // if this is to create a new link or edit an existing link
  isNewLink?: boolean
}

export const LinkEditingMenu = (props: LinkEditingMenu) => {
  const { linkUrl, setLinkUrl, editor, setIsEditing, isNewLink = false } = props

  const createNewLink = (linkValue: string) => {
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: linkValue })
      .run()
  }

  const updateEditorLink = async (newLinkValue: string) => {
    if (newLinkValue === '') {
      return
    }

    editor
      .chain()
      .extendMarkRange('link')
      .updateAttributes('link', { href: newLinkValue })
      .run()
  }

  const debouncedUpdateEditorLink = useMemo(
    () => debounce(updateEditorLink, 500),
    []
  )

  const handleOnNewClick = () => {
    createNewLink(linkUrl)
    setIsEditing(false)
  }

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isNewLink) {
      handleOnNewClick()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  return (
    <>
      <TextField.Input
        id="edit-link-url"
        size="1"
        value={linkUrl}
        onKeyDown={handleOnKeyDown}
        onChange={(e) => {
          const value = e.target.value
          setLinkUrl(value)
          if (!isNewLink) {
            debouncedUpdateEditorLink(value)
          }
        }}
        autoFocus
      />

      {isNewLink ? (
        <IconButton
          variant="ghost"
          size="1"
          mr="1"
          onClick={handleOnNewClick}
          disabled={!linkUrl}
        >
          <CheckIcon />
        </IconButton>
      ) : (
        <IconButton
          ml="1"
          mr="1"
          size="1"
          variant="ghost"
          color="crimson"
          onClick={() => {
            editor.chain().focus().unsetLink().run()
            setIsEditing(false)
          }}
        >
          <TrashIcon />
        </IconButton>
      )}
    </>
  )
}

export interface EditLinkMenuActionButtonProps {
  setLinkUrl: React.Dispatch<React.SetStateAction<string>>
  linkHref: string | null
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
}

export const EditLinkMenuActionButton = (
  props: EditLinkMenuActionButtonProps
) => {
  const { setLinkUrl, linkHref, setIsEditing } = props

  return (
    <ToolbarButton
      tooltip="Edit link"
      Icon={Pencil1Icon}
      onClick={() => {
        setLinkUrl(linkHref || '')
        setIsEditing(true)
      }}
    />
  )
}

export interface OpenInNewTabLinkMenuActionButtonProps {
  linkHref: string | null
}

export const OpenInNewTabLinkMenuActionButton = (
  props: OpenInNewTabLinkMenuActionButtonProps
) => {
  const { linkHref } = props

  return (
    <ToolbarButton
      tooltip="Open link"
      Icon={OpenInNewWindowIcon}
      onClick={() => {
        if (linkHref) {
          window.open(linkHref, '_blank')
        }
      }}
    />
  )
}
