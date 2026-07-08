import Taro from '@tarojs/taro'
import { UserInfo } from '../types'
import {
  apiAddFavorite,
  apiAddNotificationCredit,
  apiFavoriteIds,
  apiNotificationCreditIds,
  apiRemoveFavorite,
  apiRemoveNotificationCredit,
} from '../services/api'

const FOLLOW_KEY = 'follows'
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

// ---- Favorites（后端同步 + 内存缓存）----
// 缓存为收藏的演出 id 集合。读接口同步返回缓存，写接口乐观更新并同步后端。
let favCache = new Set<string>()

export function getFavorites(): string[] {
  return [...favCache]
}

export function isFavorite(id: string): boolean {
  return favCache.has(id)
}

/** app 启动 / 登录后调用，从后端水合收藏列表。 */
export async function hydrateFavorites(): Promise<void> {
  try {
    const { ids } = await apiFavoriteIds()
    favCache = new Set(ids)
    emit()
  } catch {
    // 未登录 / 不在微信内：保持空缓存。
  }
}

/** 乐观切换收藏，失败回滚。返回切换后的状态（true=已收藏）。 */
export function toggleFavorite(id: string): boolean {
  const added = !favCache.has(id)
  if (added) favCache.add(id)
  else favCache.delete(id)
  emit()

  const req = added ? apiAddFavorite(id) : apiRemoveFavorite(id)
  req.catch(() => {
    if (added) favCache.delete(id)
    else favCache.add(id)
    emit()
    Taro.showToast({ title: '操作失败，请稍后再试', icon: 'none' })
  })
  return added
}

export function removeFavorite(id: string): Promise<void> {
  const had = favCache.has(id)
  favCache.delete(id)
  emit()

  return apiRemoveFavorite(id)
    .then(() => undefined)
    .catch(err => {
      if (had) {
        favCache.add(id)
        emit()
      }
      throw err
    })
}

// ---- Follows（本地 Storage，后端无演奏家实体）----
export function getFollows(): string[] {
  return Taro.getStorageSync(FOLLOW_KEY) || []
}

export function isFollowing(id: string): boolean {
  return getFollows().includes(id)
}

export function toggleFollow(id: string): boolean {
  const list = getFollows()
  const idx = list.indexOf(id)
  let added: boolean
  if (idx >= 0) {
    list.splice(idx, 1)
    added = false
  } else {
    list.push(id)
    added = true
  }
  Taro.setStorageSync(FOLLOW_KEY, list)
  emit()
  return added
}

// ---- Notification credits (开票提醒) ----
// Same shape as favorites: cache the id set, hydrate on login, optimistic
// updates. The credit is "active" while consumed_at and failed_at are NULL
// server-side — once the notifier pushes, the server marks it consumed and
// the next hydrate drops it from the cache (button label resets).
let creditCache = new Set<string>()

export function isNotificationCreditActive(id: string): boolean {
  return creditCache.has(id)
}

export async function hydrateNotificationCredits(): Promise<void> {
  try {
    const { ids } = await apiNotificationCreditIds()
    creditCache = new Set(ids)
    emit()
  } catch {
    // 未登录 / 不在微信内：保持空缓存。
  }
}

/**
 * 乐观地把一条演出标记为“已开启开票提醒”。失败回滚并 toast。返回切换后的状态。
 * 只在 Taro.requestSubscribeMessage 返回 accept 之后调用；这里不再触发订阅授权。
 */
export function setNotificationCredit(id: string, active: boolean): boolean {
  const prev = creditCache.has(id)
  if (active) creditCache.add(id)
  else creditCache.delete(id)
  emit()

  const req = active ? apiAddNotificationCredit(id) : apiRemoveNotificationCredit(id)
  req.catch(() => {
    if (active) creditCache.delete(id)
    else if (prev) creditCache.add(id)
    emit()
    Taro.showToast({ title: '操作失败，请稍后再试', icon: 'none' })
  })
  return active
}

// ---- User（本地缓存，由 services/auth 同步后端）----
export function getUser(): UserInfo | null {
  return Taro.getStorageSync(USER_KEY) || null
}

export function setUser(info: UserInfo) {
  Taro.setStorageSync(USER_KEY, info)
  emit()
}

export function logout() {
  Taro.removeStorageSync(USER_KEY)
  favCache = new Set()
  creditCache = new Set()
  emit()
}
