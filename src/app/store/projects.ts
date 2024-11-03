import {
  observable,
  computed,
  ObservableObject,
  ObservableComputed,
} from '@legendapp/state'
import { ID, IDField, Project, ProjectWithNoteCount } from '../../common/types'
import { toIdAndIndexMap } from './utils'

const allNotesProject: Project = {
  id: -1,
  title: 'All',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const trashNotesProject: Project = {
  id: -2,
  title: 'Trash',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

type ProjectsStore = {
  projects: ProjectWithNoteCount[]
  isFetching: boolean
  _projectsIdIndexMap: ObservableComputed<Map<IDField['id'], Index>>

  selectedProjectId: IDField['id'] | undefined
}

export const projects$: ObservableObject<ProjectsStore> = observable({
  projects: [] as ProjectWithNoteCount[],
  isFetching: false,
  _projectsIdIndexMap: computed(() => {
    return toIdAndIndexMap(projects$.projects.get())
  }),
  selectedProjectId: undefined,
})

export const isAllNotesProjectId = (id: ID) => {
  return id === allNotesProject.id
}

export const isTrashNotesProjectId = (id: ID) => {
  return id === trashNotesProject.id
}

export const getProjectFromId = (selectedId?: ID) => {
  const index = getProjectIdIndex(selectedId)
  return projects$.projects[index]
}

export const selectProject = (id: ID) => {
  projects$.selectedProjectId.set(id)

  const fn = async () => {
    await window.electron.store.set('lastOpenedProjectId', id)
  }

  fn().then()
}

export const getProjectIdIndex = (id: ID) => {
  const map = projects$._projectsIdIndexMap.get()
  return map.get(id)
}

export const updateProjectNoteCount = (
  id: ID | undefined,
  factor: 1 | -1,
  fromPermanentlyDeleting?: boolean
) => {
  if (!fromPermanentlyDeleting && !isTrashNotesProjectId(id)) {
    const allProject = projects$.projects[0]
    const allNoteCount = allProject.noteCount.get() + factor
    allProject.noteCount.set(allNoteCount)
  }

  let trashProject = getProjectFromId(trashNotesProject.id)

  // if no trash project and we are deleting, we create one
  if (!trashProject.get() && factor === -1) {
    projects$.projects.push({ ...trashNotesProject, noteCount: 0 })
    trashProject = projects$.projects[projects$.projects.length - 1]
  }

  // if note is deleted, update trash project note count
  if (factor === -1 && !isTrashNotesProjectId(id)) {
    const trashNoteCount =
      trashProject.noteCount.get() + (fromPermanentlyDeleting ? -1 : 1)
    trashProject.noteCount.set(trashNoteCount)
  }

  if (id) {
    const index = getProjectIdIndex(id)
    const noteCount = projects$.projects[index].noteCount.get() + factor
    projects$.projects[index].noteCount.set(noteCount)
  }

  // if trash project is selected and has 0 notes,
  // select all notes project and remove the trash project
  const lastProject = trashProject
  if (
    isTrashNotesProjectId(lastProject.id.get()) &&
    lastProject.noteCount.get() < 1
  ) {
    selectProject(allNotesProject.id)
    projects$.projects.pop()
  }
}

export const getSelectedProjectIndex = () => {
  const selectedId = projects$.selectedProjectId.get()
  const map = projects$._projectsIdIndexMap.get()
  return map.get(selectedId)
}

/**
 * DB handlers
 */

export const saveNewProject = async (
  title: string,
  shouldSelectProjectAfterCreation = true
) => {
  console.log('create a new project', title)

  try {
    const project = await window.electron.services.projects.create(title)
    projects$.projects.push({ ...project, noteCount: 0 })
    if (shouldSelectProjectAfterCreation) {
      selectProject(project.id)
    }
    return project
  } catch (err) {
    console.error(err)
  }
}

export const updateProject = async (id: ID, title: string) => {
  console.log('updating project', id)

  try {
    const project = await window.electron.services.projects.update(id, {
      title,
    })
    const index = getProjectIdIndex(id)
    projects$.projects[index].title.set(title)

    return project
  } catch (err) {
    console.error(err)
  }
}

export const fetchProjects = async (defaultSelectedProjectId?: number) => {
  projects$.isFetching.set(true)
  console.log(
    'fetching projects and selecting default project:',
    defaultSelectedProjectId
  )
  try {
    const fetchedProjects = await window.electron.services.projects.getAll()
    const allNotesCount = await window.electron.services.notes.count()
    const trashNotesCount = await window.electron.services.notes.count(true)

    const allProjectWithCount = {
      ...allNotesProject,
      noteCount: allNotesCount,
    }
    const trashProjectWithCount = {
      ...trashNotesProject,
      noteCount: trashNotesCount,
    }
    const projects = [allProjectWithCount].concat(fetchedProjects)
    if (trashNotesCount > 0) {
      projects.push(trashProjectWithCount)
    }
    projects$.projects.set(projects)

    // after fetching notes, select the passed
    // default selected note id or use the first note
    const isValidDefaultSelectedProjectId = Boolean(
      defaultSelectedProjectId &&
        projects.find((project) => project.id === defaultSelectedProjectId)
    )
    const toBeSelectedNoteId = isValidDefaultSelectedProjectId
      ? defaultSelectedProjectId
      : projects[0]?.id

    // if there's an already selected project, select it or
    // select the project from stored user data
    selectProject(projects$.selectedProjectId.peek() || toBeSelectedNoteId)
  } catch (err) {
    console.error(err)
  } finally {
    projects$.isFetching.set(false)
  }
}

export const deleteProject = async (id: ID) => {
  console.log('deleting project for id:', id)
  try {
    await window.electron.services.projects.deleteById(id)
    const index = getProjectIdIndex(id)
    const project = projects$.projects[index].peek()

    // updating all notes and trash project note count
    if (project.noteCount > 0) {
      const allNotesProject = projects$.projects[0]
      const allNoteCount = allNotesProject.noteCount.get() - project.noteCount
      allNotesProject.noteCount.set(allNoteCount)

      const trashProject = projects$.projects[projects$.projects.length - 1]
      if (trashProject.id.peek() === trashNotesProject.id) {
        const trashNoteCount = trashProject.noteCount.get() + project.noteCount
        trashProject.noteCount.set(trashNoteCount)
      }
    }

    projects$.projects.splice(index, 1)
    selectProject(allNotesProject.id)
  } catch (err) {
    console.error(err)
  }
}

/**
 * End of DB handlers
 */
