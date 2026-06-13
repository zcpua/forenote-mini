import Taro from '@tarojs/taro'

export type ThemePref = 'system' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

const PREF_KEY = 'themePref'

type Listener = () => void
const listeners = new Set<Listener>()

let systemTheme: Theme =
  (Taro.getSystemInfoSync().theme as Theme) || 'light'

Taro.onThemeChange?.(({ theme }) => {
  systemTheme = theme as Theme
  emit()
})

function emit() {
  listeners.forEach(fn => fn())
}

export function subscribeTheme(fn: Listener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getThemePref(): ThemePref {
  return (Taro.getStorageSync(PREF_KEY) as ThemePref) || 'system'
}

export function setThemePref(pref: ThemePref) {
  Taro.setStorageSync(PREF_KEY, pref)
  emit()
}

export function resolveTheme(): Theme {
  const pref = getThemePref()
  return pref === 'system' ? systemTheme : pref
}

export const THEME_LABEL: Record<ThemePref, string> = {
  system: '跟随系统',
  light: '浅色',
  dark: '深色'
}
