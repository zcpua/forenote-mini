import { Performance, Performer } from '../types'

const PIANIST: Performer = {
  id: 'p1',
  name: '李云迪',
  role: '钢琴',
  avatar: 'https://picsum.photos/seed/pianist/200/200',
  bio: '国际知名钢琴家，肖邦国际钢琴比赛冠军，以诗意细腻的演绎著称。'
}

const VIOLINIST: Performer = {
  id: 'p2',
  name: '吕思清',
  role: '小提琴',
  avatar: 'https://picsum.photos/seed/violin/200/200',
  bio: '帕格尼尼国际小提琴比赛金奖得主，演奏技巧精湛，音色温暖。'
}

const CONDUCTOR: Performer = {
  id: 'p3',
  name: '余隆',
  role: '指挥',
  avatar: 'https://picsum.photos/seed/conductor/200/200',
  bio: '著名指挥家，中国爱乐乐团艺术总监，多次执棒国际顶级乐团。'
}

const CELLIST: Performer = {
  id: 'p4',
  name: '王健',
  role: '大提琴',
  avatar: 'https://picsum.photos/seed/cello/200/200',
  bio: '享誉国际的大提琴演奏家，以深沉醇厚的音色闻名。'
}

const AUDIO = 'https://m701.music.126.net/sample.mp3'

export const PERFORMANCES: Performance[] = [
  {
    id: 'perf1',
    title: '肖邦之夜·钢琴独奏音乐会',
    cover: 'https://picsum.photos/seed/chopin/800/500',
    venue: '国家大剧院·音乐厅',
    city: '北京',
    date: '2026-06-18',
    time: '19:30',
    priceFrom: 280,
    banner: true,
    recommended: true,
    ticketUrl: 'https://www.chncpa.org/',
    intro: '一场献给浪漫主义大师肖邦的钢琴盛宴。曲目涵盖夜曲、叙事曲与练习曲，在指尖流淌的诗意中感受钢琴诗人的灵魂。',
    performers: [PIANIST],
    tracks: [
      { id: 't1', title: '夜曲 Op.9 No.2', composer: '肖邦', duration: '04:32', audioUrl: AUDIO },
      { id: 't2', title: '叙事曲 第一号 Op.23', composer: '肖邦', duration: '09:15', audioUrl: AUDIO },
      { id: 't3', title: '练习曲 Op.10 No.3 离别', composer: '肖邦', duration: '04:08', audioUrl: AUDIO }
    ]
  },
  {
    id: 'perf2',
    title: '四季·维瓦尔第小提琴协奏曲',
    cover: 'https://picsum.photos/seed/seasons/800/500',
    venue: '上海交响乐团音乐厅',
    city: '上海',
    date: '2026-06-21',
    time: '20:00',
    priceFrom: 180,
    banner: true,
    recommended: true,
    ticketUrl: 'https://www.shsymphony.com/',
    intro: '巴洛克永恒经典《四季》，用音符描绘春夏秋冬的流转。小提琴与乐团交织出大自然的万千气象。',
    performers: [VIOLINIST, CONDUCTOR],
    tracks: [
      { id: 't4', title: '春 第一乐章', composer: '维瓦尔第', duration: '03:21', audioUrl: AUDIO },
      { id: 't5', title: '夏 第三乐章', composer: '维瓦尔第', duration: '02:48', audioUrl: AUDIO },
      { id: 't6', title: '冬 第二乐章', composer: '维瓦尔第', duration: '02:15', audioUrl: AUDIO }
    ]
  },
  {
    id: 'perf3',
    title: '贝多芬第九交响曲·合唱',
    cover: 'https://picsum.photos/seed/beethoven/800/500',
    venue: '广州大剧院',
    city: '广州',
    date: '2026-06-25',
    time: '19:45',
    priceFrom: 380,
    banner: true,
    recommended: true,
    ticketUrl: 'https://www.gzdjy.org/',
    intro: '人类音乐史上的丰碑，《欢乐颂》响彻全场。百人合唱团与交响乐团联袂，奏响自由与博爱的崇高乐章。',
    performers: [CONDUCTOR, VIOLINIST, CELLIST],
    tracks: [
      { id: 't7', title: '第一乐章 庄严的快板', composer: '贝多芬', duration: '15:42', audioUrl: AUDIO },
      { id: 't8', title: '第四乐章 欢乐颂', composer: '贝多芬', duration: '24:30', audioUrl: AUDIO }
    ]
  },
  {
    id: 'perf4',
    title: '巴赫无伴奏大提琴组曲',
    cover: 'https://picsum.photos/seed/bach/800/500',
    venue: '深圳音乐厅',
    city: '深圳',
    date: '2026-07-02',
    time: '19:30',
    priceFrom: 220,
    recommended: true,
    ticketUrl: 'https://www.shenzhenconcerthall.com/',
    intro: '大提琴的圣经。一把大提琴，独自撑起整个宇宙的对话，纯粹而深邃。',
    performers: [CELLIST],
    tracks: [
      { id: 't9', title: '第一号组曲 前奏曲', composer: '巴赫', duration: '02:30', audioUrl: AUDIO },
      { id: 't10', title: '第三号组曲 布列舞曲', composer: '巴赫', duration: '03:12', audioUrl: AUDIO }
    ]
  },
  {
    id: 'perf5',
    title: '柴可夫斯基钢琴协奏曲之夜',
    cover: 'https://picsum.photos/seed/tchaikovsky/800/500',
    venue: '武汉琴台音乐厅',
    city: '武汉',
    date: '2026-07-08',
    time: '20:00',
    priceFrom: 260,
    recommended: true,
    ticketUrl: 'https://www.qintai.com/',
    intro: '气势磅礴的《第一钢琴协奏曲》，激情与抒情交织，是俄罗斯浪漫主义的巅峰之作。',
    performers: [PIANIST, CONDUCTOR],
    tracks: [
      { id: 't11', title: '第一钢琴协奏曲 第一乐章', composer: '柴可夫斯基', duration: '20:10', audioUrl: AUDIO },
      { id: 't12', title: '如歌的行板', composer: '柴可夫斯基', duration: '06:45', audioUrl: AUDIO }
    ]
  }
]

export function getPerformanceById(id: string): Performance | undefined {
  return PERFORMANCES.find(p => p.id === id)
}

export function getPerformancesByDate(date: string): Performance[] {
  return PERFORMANCES.filter(p => p.date === date)
}
