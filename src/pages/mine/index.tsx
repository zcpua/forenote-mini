import { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { getUser, logout, getFavorites } from '../../store'
import { getThemePref, setThemePref, THEME_LABEL, ThemePref } from '../../store/theme'
import { UserInfo } from '../../types'
import Icon from '../../components/Icon'
import ThemeView from '../../components/ThemeView'
import { useOverlay } from '../../hooks/useOverlay'
import { useStatusBar } from '../../hooks/useStatusBar'
import './index.scss'

const GROUP_URL = 'https://work.weixin.qq.com/gm/83b9eec90f067761bcf761a8e09e3dbd'
// 关于我们 / 赞赏支持 暂时共用同一个外链
const EXTERNAL_LINK = 'https://ifdian.net/a/erictik'

export default function Mine() {
  const statusBar = useStatusBar()
  const overlay = useOverlay()
  const [user, setUserState] = useState<UserInfo | null>(null)
  const [favCount, setFavCount] = useState(0)
  const [pref, setPref] = useState<ThemePref>(getThemePref())

  const refresh = () => {
    setUserState(getUser())
    setFavCount(getFavorites().length)
    setPref(getThemePref())
  }

  useDidShow(refresh)

  const chooseTheme = () => {
    const order: ThemePref[] = ['system', 'light', 'dark']
    Taro.showActionSheet({
      itemList: order.map(p => THEME_LABEL[p]),
      success: res => {
        const next = order[res.tapIndex]
        setThemePref(next)
        setPref(next)
      },
      fail: () => {}
    })
  }

  const goLogin = () => {
    if (user) {
      Taro.navigateTo({ url: '/pages/profile/index' })
    } else {
      Taro.navigateTo({ url: '/pages/login/index' })
    }
  }

  const goFavorites = () => {
    Taro.navigateTo({ url: '/pages/favorites/index' })
  }

  const openLink = (url: string, fallbackTitle: string) => {
    Taro.navigateTo({
      url: `/pages/webview/index?url=${encodeURIComponent(url)}`,
      fail: () => {
        Taro.setClipboardData({
          data: url,
          success: () => overlay.alert({
            title: fallbackTitle,
            content: `链接已复制，请在浏览器中打开：${url}`
          })
        })
      }
    })
  }

  const showAbout = () => openLink(EXTERNAL_LINK, '关于我们')

  const showReward = () => openLink(EXTERNAL_LINK, '赞赏支持')

  const onLogout = () => {
    overlay.confirm(
      { title: '退出登录', content: '确定要退出当前账号吗？' },
      () => {
        logout()
        refresh()
        Taro.showToast({ title: '已退出', icon: 'none' })
      }
    )
  }

  const onJoinGroupComplete = (e: { detail: { errcode: number; notifytype: number } }) => {
    const { errcode } = e.detail
    if (errcode === 0) return
    const msg: Record<number, string> = {
      [-3009]: '群聊已满员',
      [-3010]: '群聊已解散',
      [-3011]: '你已被该群拉黑',
      [-3012]: '群聊已满员'
    }
    if (msg[errcode]) {
      Taro.showToast({ title: msg[errcode], icon: 'none' })
    }
  }

  return (
    <ThemeView className='mine' tabBar>
      <View className='mine__header' style={{ paddingTop: `${statusBar + 40}px` }}>
        <View className='mine__profile' onClick={goLogin}>
          <Image
            className='mine__avatar'
            src={user?.avatarUrl || 'https://picsum.photos/seed/guest/200/200'}
            mode='aspectFill'
          />
          <View className='mine__info'>
            <Text className='mine__name'>{user ? user.nickName : '点击登录'}</Text>
            <Text className='mine__sign'>
              {user ? (user.signature || '编辑个人资料 ›') : '登录后收藏与同步演出日程'}
            </Text>
          </View>
          <Text className='mine__arrow'>›</Text>
        </View>
      </View>

      <View className='mine__menu'>
        <View className='mine__item' onClick={goFavorites}>
          <Icon name='star' size={40} color='#c9a96a' className='mine__item-icon' />
          <Text className='mine__item-label'>我的收藏</Text>
          <Text className='mine__item-extra'>{favCount}</Text>
          <Icon name='chevron-right' size={32} color='#c0c0c8' />
        </View>
        {user && (
          <View className='mine__item' onClick={() => Taro.navigateTo({ url: '/pages/profile/index' })}>
            <Icon name='edit' size={40} color='#c9a96a' className='mine__item-icon' />
            <Text className='mine__item-label'>修改资料</Text>
            <Icon name='chevron-right' size={32} color='#c0c0c8' />
          </View>
        )}
      </View>

      <View className='mine__menu'>
        <View className='mine__item' onClick={chooseTheme}>
          <Icon name='moon' size={40} color='#c9a96a' className='mine__item-icon' />
          <Text className='mine__item-label'>夜间模式</Text>
          <Text className='mine__item-extra'>{THEME_LABEL[pref]}</Text>
          <Icon name='chevron-right' size={32} color='#c0c0c8' />
        </View>
        <View className='mine__item' onClick={showAbout}>
          <Icon name='info' size={40} color='#c9a96a' className='mine__item-icon' />
          <Text className='mine__item-label'>关于我们</Text>
          <Icon name='chevron-right' size={32} color='#c0c0c8' />
        </View>
        <View className='mine__item' onClick={showReward}>
          <Icon name='heart' size={40} color='#c9a96a' className='mine__item-icon' />
          <Text className='mine__item-label'>赞赏支持</Text>
          <Icon name='chevron-right' size={32} color='#c0c0c8' />
        </View>
        <View className='mine__item mine__item--plugin'>
          <Icon name='users' size={40} color='#c9a96a' className='mine__item-icon' />
          <Text className='mine__item-label'>加群交流</Text>
          <Icon name='chevron-right' size={32} color='#c0c0c8' />
          <View className='mine__plugin-hit'>
            <cell
              url={GROUP_URL}
              contactText=' '
              paddingStyle={0}
              onCompletemessage={onJoinGroupComplete}
            />
          </View>
        </View>
      </View>

      {user && (
        <View className='mine__logout' onClick={onLogout}>
          <Icon name='logout' size={36} color='#e05555' />
          <Text className='mine__logout-text'>退出登录</Text>
        </View>
      )}

      {overlay.node}
    </ThemeView>
  )
}
