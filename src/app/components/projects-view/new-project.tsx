import React, { useState } from 'react'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { Dialog, Text, TextField, Flex, Button } from '@radix-ui/themes'
import { cn } from '../..//utils'
import { saveNewProject } from '../../store/projects'

const NewProjects = () => {
  const [title, setTitle] = useState('')

  const handleOnSave = () => {
    saveNewProject(title)
    setTitle('')
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button
          variant="ghost"
          size="2"
          className={cn('projects-view-list-item', 'new')}
        >
          <Pencil2Icon /> New project
        </Button>
      </Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 450 }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <Dialog.Title>New project</Dialog.Title>

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

export default NewProjects
