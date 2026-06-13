import { useState, useMemo } from 'react'
import { View, Input, Image, Text, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PERFORMANCES } from '../../data/performances'
import PerformanceCard from '../../components/PerformanceCard'
import Icon from '../../components/Icon'
import { useTheme } from '../../hooks/useTheme'
import { useStatusBar } from '../../hooks/useStatusBar'
import './index.scss'

export default function Index() {
  const theme = useTheme()
  const statusBar = useStatusBar()
  const [keyword, setKeyword] = useState('')

  const banners = useMemo(() => PERFORMANCES.filter(p => p.banner), [])
  const recommended = useMemo(() => PERFORMANCES.filter(p => p.recommended), [])

  const filtered = useMemo(() => {
    const k = keyword.trim()
    if (!k) return recommended
    return PERFORMANCES.filter(p =>
      p.title.includes(k) || p.city.includes(k) || p.venue.includes(k) ||
      p.performers.some(per => per.name.includes(k))
    )
  }, [keyword, recommended])

  const goDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` })
  }

  return (
    <ScrollView scrollY className={`home theme-${theme}`}>
      <View className='home__header' style={{ paddingTop: `${statusBar + 16}px` }}>
        <Text className='home__brand'>古典乐汇</Text>
        <Text className='home__slogan'>遇见每一场值得珍藏的演出</Text>
        <View className='home__search'>
          <Icon name='search' size={34} color='#8a8a96' className='home__search-icon' />
          <Input
            className='home__search-input'
            placeholder='搜索演出、城市、演奏家'
            placeholderStyle='color:#b0b0b8'
            value={keyword}
            onInput={e => setKeyword(e.detail.value)}
          />
        </View>
      </View>

      {!keyword.trim() && (
        <Swiper
          className='home__banner'
          circular
          autoplay
          interval={4000}
          indicatorDots
          indicatorActiveColor='#c9a96a'
          indicatorColor='rgba(255,255,255,0.5)'
        >
          {banners.map(b => (
            <SwiperItem key={b.id} onClick={() => goDetail(b.id)}>
              <View className='home__banner-item'>
                <Image className='home__banner-img' src={b.cover} mode='aspectFill' />
                <View className='home__banner-mask'>
                  <Text className='home__banner-title'>{b.title}</Text>
                  <Text className='home__banner-meta'>{b.date} · {b.city}</Text>
                </View>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      )}

      <View className='home__section'>
        <Text className='home__section-title'>
          {keyword.trim() ? `搜索结果 (${filtered.length})` : '为你推荐'}
        </Text>
      </View>

      <View className='home__list'>
        {filtered.map(p => (
          <PerformanceCard key={p.id} data={p} />
        ))}
        {filtered.length === 0 && (
          <View className='home__empty'>
            <Text>没有找到相关演出</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
