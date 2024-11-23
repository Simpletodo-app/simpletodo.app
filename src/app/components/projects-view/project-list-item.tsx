import React, { useState } from 'react'
import { Flex, Button } from '@radix-ui/themes'
import ItemActionMenu from './item-action-menu'
import { cn } from '../../utils'
import {
  deleteProject,
  isAllNotesProjectId,
  isTrashNotesProjectId,
  projects$,
  selectProject,
} from '../../store/projects'
import { ProjectWithNoteCount } from '../../../common/types'
import { ObservableObject } from '@legendapp/state'
import EditProject from './edit-project'
import ConfirmDelete from './confirm-delete'

type ProjectListItemProps = {
  project$: ObservableObject<ProjectWithNoteCount>
}

const ProjectListItem = ({ project$ }: ProjectListItemProps) => {
  const [open, setOpen] = useState(false)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const id = project$.id.peek()
  const selectedProjectId = projects$.selectedProjectId.get()
  const isActive = selectedProjectId === id
  const title = project$.title.get()
  const isTrashProjectId = isTrashNotesProjectId(id)

  const color = isTrashProjectId ? 'crimson' : isActive ? 'indigo' : undefined

  return (
    <>
      <Button
        variant="ghost"
        size="2"
        className={cn('projects-view-list-item', isActive && 'active')}
        asChild
        onClick={() => selectProject(id)}
        color={color}
      >
        <li>
          {title}
          <Flex gap="2" align="center">
            {!isAllNotesProjectId(id) && !isTrashProjectId && (
              <ItemActionMenu
                onDelete={() => {
                  setOpenDeleteConfirm(true)
                }}
                onEdit={() => setOpen(true)}
              />
            )}
            <span className="count">{project$.noteCount.get()}</span>
          </Flex>
        </li>
      </Button>
      <EditProject
        defaultTitle={title}
        projectId={id}
        open={open}
        onClose={() => setOpen(false)}
      />
      <ConfirmDelete
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        onConfirm={() => {
          deleteProject(id)
        }}
      />
    </>
  )
}

export default ProjectListItem
