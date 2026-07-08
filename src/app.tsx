import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { initThemeWatcher } from './store/theme'
import { refreshProfile } from './services/auth'
import { hydrateFavorites, hydrateNotificationCredits } from './store'
import { loadPerformances } from './store/performances'
import '@nutui/nutui-react-taro/dist/style.css'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    initThemeWatcher()
    loadPerformances().catch(() => {})
    refreshProfile().then(() => {
      // Fire the two hydrates in parallel — a failure in one must not
      // block the other. Both silently no-op when unauthenticated.
      hydrateFavorites()
      hydrateNotificationCredits()
    })
  })

  return children
}

export default App
