import Taro from '@tarojs/taro'
import { UserInfo } from '../types'

const FAV_KEY = 'favorites'
const USER_KEY = 'userInfo'

type Listener = () => void
const listeners = new Set<Listener>()

export function subscribe(fn: Listener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function emit() {
  listeners.forEach(fn => fn())
}

export function getFavorites(): string[] {
  return Taro.getStorageSync(FAV_KEY) || []
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id)
}

export function toggleFavorite(id: string): boolean {
  const list = getFavorites()
  const idx = list.indexOf(id)
  let added: boolean
  if (idx >= 0) {
    list.splice(idx, 1)
    added = false
  } else {
    list.push(id)
    added = true
  }
  Taro.setStorageSync(FAV_KEY, list)
  emit()
  return added
}

export function getUser(): UserInfo | null {
  return Taro.getStorageSync(USER_KEY) || null
}

export function setUser(info: UserInfo) {
  Taro.setStorageSync(USER_KEY, info)
  emit()
}

export function logout() {
  Taro.removeStorageSync(USER_KEY)
  emit()
}
