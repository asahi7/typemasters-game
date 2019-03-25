import { createRootNavigator } from './router'
import * as firebase from 'firebase'
import i18n from 'i18n-js'
import { Localization } from 'expo'

const en = {
  common: {
    nodata: 'We are sorry, but it seems no data is available, check your internet connection',
    backonline: 'Back online',
    nointernet: 'No internet connection'
  },
  main: {
    header: 'Compete With Others And Increase Your Typing Speed!',
    yourgamescount: 'You Played Games Today',
    totalgamescount: 'Total Played Games Today',
    lastgames: 'Last Games Today',
    chooselangtext: 'Choose your typing language and',
    playbutton: 'PLAY',
    signintosave: '*Sign in to save your progress.'
  },
  leaderboard: {
    header: 'Leaderboard',
    besttodaybycpm: 'Best Today Results By CPM',
    besttodaybyavgcpm: 'Best Average Results By CPM',
    bestbycpm: 'Best Results By CPM'
  }
}
const ru = {
  common: {
    nodata: 'Извините, но необходимые данные не могут быть найдены, проверьте свое интернет подключение',
    backonline: 'Снова онлайн',
    nointernet: 'Проблема с подключением к сети интернета'
  },
  main: {
    header: 'Повысьте свою скорость печатания, соревнуясь с другими',
    yourgamescount: 'Количестов игр за сегодня сыгранных вами',
    totalgamescount: 'Количество всех игр за сегодня',
    lastgames: 'Последние игры',
    chooselangtext: 'Выберите подходящий язык для печатания и',
    playbutton: 'ИГРАЙТЕ',
    signintosave: '*Авторизуйтесь для сохранения вашего прогресса'
  },
  leaderboard: {
    header: 'Статистика',
    besttodaybycpm: 'Лучшие результаты CPM за сегодня',
    besttodaybyavgcpm: 'Лучшие средние результаты CPM за сегодня',
    bestbycpm: 'Лучшие результаты CPM за все время'
  }
}

// TODO(aibek): check if async call is needed for Android in order to detect language change
i18n.fallbacks = true
i18n.translations = { en, ru, kk: ru }
i18n.locale = Localization.locale

const config = {
  apiKey: 'AIzaSyABqH90F1qdKwhSXci_SRERvBNn7GVJEV4',
  authDomain: 'typemasters-cc028.firebaseapp.com',
  databaseURL: 'https://typemasters-cc028.firebaseio.com',
  projectId: 'typemasters-cc028',
  storageBucket: 'typemasters-cc028.appspot.com',
  messagingSenderId: '1097557406122'
}
firebase.initializeApp(config)

export default createRootNavigator()
