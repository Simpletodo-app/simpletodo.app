import React, { useEffect, useMemo } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { Box, Separator, Text } from '@radix-ui/themes'
import { ChevronRightIcon, ChevronDownIcon } from '@radix-ui/react-icons'

import { ObservableObject } from '@legendapp/state'
import { format } from 'date-fns'
import ItemContextMenu from '../notes-list/item-context-menu'
import {
  SubNoteListItem,
  debouncedCreateOrEditNote,
  deleteSubNote,
  notes$,
} from '../../store/notesV2'
import { useObserve } from '@legendapp/state/react'
import { TextEditor, isEmpty } from './editor'
import { noop } from 'lodash'

type SubNoteProps = {
  note$: ObservableObject<SubNoteListItem>
  defaultOpen?: boolean
  onClose?: () => void
}

const SubNote = ({ note$, defaultOpen = false, onClose }: SubNoteProps) => {
  const [open, setOpen] = React.useState(false)
  const id = note$.id.peek()
  const createdAtString = note$.createdAt.peek()
  const createdAt = useMemo(() => new Date(createdAtString), [createdAtString])

  useObserve(notes$.toggleExpandAllSubNotes, ({ value }) => {
    setOpen(value)
  })

  const handleOnOpenToggle = (updatedValue?: boolean) => {
    const newValue = updatedValue ?? !open
    setOpen(newValue)

    if (onClose && !newValue) {
      onClose()
    }
  }

  useEffect(() => {
    setOpen(defaultOpen)
  }, [defaultOpen])

  return (
    <Collapsible.Root
      id={`${id}`}
      open={open}
      onOpenChange={handleOnOpenToggle}
      className="mt-2"
    >
      <div className="subnote rounded-md border p-2">
        <ItemContextMenu
          onDelete={() => deleteSubNote(id)}
          onOpen={handleOnOpenToggle}
          showRestore={false}
          onRestore={noop}
        >
          <Collapsible.Trigger asChild>
            <button className="flex w-full justify-between items-center pb-1">
              <Text as="span" weight="medium" size="2">
                {format(createdAt, 'MMM d, yyyy')}

                <Text as="span" size="1" color="gray">
                  {' '}
                  {format(createdAt, 'h:mm aaa')}
                </Text>
              </Text>
              {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </button>
          </Collapsible.Trigger>
        </ItemContextMenu>

        <Collapsible.Content className="w-full pt-2">
          <Separator style={{ width: '100%' }} />
          <Box pt="2">
            <TextEditor
              noteId={id}
              isSubNote
              content={note$?.htmlContent.peek() || ''}
              onChange={(v) => {
                if (!isEmpty(v) && note$.htmlContent.peek() !== v) {
                  debouncedCreateOrEditNote(id, v, true)
                }
              }}
            />
          </Box>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}

export default SubNote
