import React from 'react'
import { DropdownMenu, IconButton } from '@radix-ui/themes'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'

type ItemActionMenuProps = {
  onDelete: () => void
  onEdit: () => void
}

const ItemActionMenu = ({ onDelete, onEdit }: ItemActionMenuProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          variant="ghost"
          size="1"
          radius="full"
          className="action-menu"
        >
          <DotsHorizontalIcon width="12" height="12" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={onEdit}>Edit</DropdownMenu.Item>
        <DropdownMenu.Item onClick={onDelete}>Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export default ItemActionMenu
