import React from 'react'
import TitleSeparator from '../title-separator'
import { Button, Flex, Text } from '@radix-ui/themes'
import SubNote from './SubNote'
import { For, useObserve, useSelector } from '@legendapp/state/react'
import {
  fetchSubNotes,
  notes$,
  toggleExpandAllSubNotes,
} from '../../store/notesV2'

const SubNotes = () => {
  const isEmptyList = useSelector(
    () => notes$.selectedNoteSubNotes.length === 0
  )
  const isAllSubNotesExpanded = useSelector(() =>
    notes$.toggleExpandAllSubNotes.get()
  )

  // this is to auto open the subnote with this id and scroll to view
  const autoOpenSubNoteIdAndScrollToView = useSelector(() =>
    notes$.openSubNoteById.get()
  )

  useObserve(notes$.selectedNoteId, ({ value: id }) => {
    fetchSubNotes(id)
  })

  const handleOnScrollTo = () => {
    const toScrollTo = notes$.openSubNoteById.peek()
    if (notes$.selectedNoteSubNotes.peek()?.length && toScrollTo) {
      setTimeout(() => {
        const node = document.getElementById(`${toScrollTo}`)
        if (!node) {
          return
        }
        node.setAttribute('tabindex', '-1')
        node.focus()
        node.removeAttribute('tabindex')
      }, 400)
    }
  }

  useObserve(notes$.selectedNoteSubNotes, () => {
    handleOnScrollTo()
  })

  useObserve(notes$.openSubNoteById, () => {
    handleOnScrollTo()
  })

  if (isEmptyList) {
    return null
  }

  return (
    <div className="mt-10">
      <TitleSeparator>
        <Text size="2" color="gray">
          Past Completed Lists
        </Text>
      </TitleSeparator>
      <Flex justify="end">
        <Button size="1" onClick={toggleExpandAllSubNotes}>
          {isAllSubNotesExpanded ? 'Close' : 'Expand'} all
        </Button>
      </Flex>
      <Flex direction="column" gap="1">
        <For each={notes$.selectedNoteSubNotes}>
          {(item) => {
            return (
              <SubNote
                note$={item}
                defaultOpen={
                  autoOpenSubNoteIdAndScrollToView === item.id.peek()
                }
                onClose={() => {
                  if (autoOpenSubNoteIdAndScrollToView === item.id.peek()) {
                    notes$.openSubNoteById.set(undefined)
                  }
                }}
              />
            )
          }}
        </For>
      </Flex>
    </div>
  )
}

export default SubNotes
