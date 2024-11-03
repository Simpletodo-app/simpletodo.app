import React from 'react'

import { Flex, IconButton, Tooltip } from '@radix-ui/themes'
import { BackpackIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import ThemeToggle from './theme-toggle'
import logo from '../images/logo.png'

type SideNavProps = {
  currentProjectTitle?: string
  onToggleExpansion: () => void
  openSearch: () => void
}

const SideNav = ({
  currentProjectTitle,
  onToggleExpansion,
  openSearch,
}: SideNavProps) => {
  return (
    <Flex
      gap="2"
      justify="between"
      className="min-h-screen"
      pl="2"
      wrap="nowrap"
    >
      <Flex justify="between" align="center" direction="column">
        <Flex direction="column" gap="5" pt="3">
          <img
            src={logo}
            alt="Simpletodo app Logo"
            className="w-[44px] h-[44px]"
          />
          <Tooltip content={`${currentProjectTitle} notes`}>
            <IconButton variant="ghost" onClick={onToggleExpansion}>
              <BackpackIcon width="18" height="18" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Search notes (Ctrl or ⌘ + K)">
            <IconButton variant="ghost" onClick={openSearch}>
              <MagnifyingGlassIcon width="18" height="18" />
            </IconButton>
          </Tooltip>
        </Flex>
        <Flex direction="column" gap="5" py="2" pb="3">
          {/* <Tooltip content="Settings">
            <IconButton variant="ghost">
              <GearIcon width="18" height="18" />
            </IconButton>
          </Tooltip> */}
          <Tooltip content="Theme">
            <ThemeToggle />
          </Tooltip>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default SideNav
