import { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { getUser, logout, getFavorites } from '../../store'
import { getThemePref, setThemePref, THEME_LABEL, ThemePref } from '../../store/theme'
import { UserInfo } from '../../types'
import Icon from '../../components/Icon'
import { useTheme } from '../../hooks/useTheme'
import { useStatusBar } from '../../hooks/useStatusBar'
import './index.scss'

export default function Mine() {
  const theme = useTheme()
  const statusBar = useStatusBar()
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
      }
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

  const showAbout = () => {
    Taro.showModal({
      title: '关于我们',
      content: '古典乐汇 v1.0\n汇聚每一场值得珍藏的古典音乐演出，发现、收藏、同步你的音乐日程。',
      showCancel: false,
      confirmText: '知道了'
    })
  }

  const goFeedback = () => {
    Taro.showModal({
      title: '意见反馈',
      content: '感谢你的建议！可发送邮件至 feedback@cantabile.com，我们会认真阅读每一条反馈。',
      confirmText: '复制邮箱',
      cancelText: '关闭',
      success: res => {
        if (res.confirm) {
          Taro.setClipboardData({ data: 'feedback@cantabile.com' })
        }
      }
    })
  }

  const showReward = () => {
    const url = 'https://ifdian.net/a/erictik'
    Taro.navigateTo({
      url: `/pages/webview/index?url=${encodeURIComponent(url)}`,
      fail: () => {
        Taro.setClipboardData({
          data: url,
          success: () => Taro.showModal({
            title: '赞赏支持',
            content: `链接已复制，请在浏览器中打开：\n${url}`,
            showCancel: false
          })
        })
      }
    })
  }

  const onLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success: res => {
        if (res.confirm) {
          logout()
          refresh()
          Taro.showToast({ title: '已退出', icon: 'none' })
        }
      }
    })
  }

  return (
    <View className={`mine theme-${theme}`}>
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
        <View className='mine__item' onClick={goFeedback}>
          <Icon name='message' size={40} color='#c9a96a' className='mine__item-icon' />
          <Text className='mine__item-label'>意见反馈</Text>
          <Icon name='chevron-right' size={32} color='#c0c0c8' />
        </View>
        <View className='mine__item' onClick={showReward}>
          <Icon name='heart' size={40} color='#c9a96a' className='mine__item-icon' />
          <Text className='mine__item-label'>赞赏支持</Text>
          <Icon name='chevron-right' size={32} color='#c0c0c8' />
        </View>
      </View>

      {user && (
        <View className='mine__logout' onClick={onLogout}>
          <Icon name='logout' size={36} color='#e05555' />
          <Text className='mine__logout-text'>退出登录</Text>
        </View>
      )}
    </View>
  )
}
