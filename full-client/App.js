import { createRootNavigator } from './router'
import * as firebase from 'firebase'
import i18n from 'i18n-js'
import { Localization } from 'expo'

const en = {
  common: {
    noData: 'We are sorry, but it seems no data is available, check your internet connection',
    backOnline: 'Back online',
    noInternet: 'No internet connection',
    warn: 'Warning',
    success: 'Success',
    error: 'Error'
  },
  main: {
    header: 'Compete With Others And Increase Your Typing Speed!',
    yourGamesCount: 'You Played Games Today',
    totalGamesCount: 'Total Played Games Today',
    lastGames: 'Last Games Today',
    chooseLangText: 'Choose your typing language and',
    playButton: 'PLAY',
    signInToSave: '*Sign in to save your progress.'
  },
  leaderboard: {
    header: 'Leaderboard',
    bestTodayByCpm: 'Best Today Results By CPM',
    bestTodayByAvgCpm: 'Best Average Results By CPM',
    bestByCpm: 'Best Results By CPM'
  },
  personalPage: {
    header: 'Personal Page',
    cantSignOutOffline: 'Can not sign out during offline mode',
    general: 'General',
    nickname: 'Nickname',
    email: 'Email',
    country: 'Country',
    typingLanguage: 'Typing language',
    totalGames: 'Total games',
    averageCpm: 'Average cpm',
    averageAccuracy: 'Average accuracy',
    averageCpm10: 'Average cpm (last 10 games)',
    averageAccuracy10: 'Average accuracy (last 10 games)',
    gamesWon: 'Games won',
    bestResult: 'Best result',
    lastGame: 'Last game',
    lastGameAccuracy: 'Last game accuracy',
    firstGame: 'First game data',
    showCharts: 'Show charts',
    signOut: 'Sign out',
    dataMayNotUpdate: '*Data may not update instantly after the race.'
  },
  settings: {
    header: 'Settings',
    notSpecified: 'Not Specified',
    changeNickname: 'Change nickname',
    yourNickname: 'Your nickname',
    yourNicknameInput: 'Your nickname',
    country: 'Country',
    typingLanguage: 'Typing language',
    selectTypingLanguage: 'Select your preferred typing language',
    save: 'Save',
    saveSettingsOffline: 'No internet connection. Typing laguage successfully updated'
  },
  about: {
    header: 'About'
  }
}
const ru = {
  common: {
    noData: 'Извините, но необходимые данные не могут быть найдены, проверьте свое интернет подключение',
    backOnline: 'Снова онлайн',
    noInternet: 'Проблема с подключением к сети интернета',
    warn: 'Внимание',
    success: 'Отлично',
    error: 'Ошибка'
  },
  main: {
    header: 'Повысьте свою скорость печатания, соревнуясь с другими',
    yourGamesCount: 'Количестов игр за сегодня сыгранных вами',
    totalGamesCount: 'Количество всех игр за сегодня',
    lastGames: 'Последние игры',
    chooseLangText: 'Выберите подходящий язык для печатания и',
    playButton: 'ИГРАЙТЕ',
    signInToSave: '*Авторизуйтесь для сохранения вашего прогресса'
  },
  leaderboard: {
    header: 'Статистика',
    bestTodayByCpm: 'Лучшие результаты CPM за сегодня',
    bestTodayByAvgCpm: 'Лучшие средние результаты CPM за сегодня',
    bestByCpm: 'Лучшие результаты CPM за все время'
  },
  personalPage: {
    header: 'Личная страница',
    cantSignOutOffline: 'Невозможно выйти из аккаунта во время оффлайн режима',
    general: 'Общее',
    nickname: 'Ник',
    email: 'Электронный адрес',
    country: 'Страна',
    typingLanguage: 'Язык печатания',
    totalGames: 'Количество игр',
    averageCpm: 'Средний cpm',
    averageAccuracy: 'Средняя точность',
    averageCpm10: 'Средний cpm (последние 10 игр)',
    averageAccuracy10: 'Средняя точность (последние 10 игр)',
    gamesWon: 'Число выигранных игр',
    bestResult: 'Лучший результат',
    lastGame: 'Последняя игра',
    lastGameAccuracy: 'Точность последней игры',
    firstGame: 'Первая игра',
    showCharts: 'Показать графики',
    signOut: 'Выйти',
    dataMayNotUpdate: '*Данные могут обновляться не сразу.'
  },
  settings: {
    header: 'Настройки',
    notSpecified: 'Не указано',
    changeNickname: 'Поменять ник',
    yourNickname: 'Ваш ник',
    yourNicknameInput: 'Ваш ник',
    country: 'Страна',
    typingLanguage: 'Язык печатания',
    selectTypingLanguage: 'Выберите свой предпочитаемый язык печатания',
    save: 'Сохранить',
    saveSettingsOffline: 'Нет подключения к сети интернет. Язык печатания был обновлен'
  },
  about: {
    header: 'О нас'
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
