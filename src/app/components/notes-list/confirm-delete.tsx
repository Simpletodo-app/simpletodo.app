import { AlertDialog, Button, Flex } from '@radix-ui/themes'
import React from 'react'

type ConfirmDeleteProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

const ConfirmDelete = ({ open, onClose, onConfirm }: ConfirmDeleteProps) => (
  <AlertDialog.Root open={open} onOpenChange={onClose}>
    <AlertDialog.Content style={{ maxWidth: 450 }}>
      <AlertDialog.Title>Delete list</AlertDialog.Title>
      <AlertDialog.Description size="2">
        You cannot undo this action. Are you sure you want to permanently delete
        this todo list?
      </AlertDialog.Description>

      <Flex gap="3" mt="4" justify="end">
        <AlertDialog.Cancel>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action onClick={onConfirm}>
          <Button variant="solid" color="red">
            Delete
          </Button>
        </AlertDialog.Action>
      </Flex>
    </AlertDialog.Content>
  </AlertDialog.Root>
)

export default ConfirmDelete
