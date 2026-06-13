import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, Swiper, SwiperItem, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PERFORMANCES } from '../../data/performances'
import { addDays, dateKey, sameDay, startOfWeek } from '../../utils/date'
import { colorOf } from '../../utils/color'
import { Performance } from '../../types'
import Icon from '../../components/Icon'
import { useTheme } from '../../hooks/useTheme'
import { useStatusBar } from '../../hooks/useStatusBar'
import './index.scss'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const MAX_BARS = 3
const SPAN_MONTHS = 12
const DAY_SPAN = 15
const DAY_LEN = DAY_SPAN * 2 + 1
const WEEK_SPAN = 12
const WEEK_LEN = WEEK_SPAN * 2 + 1
const DAY_MS = 24 * 60 * 60 * 1000

type Cell = { date: Date; inMonth: boolean }
type MonthData = { y: number; m: number; cells: Cell[] }

const buildMonthCells = (year: number, month: number): Cell[] => {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const cells: Cell[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, i + 1 - startOffset)
    cells.push({ date: d, inMonth: d.getMonth() === month })
  }
  return cells
}

const buildMonths = (anchor: Date): MonthData[] => {
  const list: MonthData[] = []
  for (let i = -SPAN_MONTHS; i <= SPAN_MONTHS; i++) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() + i, 1)
    list.push({ y: d.getFullYear(), m: d.getMonth(), cells: buildMonthCells(d.getFullYear(), d.getMonth()) })
  }
  return list
}

