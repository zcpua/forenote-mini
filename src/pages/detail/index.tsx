import { useState, useEffect } from 'react'
import { View, Image, Text, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { fetchPerformanceById } from '../../store/performances'
import { Performance } from '../../types'
import { isFavorite, subscribe, toggleFavorite } from '../../store'
import { getOpenid } from '../../services/auth'
import Icon from '../../components/Icon'
import ThemeView from '../../components/ThemeView'
import { usePageShare } from '../../hooks/usePageShare'
import './index.scss'

export default function Detail() {
  const router = useRouter()
  const id = router.params.id || ''
  const [perf, setPerf] = useState<Performance | undefined>(undefined)
  const [fav, setFav] = useState(false)
  const [tabIndex, setTabIndex] = useState(0)
  const tabs = ['演出介绍', '演奏者', '曲目']
  usePageShare({
    title: perf ? `${perf.title} | FORENOTE有谱` : 'FORENOTE有谱 | 演出详情',
    imageUrl: perf?.cover
  })

  useEffect(() => {
    fetchPerformanceById(id).then(p => {
      setPerf(p)
      Taro.setNavigationBarTitle({ title: p ? p.title : '演出详情' })
    })
    setFav(isFavorite(id))
  }, [id])

  useEffect(() => {
    const sync = () => {
      setFav(isFavorite(id))
    }
    const unsub = subscribe(sync)
    return () => { unsub() }
  }, [id])

  if (!perf) {
    return (
      <ThemeView className='detail'>
        <View className='detail__loading'><Text>加载中…</Text></View>
      </ThemeView>
    )
  }

  const onFav = () => {
    if (!getOpenid()) {
      Taro.navigateTo({ url: '/pages/login/index' })
      return
    }
    const added = toggleFavorite(perf.id)
    setFav(added)
    Taro.showToast({ title: added ? '已收藏' : '已取消收藏', icon: 'none' })
  }

  const buyTicket = () => {
    Taro.setClipboardData({
      data: perf.ticketUrl,
      success: () => {
        Taro.showModal({
          title: '前往购票',
          content: `购票链接已复制：${perf.ticketUrl}  请在浏览器中打开`,
          showCancel: false,
          confirmText: '知道了'
        })
      }
    })
  }

  // Show the "提醒我开票" button only for未开票 演出. Explicit "unknown" is
  // included because several scrapers default to "unknown" when the upstream
  // shape is ambiguous — users can still opt in and receive a push when the
  // state later transitions to on_sale.
  const canBuyTicket = perf.saleState === 'on_sale'

  return (
    <ThemeView className='detail'>
      <View className='detail__head'>
        <Text className='detail__title'>{perf.title}</Text>
        <View className='detail__tags'>
          <Text className='detail__tag'>{perf.date} {perf.time}</Text>
          <Text className='detail__tag'>{perf.city} · {perf.venue}</Text>
        </View>
      </View>

      <View className='detail__tabs'>
        {tabs.map((tab, index) => (
          <View
            key={tab}
            className={`detail__tab ${tabIndex === index ? 'detail__tab--active' : ''}`}
            onClick={() => setTabIndex(index)}
          >
            <Text className='detail__tab-text'>{tab}</Text>
          </View>
        ))}
      </View>

      <Swiper
        className='detail__swiper'
        current={tabIndex}
        onChange={e => setTabIndex(e.detail.current)}
        skipHiddenItemLayout
      >
        <SwiperItem className='detail__pane'>
          <ScrollView scrollY className='detail__pane-scroll'>
            <View className='detail__section'>
              <Image className='detail__cover' src={perf.cover} mode='aspectFill' />
              {perf.introImages.length > 0 ? (
                <View className='detail__intro-images'>
                  {perf.introImages.map((url, index) => (
                    <Image key={`${url}-${index}`} className='detail__intro-image' src={url} mode='widthFix' />
                  ))}
                </View>
              ) : null}
              <Text className='detail__intro'>{perf.intro}</Text>
            </View>
            <View className='detail__spacer' />
          </ScrollView>
        </SwiperItem>

        <SwiperItem className='detail__pane'>
          <ScrollView scrollY className='detail__pane-scroll'>
            <View className='detail__section'>
              {perf.performers.length > 0 ? (
                <View className='detail__performers'>
                  {perf.performers.map(per => (
                    <View key={per.id} className='detail__performer'>
                      {per.role ? <Text className='detail__performer-role'>{per.role}</Text> : null}
                      <Text className='detail__performer-name'>{per.name}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className='detail__empty'>暂无演奏者信息</Text>
              )}
            </View>
            <View className='detail__spacer' />
          </ScrollView>
        </SwiperItem>

        <SwiperItem className='detail__pane'>
          <ScrollView scrollY className='detail__pane-scroll'>
            <View className='detail__section'>
              {perf.tracks.length > 0 ? perf.tracks.map(t => (
                <View key={t.id} className='detail__track'>
                  <View className='detail__track-info'>
                    <Text className='detail__track-title'>{t.title}</Text>
                    {t.composer ? <Text className='detail__track-composer'>{t.composer}</Text> : null}
                  </View>
                </View>
              )) : (
                <Text className='detail__empty'>暂无曲目信息</Text>
              )}
            </View>
            <View className='detail__spacer' />
          </ScrollView>
        </SwiperItem>
      </Swiper>

      <View className='detail__bar'>
        <View className='detail__bar-fav' onClick={onFav}>
          <Icon name={fav ? 'star-fill' : 'star'} size={48} color='#c9a96a' />
        </View>
        {canBuyTicket ? (
          <View className='detail__bar-btn' onClick={buyTicket}>
            <Icon name='ticket' size={36} color='#ffffff' />
            <Text className='detail__bar-btntext'>去购票</Text>
          </View>
        ) : null}
      </View>

    </ThemeView>
  )
}
