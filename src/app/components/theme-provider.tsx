import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Theme, ThemeOptions } from '@radix-ui/themes'
import noop from 'lodash/noop'
import debounce from 'lodash/debounce'
import { useUserData } from './user-data-provider'

type Appearance = ThemeOptions['appearance']

type ThemeContextValue = {
  appearance?: Appearance
  onChangeAppearance: (appearance: ThemeOptions['appearance']) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  onChangeAppearance: noop,
})

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const ApplyRadixTheme = ({ children }: { children: React.ReactNode }) => {
  const { appearance } = useTheme()

  useEffect(() => {
    if (appearance === 'light') {
      document?.body.classList.remove('light', 'dark')
      document?.body.classList.add('light')
    }
    if (appearance === 'dark') {
      document?.body.classList.remove('light', 'dark')
      document?.body.classList.add('dark')
    }
  }, [appearance])

  return (
    <Theme
      panelBackground="solid"
      appearance={appearance as ThemeOptions['appearance']}
    >
      {children}
    </Theme>
  )
}

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { appearance: defaultAppearance, updateUserData } = useUserData()
  const [appearance, setAppearance] = useState<Appearance>(
    defaultAppearance || 'light'
  )

  const onChangeAppearance = async (value: ThemeOptions['appearance']) => {
    setAppearance(value)
    await updateUserData('appearance', value)
  }

  const debouncedOnChangeAppearance = useMemo(
    () => debounce(onChangeAppearance, 500),
    []
  )

  const value: ThemeContextValue = {
    appearance,
    onChangeAppearance: debouncedOnChangeAppearance,
  }
  return (
    <ThemeContext.Provider value={value}>
      <ApplyRadixTheme>{children}</ApplyRadixTheme>
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
