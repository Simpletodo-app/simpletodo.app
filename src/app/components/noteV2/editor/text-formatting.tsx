import React from 'react'

import {
  FontBoldIcon,
  FontItalicIcon,
  StrikethroughIcon,
  CodeIcon,
  Link2Icon,
} from '@radix-ui/react-icons'
import { Flex, IconButton } from '@radix-ui/themes'
import { Editor } from '@tiptap/react'
import { isActiveProps } from './utils'
import { LinkEditingMenu } from './link-menu/DefaultLinkActionButtons'
import { IconButtonProps } from '@radix-ui/themes/dist/cjs/components/icon-button'

export type ManageLink = {
  linkUrl: string
  isEditing: boolean
}

const FormattingButton = (
  props: IconButtonProps & React.RefAttributes<HTMLButtonElement>
) => <IconButton {...props} variant="ghost" size="1" />

type TextFormattingProps = {
  editor: Editor | undefined
  manageLink: ManageLink
  setManageLink: React.Dispatch<React.SetStateAction<ManageLink>>
}

const TextFormatting = ({
  editor,
  manageLink,
  setManageLink,
}: TextFormattingProps) => {
  if (!editor) {
    return null
  }

  return (
    <Flex
      display="inline-flex"
      role="group"
      className="text-formatting-group"
      aria-label="Text Formatting"
    >
      {manageLink.isEditing && (
        <LinkEditingMenu
          editor={editor}
          linkUrl={manageLink.linkUrl}
          setLinkUrl={(value: string) =>
            setManageLink({ ...manageLink, linkUrl: value })
          }
          setIsEditing={(value: boolean) => {
            setManageLink({ ...manageLink, isEditing: value })
          }}
          isNewLink={!editor.isActive('link')}
        />
      )}
      {!manageLink.isEditing && (
        <>
          <FormattingButton
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBold().run()}
            {...isActiveProps(editor.isActive('bold'))}
          >
            <FontBoldIcon />
          </FormattingButton>
          <FormattingButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            {...isActiveProps(editor.isActive('italic'))}
          >
            <FontItalicIcon />
          </FormattingButton>
          <FormattingButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            {...isActiveProps(editor.isActive('strike'))}
          >
            <StrikethroughIcon />
          </FormattingButton>
          <FormattingButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            {...isActiveProps(editor.isActive('code'))}
          >
            <CodeIcon />
          </FormattingButton>
          <FormattingButton
            onClick={() => {
              const currentUrl = editor.getAttributes('link').href
              setManageLink({ isEditing: true, linkUrl: currentUrl })
            }}
            {...isActiveProps(editor.isActive('link'))}
          >
            <Link2Icon />
          </FormattingButton>
        </>
      )}
    </Flex>
  )
}

export default TextFormatting
