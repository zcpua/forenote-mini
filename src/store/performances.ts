import { useEffect, useState } from 'react'
import { fetchPerformances, fetchPerformance } from '../services/api'
import { mapPerformance, decoratePerformances } from '../data/mapper'
import { Performance } from '../types'

let cache: Performance[] = []
let inflight: Promise<Performance[]> | null = null

type Listener = () => void
const listeners = new Set<Listener>()
const emit = () => listeners.forEach(fn => fn())

export const getCachedPerformances = () => cache

/** 拉取演出列表（带模块级缓存）。重复调用复用同一个 Promise。 */
export function loadPerformances(force = false): Promise<Performance[]> {
  if (!force && cache.length) return Promise.resolve(cache)
  if (inflight) return inflight
  inflight = fetchPerformances()
    .then(raw => {
      cache = decoratePerformances(raw.map(mapPerformance), raw)
      emit()
      return cache
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

export function usePerformances(): { list: Performance[]; loading: boolean } {
  const [list, setList] = useState<Performance[]>(cache)
  const [loading, setLoading] = useState(cache.length === 0)

  useEffect(() => {
    const sync = () => setList([...cache])
    listeners.add(sync)
    loadPerformances()
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => {
      listeners.delete(sync)
    }
  }, [])

  return { list, loading }
}

export function getPerformanceById(id: string): Performance | undefined {
  return cache.find(p => p.id === id)
}

/** 详情页用：缓存命中直接返回，否则单独拉取并合入缓存。 */
export async function fetchPerformanceById(id: string): Promise<Performance | undefined> {
  const hit = getPerformanceById(id)
  if (hit) return hit
  try {
    const raw = await fetchPerformance(id)
    const mapped = mapPerformance(raw)
    cache = [...cache, mapped]
    emit()
    return mapped
  } catch {
    return undefined
  }
}

export function getPerformancesByDate(date: string): Performance[] {
  return cache.filter(p => p.date === date)
}

export function getPerformancesByPerformer(performerName: string): Performance[] {
  return cache.filter(p => p.performers.some(per => per.name === performerName || per.id === performerName))
}
