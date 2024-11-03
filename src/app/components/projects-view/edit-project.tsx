import React, { useEffect, useState } from 'react'
import { Dialog, Text, TextField, Flex, Button } from '@radix-ui/themes'
import { updateProject } from '../../store/projects'
import { ID } from '../../../common/types'

type EditProjectProps = {
  projectId: ID
  defaultTitle: string
  open: boolean
  onClose: () => void
}
const EditProject = ({
  defaultTitle,
  projectId,
  open,
  onClose,
}: EditProjectProps) => {
  const [title, setTitle] = useState(defaultTitle)

  const handleOnSave = () => {
    updateProject(projectId, title)
  }

  useEffect(() => {
    setTitle(defaultTitle)
  }, [defaultTitle])

  return (
    <Dialog.Root onOpenChange={onClose} open={open}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <Dialog.Title>Edit project</Dialog.Title>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Name
              </Text>
              <TextField.Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your project name e.g Weekend drawings"
              />
            </label>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button type="submit" onClick={handleOnSave} disabled={!title}>
                Save
              </Button>
            </Dialog.Close>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default EditProject
