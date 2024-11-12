import React, { useState } from 'react'

import SideNav from './components/side-nav'
import { cn } from './utils'
import NotesList from './components/notes-list'
import { useObserve, useSelector } from '@legendapp/state/react'
import { fetchProjects, getProjectFromId, projects$ } from './store/projects'
import { useUserData } from './components/user-data-provider'
import NoteV2 from './components/noteV2'
import ProjectsView from './components/projects-view'
import { Flex, Separator } from '@radix-ui/themes'
import SearchInput from './components/search-input'

const App = () => {
  const [projectsExpanded, setProjectsExpanded] = useState(false)
  const [fullScreen, setFullScreen] = useState(false)
  const { lastOpenedProjectId } = useUserData()
  const [open, setOpen] = useState(false)

  const currentProjectTitle = useSelector(() => {
    const projectId = projects$.selectedProjectId.get()
    if (projectId) {
      return getProjectFromId(projectId).title.get()
    }
  })

  const onToggleProjectsView = () => {
    setProjectsExpanded(!projectsExpanded)
  }

  const onToggleFullScreen = () => {
    setFullScreen(!fullScreen)
  }

  useObserve(() => {
    fetchProjects(lastOpenedProjectId)
  })

  return (
    <>
      <Flex className="min-h-screen overflow-hidden" height="100%" gap="1">
        {!fullScreen && (
          <SideNav
            onToggleExpansion={onToggleProjectsView}
            currentProjectTitle={currentProjectTitle}
            openSearch={() => setOpen(true)}
          />
        )}
        <div
          className={cn(
            'layout',
            projectsExpanded && 'projects-expanded',
            fullScreen && 'note-full-screen'
          )}
        >
          {!fullScreen ? (
            <>
              <Flex gap="2">
                {projectsExpanded && <ProjectsView />}
                <Separator orientation="vertical" size="4" />
              </Flex>
              <NotesList onToggleFullScreen={onToggleFullScreen} />
            </>
          ) : (
            // Dummy divs to keep the layout consistent which helps with transition css smoothly
            <>
              <div />
              <div />
            </>
          )}
          <NoteV2
            fullScreen={fullScreen}
            onToggleFullScreen={onToggleFullScreen}
          />
        </div>
      </Flex>
      <SearchInput open={open} onOpenChange={setOpen} />
    </>
  )
}

export default App
