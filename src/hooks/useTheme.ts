import { useEffect, useState } from 'react'
import { resolveTheme, subscribeTheme, Theme } from '../store/theme'

export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(resolveTheme())
  useEffect(() => {
    const update = () => setTheme(resolveTheme())
    update()
    return subscribeTheme(update)
  }, [])
  return theme
}
