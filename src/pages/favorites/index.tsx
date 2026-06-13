import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { getFavorites } from '../../store'
import { PERFORMANCES } from '../../data/performances'
import { Performance } from '../../types'
import PerformanceCard from '../../components/PerformanceCard'
import { useTheme } from '../../hooks/useTheme'
import './index.scss'

export default function Favorites() {
  const theme = useTheme()
  const [list, setList] = useState<Performance[]>([])

  useDidShow(() => {
    const ids = getFavorites()
    setList(PERFORMANCES.filter(p => ids.includes(p.id)))
  })

  return (
    <ScrollView scrollY className={`fav theme-${theme}`}>
      {list.length === 0 ? (
        <View className='fav__empty'>
          <Text className='fav__empty-icon'>♪</Text>
          <Text className='fav__empty-text'>还没有收藏的演出</Text>
          <Text className='fav__empty-sub'>去首页发现喜欢的音乐会吧</Text>
        </View>
      ) : (
        <View className='fav__list'>
          {list.map(p => <PerformanceCard key={p.id} data={p} />)}
        </View>
      )}
    </ScrollView>
  )
}
