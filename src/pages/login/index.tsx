import { useState } from 'react'
import { View, Input, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { setUser } from '../../store'
import { useTheme } from '../../hooks/useTheme'
import './index.scss'

export default function Login() {
  const theme = useTheme()
  const [nick, setNick] = useState('')

  const doLogin = () => {
    const name = nick.trim() || '古典乐迷'
    setUser({
      nickName: name,
      avatarUrl: 'https://picsum.photos/seed/user/200/200',
      signature: ''
    })
    Taro.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 600)
  }

  return (
    <View className={`login theme-${theme}`}>
      <Image className='login__logo' src='https://picsum.photos/seed/music/200/200' mode='aspectFill' />
      <Text className='login__title'>欢迎来到古典乐汇</Text>
      <Text className='login__sub'>登录以收藏演出、同步日程</Text>

      <View className='login__field'>
        <Input
          className='login__input'
          placeholder='请输入昵称'
          value={nick}
          onInput={e => setNick(e.detail.value)}
        />
      </View>

      <View className='login__btn' onClick={doLogin}>
        <Text>登 录</Text>
      </View>
      <Text className='login__tip'>* 演示登录，信息仅保存在本地</Text>
    </View>
  )
}
