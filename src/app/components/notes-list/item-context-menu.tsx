import React from 'react'
import { ContextMenu } from '@radix-ui/themes'

type ItemContextMenuProps = {
  children: React.ReactNode
  onDelete: () => void
  onOpen: () => void
  showRestore: boolean
  onRestore: () => void
}
const ItemContextMenu = ({
  onDelete,
  onOpen,
  onRestore,
  showRestore,
  children,
}: ItemContextMenuProps) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onClick={onOpen}>Open</ContextMenu.Item>
        {showRestore && (
          <ContextMenu.Item onClick={onRestore}>Restore</ContextMenu.Item>
        )}
        <ContextMenu.Separator />

        {/* <ContextMenu.Sub>
          <ContextMenu.SubTrigger>Move</ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item>Project a</ContextMenu.Item>
            <ContextMenu.Item>Project b</ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub> 

        <ContextMenu.Separator />
        */}
        <ContextMenu.Item color="red" onClick={onDelete}>
          Delete
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

export default ItemContextMenu