export default function Calendar() {
  const theme = useTheme()
  const statusBar = useStatusBar()
  const today = useMemo(() => new Date(), [])
  const months = useMemo(() => buildMonths(today), [today])

  const [mode, setMode] = useState<'month' | 'day'>('month')
  const [monthIdx, setMonthIdx] = useState(SPAN_MONTHS)

  const [dayAnchor, setDayAnchor] = useState(today)
  const [dayIdx, setDayIdx] = useState(DAY_SPAN)
  const [weekIdx, setWeekIdx] = useState(WEEK_SPAN)
  const [dayMounted, setDayMounted] = useState(false)

  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [zooming, setZooming] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const eventsByDay = useMemo(() => {
    const map: Record<string, Performance[]> = {}
    PERFORMANCES.forEach(p => {
      if (!map[p.date]) map[p.date] = []
      map[p.date].push(p)
    })
    Object.values(map).forEach(l => l.sort((a, b) => a.time.localeCompare(b.time)))
    return map
  }, [])

  const allDays = useMemo(
    () => Array.from({ length: DAY_LEN }, (_, i) => addDays(dayAnchor, i - DAY_SPAN)),
    [dayAnchor]
  )
  const weekAnchorStart = useMemo(() => startOfWeek(dayAnchor), [dayAnchor])
  const allWeeks = useMemo(
    () => Array.from({ length: WEEK_LEN }, (_, i) => {
      const start = addDays(weekAnchorStart, (i - WEEK_SPAN) * 7)
      return Array.from({ length: 7 }, (__, k) => addDays(start, k))
    }),
    [weekAnchorStart]
  )

  const activeDate = allDays[dayIdx] || dayAnchor

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const cursor = months[monthIdx]

  const goToday = () => {
    if (mode === 'month') {
      setMonthIdx(SPAN_MONTHS)
    } else {
      enterDay(today, true)
    }
  }

  // 钻入某天：以被点格子为原点放大月历并淡出，随后切换到日视图。
  const enterDay = (d: Date, skipZoom = false, row?: number, col?: number) => {
    setDayAnchor(d)
    setDayIdx(DAY_SPAN)
    setWeekIdx(WEEK_SPAN)
    setDayMounted(true)
    if (skipZoom) {
      setMode('day')
      return
    }
    if (row !== undefined && col !== undefined) {
      setOrigin({ x: ((col + 0.5) / 7) * 100, y: ((row + 0.5) / 6) * 100 })
    }
    setZooming(true)
    timer.current = setTimeout(() => {
      setMode('day')
      setZooming(false)
    }, 240)
  }

  const backToMonth = () => {
    setMode('month')
    timer.current = setTimeout(() => setDayMounted(false), 260)
  }

  const dayIdxOf = (d: Date) =>
    DAY_SPAN + Math.round((d.getTime() - dayAnchor.getTime()) / DAY_MS)
  const weekIdxOf = (d: Date) =>
    WEEK_SPAN + Math.round((startOfWeek(d).getTime() - weekAnchorStart.getTime()) / (7 * DAY_MS))

  const onDayChange = (e: { detail: { current: number; source?: string } }) => {
    if (e.detail.source === '') return
    const next = e.detail.current
    setDayIdx(next)
    const w = weekIdxOf(allDays[next])
    if (w >= 0 && w < WEEK_LEN && w !== weekIdx) setWeekIdx(w)
  }

  const onWeekChange = (e: { detail: { current: number; source?: string } }) => {
    if (e.detail.source === '') return
    const next = e.detail.current
    setWeekIdx(next)
    const wd = activeDate.getDay()
    const ni = dayIdxOf(allWeeks[next][wd])
    if (ni >= 0 && ni < DAY_LEN) setDayIdx(ni)
  }

  const tapWeekCell = (d: Date) => {
    const ni = dayIdxOf(d)
    if (ni >= 0 && ni < DAY_LEN) setDayIdx(ni)
    else enterDay(d, true)
  }

  const goDetail = (id: string) => Taro.navigateTo({ url: `/pages/detail/index?id=${id}` })

  return (
    <View className={`cal theme-${theme}`}>
      <View className='cal__header' style={{ paddingTop: `${statusBar + 12}px` }}>
        <View className='cal__title-row'>
          {mode === 'day' ? (
            <View className='cal__day-titlebar' onClick={backToMonth}>
              <Icon name='chevron-left' size={40} color='#c9a96a' />
              <Text className='cal__back-month'>{activeDate.getMonth() + 1}月</Text>
            </View>
          ) : (
            <Text className='cal__title'>{cursor.y}年 {MONTHS[cursor.m]}</Text>
          )}
          <View className='cal__nav-btn' onClick={goToday}>今天</View>
        </View>
        <View className='cal__weekdays'>
          {WEEKDAYS.map((w, i) => (
            <Text key={w} className={`cal__weekday ${i === 0 || i === 6 ? 'cal__weekday--weekend' : ''}`}>{w}</Text>
          ))}
        </View>
      </View>

      <View className='cal__body'>
        <View className={`cal__layer cal__layer--month ${mode === 'day' ? 'cal__layer--hidden' : ''}`}>
          <Swiper
            className='cal__pages'
            vertical
            current={monthIdx}
            onChange={e => setMonthIdx(e.detail.current)}
            skipHiddenItemLayout
          >
            {months.map((month, mi) => {
              const near = Math.abs(mi - monthIdx) <= 1
              return (
                <SwiperItem key={`${month.y}-${month.m}`} className='cal__page'>
                  {near && (
                    <View
                      className={`cal__grid ${zooming ? 'cal__grid--zooming' : ''}`}
                      style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
                    >
                      {Array.from({ length: 6 }).map((_, row) => (
                        <View key={row} className='cal__row'>
                          {month.cells.slice(row * 7, row * 7 + 7).map((cell, col) => {
                            const k = dateKey(cell.date)
                            const events = eventsByDay[k] || []
                            const isToday = sameDay(cell.date, today)
                            const visible = events.slice(0, MAX_BARS)
                            const extra = events.length - visible.length
                            return (
                              <View
                                key={k}
                                className={`cal__cell ${cell.inMonth ? '' : 'cal__cell--out'} ${isToday ? 'cal__cell--today' : ''}`}
                                onClick={() => enterDay(cell.date, false, row, col)}
                              >
                                <View className='cal__cell-head'>
                                  <Text className='cal__cell-num'>{cell.date.getDate()}</Text>
                                </View>
                                <View className='cal__bars'>
                                  {visible.map(ev => {
                                    const c = colorOf(ev.id)
                                    return (
                                      <View key={ev.id} className='cal__bar' style={{ background: c.bg, borderLeftColor: c.bar }}>
                                        <Text className='cal__bar-text' style={{ color: c.fg }}>{ev.title}</Text>
                                      </View>
                                    )
                                  })}
                                  {extra > 0 && <Text className='cal__more'>+{extra}</Text>}
                                </View>
                              </View>
                            )
                          })}
                        </View>
                      ))}
                    </View>
                  )}
                </SwiperItem>
              )
            })}
          </Swiper>
        </View>

        {dayMounted && (
          <View className={`cal__layer cal__layer--day ${mode === 'day' ? '' : 'cal__layer--down'}`}>
            <Swiper className='cal__weekstrip' current={weekIdx} onChange={onWeekChange} skipHiddenItemLayout>
              {allWeeks.map((week, i) => (
                <SwiperItem key={i} className='cal__weekitem'>
                  {Math.abs(i - weekIdx) <= 1 && (
                    <View className='cal__weekrow'>
                      {week.map(d => {
                        const isActive = sameDay(d, activeDate)
                        const isToday = sameDay(d, today)
                        const has = (eventsByDay[dateKey(d)] || []).length > 0
                        return (
                          <View
                            key={d.getTime()}
                            className={`cal__wcell ${isActive ? 'cal__wcell--active' : ''} ${!isActive && isToday ? 'cal__wcell--today' : ''}`}
                            onClick={() => tapWeekCell(d)}
                          >
                            <Text className='cal__wcell-num'>{d.getDate()}</Text>
                            {has && <View className='cal__wcell-dot' />}
                          </View>
                        )
                      })}
                    </View>
                  )}
                </SwiperItem>
              ))}
            </Swiper>

            <Swiper className='cal__days' current={dayIdx} onChange={onDayChange} skipHiddenItemLayout>
              {allDays.map((d, i) => {
                if (Math.abs(i - dayIdx) > 1) return <SwiperItem key={i} className='cal__dayitem' />
                const events = eventsByDay[dateKey(d)] || []
                return (
                  <SwiperItem key={i} className='cal__dayitem'>
                    <ScrollView scrollY className='cal__dayscroll'>
                      {events.length === 0 ? (
                        <View className='cal__empty'>
                          <Icon name='music' size={96} color='#d8d8de' />
                          <Text className='cal__empty-text'>这一天还很安静</Text>
                          <Text className='cal__empty-hint'>左右滑动查看其它日期</Text>
                        </View>
                      ) : (
                        <View className='cal__list'>
                          {events.map(ev => {
                            const c = colorOf(ev.id)
                            return (
                              <View key={ev.id} className='cal__event' onClick={() => goDetail(ev.id)}>
                                <View className='cal__time'>
                                  <Text className='cal__time-start'>{ev.time}</Text>
                                </View>
                                <View className='cal__card' style={{ background: c.bg, borderLeftColor: c.bar }}>
                                  <Image className='cal__card-cover' src={ev.cover} mode='aspectFill' />
                                  <View className='cal__card-body'>
                                    <Text className='cal__card-title' style={{ color: c.fg }}>{ev.title}</Text>
                                    <Text className='cal__card-meta'>{ev.city} · {ev.venue}</Text>
                                    <Text className='cal__card-meta'>{ev.performers.map(p => p.name).slice(0, 2).join(' · ')}</Text>
                                  </View>
                                </View>
                              </View>
                            )
                          })}
                        </View>
                      )}
                    </ScrollView>
                  </SwiperItem>
                )
              })}
            </Swiper>
          </View>
        )}
      </View>
    </View>
  )
}
