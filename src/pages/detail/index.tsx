import { useState, useEffect, useRef } from 'react'
import { View, Image, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { getPerformanceById } from '../../data/performances'
import { Performance } from '../../types'
import { isFavorite, toggleFavorite } from '../../store'
import Icon from '../../components/Icon'
import { useTheme } from '../../hooks/useTheme'
import './index.scss'

export default function Detail() {
  const theme = useTheme()
  const router = useRouter()
  const id = router.params.id || ''
  const [perf, setPerf] = useState<Performance | undefined>(undefined)
  const [fav, setFav] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<Taro.InnerAudioContext | null>(null)

  useEffect(() => {
    const p = getPerformanceById(id)
    setPerf(p)
    setFav(isFavorite(id))
    Taro.setNavigationBarTitle({ title: p ? p.title : '演出详情' })
  }, [id])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.stop()
        audioRef.current.destroy()
      }
    }
  }, [])

  if (!perf) {
    return <View className={`detail theme-${theme}`}><View className='detail__loading'><Text>加载中…</Text></View></View>
  }

  const onFav = () => {
    const added = toggleFavorite(perf.id)
    setFav(added)
    Taro.showToast({ title: added ? '已收藏' : '已取消收藏', icon: 'none' })
  }

  const playTrack = (trackId: string, url: string) => {
    if (audioRef.current) {
      audioRef.current.stop()
      audioRef.current.destroy()
      audioRef.current = null
    }
    if (playingId === trackId) {
      setPlayingId(null)
      return
    }
    const ctx = Taro.createInnerAudioContext()
    ctx.src = url
    ctx.autoplay = true
    ctx.onError(() => {
      Taro.showToast({ title: '试听音频不可用（示例）', icon: 'none' })
      setPlayingId(null)
    })
    ctx.onEnded(() => setPlayingId(null))
    audioRef.current = ctx
    setPlayingId(trackId)
  }

  const addToCalendar = () => {
    const [y, m, d] = perf.date.split('-').map(Number)
    const [hh, mm] = perf.time.split(':').map(Number)
    const start = new Date(y, m - 1, d, hh, mm).getTime() / 1000
    Taro.addPhoneCalendar({
      title: perf.title,
      startTime: start,
      endTime: start + 7200,
      location: `${perf.city} ${perf.venue}`,
      description: perf.intro,
      alarm: true,
      alarmOffset: 3600,
      success: () => Taro.showToast({ title: '已添加到日历', icon: 'success' }),
      fail: () => Taro.showToast({ title: '添加失败或已取消', icon: 'none' })
    })
  }

  const buyTicket = () => {
    Taro.setClipboardData({
      data: perf.ticketUrl,
      success: () => {
        Taro.showModal({
          title: '前往购票',
          content: `购票链接已复制：\n${perf.ticketUrl}\n请在浏览器中打开`,
          showCancel: false
        })
      }
    })
  }

  return (
    <View className={`detail theme-${theme}`}>
      <ScrollView scrollY className='detail__scroll'>
        <Image className='detail__cover' src={perf.cover} mode='aspectFill' />

        <View className='detail__head'>
          <Text className='detail__title'>{perf.title}</Text>
          <View className='detail__tags'>
            <Text className='detail__tag'>{perf.date} {perf.time}</Text>
            <Text className='detail__tag'>{perf.city} · {perf.venue}</Text>
          </View>
        </View>

        <View className='detail__section'>
          <Text className='detail__section-title'>演出介绍</Text>
          <Text className='detail__intro'>{perf.intro}</Text>
        </View>

        <View className='detail__section'>
          <Text className='detail__section-title'>演奏者</Text>
          <ScrollView scrollX className='detail__performers'>
            {perf.performers.map(per => (
              <View key={per.id} className='detail__performer'>
                <Image className='detail__performer-avatar' src={per.avatar} mode='aspectFill' />
                <Text className='detail__performer-name'>{per.name}</Text>
                <Text className='detail__performer-role'>{per.role}</Text>
                <Text className='detail__performer-bio'>{per.bio}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className='detail__section'>
          <Text className='detail__section-title'>曲目 · 可试听</Text>
          {perf.tracks.map(t => {
            const playing = playingId === t.id
            return (
              <View key={t.id} className='detail__track' onClick={() => playTrack(t.id, t.audioUrl)}>
                <View className={`detail__play ${playing ? 'detail__play--on' : ''}`}>
                  <Icon name={playing ? 'pause' : 'play'} size={28} color={playing ? '#fff' : '#1a1a2e'} />
                </View>
                <View className='detail__track-info'>
                  <Text className='detail__track-title'>{t.title}</Text>
                  <Text className='detail__track-composer'>{t.composer}</Text>
                </View>
                <Text className='detail__track-dur'>{t.duration}</Text>
              </View>
            )
          })}
        </View>

        <View className='detail__spacer' />
      </ScrollView>

      <View className='detail__bar'>
        <View className='detail__bar-fav' onClick={onFav}>
          <Icon name={fav ? 'star-fill' : 'star'} size={48} color='#c9a96a' />
        </View>
        <View className='detail__bar-cal' onClick={addToCalendar}>
          <Icon name='calendar-add' size={44} color='#fff' />
        </View>
        <View className='detail__bar-buy' onClick={buyTicket}>
          <Icon name='ticket' size={40} color='#fff' />
          <Text className='detail__bar-buytext'>¥{perf.priceFrom} 起</Text>
        </View>
      </View>
    </View>
  )
}
