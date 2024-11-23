import React from 'react'
import { DropdownMenu, IconButton } from '@radix-ui/themes'
import { SunIcon, MoonIcon } from '@radix-ui/react-icons'
import { useTheme } from './theme-provider'

const ThemeToggle = React.forwardRef<HTMLButtonElement>((_, ref) => {
  const { onChangeAppearance, appearance } = useTheme()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger ref={ref}>
        <IconButton size="4" variant="ghost">
          <SunIcon
            width="18"
            height="18"
            className=" rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <MoonIcon
            width="18"
            height="18"
            className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.RadioGroup
          value={appearance}
          onValueChange={onChangeAppearance}
        >
          <DropdownMenu.RadioItem value="light">Light</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="dark">Dark</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
})

export default ThemeToggle
