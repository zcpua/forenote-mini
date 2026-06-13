import { useState, useEffect } from 'react'
import { View, Input, Text, Image, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getUser, setUser } from '../../store'
import { useTheme } from '../../hooks/useTheme'
import './index.scss'

export default function Profile() {
  const theme = useTheme()
  const [nick, setNick] = useState('')
  const [sign, setSign] = useState('')
  const [avatar, setAvatar] = useState('')

  useEffect(() => {
    const u = getUser()
    if (u) {
      setNick(u.nickName)
      setSign(u.signature)
      setAvatar(u.avatarUrl)
    }
  }, [])

  const chooseAvatar = () => {
    Taro.chooseImage({
      count: 1,
      success: res => setAvatar(res.tempFilePaths[0]),
      fail: () => {}
    })
  }

  const save = () => {
    if (!nick.trim()) {
      Taro.showToast({ title: '昵称不能为空', icon: 'none' })
      return
    }
    setUser({
      nickName: nick.trim(),
      signature: sign.trim(),
      avatarUrl: avatar || 'https://picsum.photos/seed/user/200/200'
    })
    Taro.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 600)
  }

  return (
    <View className={`profile theme-${theme}`}>
      <View className='profile__avatar-row' onClick={chooseAvatar}>
        <Image
          className='profile__avatar'
          src={avatar || 'https://picsum.photos/seed/user/200/200'}
          mode='aspectFill'
        />
        <Text className='profile__avatar-tip'>点击更换头像</Text>
      </View>

      <View className='profile__field'>
        <Text className='profile__label'>昵称</Text>
        <Input
          className='profile__input'
          placeholder='请输入昵称'
          value={nick}
          onInput={e => setNick(e.detail.value)}
        />
      </View>

      <View className='profile__field profile__field--col'>
        <Text className='profile__label'>个性签名</Text>
        <Textarea
          className='profile__textarea'
          placeholder='写点什么吧…'
          value={sign}
          maxlength={50}
          onInput={e => setSign(e.detail.value)}
        />
      </View>

      <View className='profile__btn' onClick={save}>
        <Text>保 存</Text>
      </View>
    </View>
  )
}
