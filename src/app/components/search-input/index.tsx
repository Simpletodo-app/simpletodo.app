import { Cross2Icon } from '@radix-ui/react-icons'
import { Badge, Dialog, IconButton, Text } from '@radix-ui/themes'
import { Command } from 'cmdk'
import React from 'react'
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from './commands'
import {
  debouncedSearchNotes,
  notes$,
  selectNoteItem,
} from '../../store/notesV2'
import { useSelector } from '@legendapp/state/react'
import { useUserData } from '../user-data-provider'
import { ID } from '../../../common/types'

type SearchInputProps = {
  open: boolean
  onOpenChange: (open: boolean | ((prev: boolean) => boolean)) => void
}

const SearchInput = ({ open, onOpenChange }: SearchInputProps) => {
  const [search, setSearch] = React.useState('')
  const [searching, setSearching] = React.useState(false)
  const results = useSelector(() => notes$.searchResults.get())
  const { recentSearches, updateUserData } = useUserData()

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleOnSearch = (search: string) => {
    setSearch(search)
    setSearching(true)
    debouncedSearchNotes(search, async (notes) => {
      setSearching(false)
      if (notes.length > 0) {
        await updateUserData(
          'recentSearches',
          Array.from(new Set([...recentSearches, search]))
        )
      }
    })
  }

  const handleRemoveRecent = async (index: number) => {
    const newRecentSearches = [...recentSearches]
    newRecentSearches.splice(index, 1)
    await updateUserData('recentSearches', newRecentSearches)
  }

  const handleSelectedSearch = (id: ID, subNoteId?: ID) => {
    selectNoteItem(id, subNoteId)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="search-input-dialog relative overflow-hidden p-0">
        <Command
          label="Global Command Menu"
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          shouldFilter={false}
        >
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={handleOnSearch}
          />
          <CommandList>
            <CommandEmpty>
              {search === ''
                ? 'Start typing to load results'
                : searching
                ? 'Searching'
                : 'No results found.'}
            </CommandEmpty>
            {!search && !!recentSearches?.length && (
              <CommandGroup heading="Recent search">
                {recentSearches.map((recent, index) => (
                  <CommandItem
                    key={recent}
                    onSelect={() => handleOnSearch(recent)}
                    className="justify-between"
                  >
                    {recent}
                    <IconButton
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveRecent(index)
                      }}
                      className="h-4 w-4"
                    >
                      <Cross2Icon />
                      <span className="sr-only">Remove</span>
                    </IconButton>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {search && !searching && (
              <CommandGroup heading="Results">
                {results.map((result) => (
                  <CommandItem
                    key={result.id}
                    className="flex-col"
                    onSelect={() => {
                      // if it is a subnote, select the parent note
                      handleSelectedSearch(
                        result.parentNoteId || result.id,
                        result.parentNoteId ? result.id : undefined
                      )
                    }}
                  >
                    <Text
                      size="1"
                      className="font-medium text-xs"
                      dangerouslySetInnerHTML={{
                        __html: result.markedTitle || result.title,
                      }}
                    />
                    <Text
                      dangerouslySetInnerHTML={{
                        __html: result.markedTextContent || result.textContent,
                      }}
                    />
                    {result.projectTitle && (
                      <div>
                        <Badge color="gray" variant="soft" size="1">
                          {result.projectTitle}
                        </Badge>
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <IconButton variant="ghost">
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </IconButton>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default SearchInput
