import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { initThemeWatcher } from './store/theme'
import '@nutui/nutui-react-taro/dist/style.css'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    initThemeWatcher()
  })

  return children
}

export default App
