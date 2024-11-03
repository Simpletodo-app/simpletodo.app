import Store from 'electron-store'
import { UserData } from '../../common/types'

const store = new Store<UserData>()

export const getUserData = <K extends keyof UserData>(key: K): UserData[K] =>
  store.get(key as string)

export const setUserData = (key: string, value: unknown) =>
  store.set(key, typeof value === 'undefined' ? null : value)
