import React from 'react'
import { Flex } from '@radix-ui/themes'

import NewProject from './new-project'
import { useUserData } from '../user-data-provider'
import { For, useObserve } from '@legendapp/state/react'

import { fetchProjects, projects$ } from '../../store/projects'
import ProjectListItem from './project-list-item'

const ProjectsView = () => {
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
      py="2"
    >
      <Flex direction="column" py="2" gap="3" asChild>
        <ul>
          <For each={projects$.projects}>
            {(item) => {
              return <ProjectListItem project$={item} />
            }}
          </For>
        </ul>
      </Flex>

      <Flex direction="column" gap="5" className="pb-[5px]">
        <NewProject />
      </Flex>
    </Flex>
  )
}

export default ProjectsView
