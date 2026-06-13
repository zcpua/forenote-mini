export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/calendar/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/favorites/index',
    'pages/login/index',
    'pages/profile/index',
    'pages/webview/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1a1a2e',
    navigationBarTitleText: '古典乐汇',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#c9a96a',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '',
        iconPath: 'assets/tab/home.png',
        selectedIconPath: 'assets/tab/home_on.png'
      },
      {
        pagePath: 'pages/calendar/index',
        text: '',
        iconPath: 'assets/tab/calendar.png',
        selectedIconPath: 'assets/tab/calendar_on.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '',
        iconPath: 'assets/tab/mine.png',
        selectedIconPath: 'assets/tab/mine_on.png'
      }
    ]
  }
})
