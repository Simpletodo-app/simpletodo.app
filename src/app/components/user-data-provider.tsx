import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { UserData } from '../../common/types'
import ViewLoader from './view-loader'

type UserDataContextValueType = Partial<UserData> & {
  updateUserData: <K extends keyof UserData>(
    key: K,
    value: UserData[K]
  ) => Promise<void>
}
const UserDataContext = createContext<UserDataContextValueType>({
  updateUserData: () => Promise.resolve(),
})

export const useUserData = () => {
  const context = useContext(UserDataContext)

  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider')
  }
  return context
}

const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<Partial<UserData>>({})

  const loadUserData = useCallback(async () => {
    setLoading(true)
    try {
      const appearance = (await window.electron.store.get(
        'appearance'
      )) as UserData['appearance']
      const lastOpenedNoteId = (await window.electron.store.get(
        'lastOpenedNoteId'
      )) as number

      const recentSearches = (await window.electron.store.get(
        'recentSearches'
      )) as string[]

      const lastOpenedProjectId = (await window.electron.store.get(
        'lastOpenedProjectId'
      )) as number
      setUserData({
        appearance,
        lastOpenedNoteId,
        lastOpenedProjectId,
        recentSearches: recentSearches || [],
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUserData = useCallback(
    async <K extends keyof UserData>(key: K, value: UserData[K]) => {
      setUserData((prev) => ({
        ...prev,
        [key]: value,
      }))
      await window.electron.store.set(key, value)
    },
    []
  )

  const value = useMemo(
    () => ({ ...userData, updateUserData }),
    [updateUserData, userData]
  )

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  if (loading) {
    return <ViewLoader message="Loading user data..." />
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserDataProvider
