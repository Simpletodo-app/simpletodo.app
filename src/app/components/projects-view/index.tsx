import React from 'react'
import { Flex, Heading, IconButton } from '@radix-ui/themes'

import NewProject from './new-project'
import { useUserData } from '../user-data-provider'
import { For, useObserve } from '@legendapp/state/react'

import { fetchProjects, projects$ } from '../../store/projects'
import ProjectListItem from './project-list-item'
import { ChevronLeftIcon } from '@radix-ui/react-icons'

type ProjectsViewProps = {
  onToggleExpansion: () => void
}

const ProjectsView = ({ onToggleExpansion }: ProjectsViewProps) => {
  const { lastOpenedProjectId } = useUserData()
  useObserve(() => {
    fetchProjects(lastOpenedProjectId)
  })

  return (
    <Flex
      direction="column"
      justify="between"
      className="min-w-[220px]"
      px="2"
      pr="3"
      pt="2"
      py="2"
      pb="5"
      style={{ background: 'var(--gray-1)' }}
    >
      <Flex direction="column" gap="2">
        <Flex align="center">
          {/* Users can easily move the app around through the app-region */}
          <Heading size="3" className="app-region flex-1">
            <span className="invisible">Projects list</span>
          </Heading>
          <IconButton variant="ghost" onClick={onToggleExpansion}>
            <ChevronLeftIcon width="18" height="18" />
          </IconButton>
        </Flex>
        <Flex direction="column" py="2" gap="3" asChild>
          <ul>
            <For each={projects$.projects}>
              {(item) => {
                return <ProjectListItem project$={item} />
              }}
            </For>
          </ul>
        </Flex>
      </Flex>

      <Flex direction="column" gap="5" className="pb-[5px]">
        <NewProject />
      </Flex>
    </Flex>
  )
}

export default ProjectsView
