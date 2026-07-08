import { useState, useEffect } from 'react'
import { View, Image, Text, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { fetchPerformanceById } from '../../store/performances'
import { Performance } from '../../types'
import {
  isFavorite,
  isNotificationCreditActive,
  setNotificationCredit,
  subscribe,
  toggleFavorite,
} from '../../store'
import { getOpenid } from '../../services/auth'
import { ONSALE_TMPL_ID } from '../../services/api'
import Icon from '../../components/Icon'
import ThemeView from '../../components/ThemeView'
import { usePageShare } from '../../hooks/usePageShare'
import './index.scss'

const CALENDAR_SCOPE = 'scope.addPhoneCalendar'

export default function Detail() {
  const router = useRouter()
  const id = router.params.id || ''
  const [perf, setPerf] = useState<Performance | undefined>(undefined)
  const [fav, setFav] = useState(false)
  const [remindActive, setRemindActive] = useState(false)
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
    setRemindActive(isNotificationCreditActive(id))
  }, [id])

  useEffect(() => {
    const sync = () => {
      setFav(isFavorite(id))
      setRemindActive(isNotificationCreditActive(id))
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

  const showCalendarAuthGuide = (retry: () => void) => {
    Taro.showModal({
      title: '需要日历权限',
      content: '请在设置中开启“添加到日历”权限，开启后可把演出时间加入系统日历。',
      confirmText: '去授权',
      cancelText: '取消',
      success: res => {
        if (!res.confirm) return
        Taro.openSetting({
          success: settingRes => {
            const authSetting = settingRes.authSetting as Taro.AuthSetting & Record<typeof CALENDAR_SCOPE, boolean | undefined>
            if (authSetting[CALENDAR_SCOPE]) retry()
          }
        })
      }
    })
  }

  const addToCalendar = () => {
    const [y, m, d] = perf.date.split('-').map(Number)
    const [hh, mm] = perf.time.split(':').map(Number)
    const start = new Date(y, m - 1, d, hh, mm).getTime() / 1000

    const doAdd = () => Taro.addPhoneCalendar({
      title: perf.title,
      startTime: start,
      endTime: String(start + 7200),
      location: `${perf.city} ${perf.venue}`,
      description: perf.intro,
      alarm: true,
      alarmOffset: 3600,
      success: () => Taro.showToast({ title: '已添加到日历', icon: 'success' }),
      fail: () => {
        Taro.getSetting({
          success: settingRes => {
            const authSetting = settingRes.authSetting as Taro.AuthSetting & Record<typeof CALENDAR_SCOPE, boolean | undefined>
            if (authSetting[CALENDAR_SCOPE] === false) {
              showCalendarAuthGuide(doAdd)
              return
            }
            Taro.showToast({ title: '添加失败或已取消', icon: 'none' })
          },
          fail: () => Taro.showToast({ title: '添加失败或已取消', icon: 'none' })
        })
      }
    })

    Taro.getSetting({
      success: settingRes => {
        const authSetting = settingRes.authSetting as Taro.AuthSetting & Record<typeof CALENDAR_SCOPE, boolean | undefined>
        if (authSetting[CALENDAR_SCOPE] === false) {
          showCalendarAuthGuide(doAdd)
          return
        }
        doAdd()
      },
      fail: doAdd
    })
  }

  // Show the “提醒开票” action for未开票 演出, while keeping “加入日程”
  // and “去购票” visible so the existing detail-page actions do not regress.
  const canRemind = perf.saleState === 'pre_sale' || perf.saleState === 'unknown'

  const onRemind = async () => {
    if (!getOpenid()) {
      Taro.navigateTo({ url: '/pages/login/index' })
      return
    }
    if (!ONSALE_TMPL_ID) {
      Taro.showToast({ title: '提醒功能未配置', icon: 'none' })
      return
    }
    if (remindActive) {
      Taro.showToast({ title: '已设置开票提醒', icon: 'none' })
      return
    }
    try {
      const res = await Taro.requestSubscribeMessage({ tmplIds: [ONSALE_TMPL_ID] } as unknown as Parameters<typeof Taro.requestSubscribeMessage>[0])
      if ((res as Record<string, string>)[ONSALE_TMPL_ID] !== 'accept') {
        Taro.showToast({ title: '未开启提醒', icon: 'none' })
        return
      }
      setNotificationCredit(perf.id, true)
      Taro.showToast({ title: '已设置开票提醒', icon: 'success' })
    } catch (err) {
      console.warn('[remind] requestSubscribeMessage', err)
      Taro.showToast({ title: '授权失败，请重试', icon: 'none' })
    }
  }

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
        <View className='detail__bar-btn' onClick={addToCalendar}>
          <Icon name='calendar-add' size={36} color='#ffffff' />
          <Text className='detail__bar-btntext'>加入日程</Text>
        </View>
        {canRemind ? (
          <View
            className={`detail__bar-btn detail__bar-remind ${remindActive ? 'detail__bar-remind--on' : ''}`}
            onClick={onRemind}
          >
            <Icon name='calendar-add' size={36} color='#ffffff' />
            <Text className='detail__bar-btntext'>{remindActive ? '已提醒' : '提醒开票'}</Text>
          </View>
        ) : null}
        <View className='detail__bar-btn' onClick={buyTicket}>
          <Icon name='ticket' size={36} color='#ffffff' />
          <Text className='detail__bar-btntext'>去购票</Text>
        </View>
      </View>

    </ThemeView>
  )
}
