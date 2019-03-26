import React from 'react'
import { createStackNavigator, createBottomTabNavigator, createSwitchNavigator } from 'react-navigation'
import { Icon } from 'react-native-elements'
import Main from './screens/Main'
import Game from './screens/Game'
import Leaderboard from './screens/Leaderboard'
import SignIn from './screens/SignIn'
import SignUp from './screens/SignUp'
import PersonalPage from './screens/PersonalPage'
import Settings from './screens/Settings'
import About from './screens/About'
import AuthLoading from './screens/AuthLoading'
import PersonalCharts from './screens/PersonalCharts'
import EmailVerificationPage from './screens/EmailVerificationPage'
import ForgotPassword from './screens/ForgotPassword'
import i18n from 'i18n-js'

const MainStack = createStackNavigator({
  Main: {
    screen: Main,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  },
  Game: {
    screen: Game,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  }
}, { initialRouteName: 'Main' })

const PersonalPageStack = createStackNavigator({
  PersonalPage: {
    screen: PersonalPage,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  },
  PersonalCharts: {
    screen: PersonalCharts,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  }
}, { initialRouteName: 'PersonalPage' })

const AuthStack = createStackNavigator({
  SignUp: {
    screen: SignUp,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  },
  SignIn: {
    screen: SignIn,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  },
  EmailVerificationPage: {
    screen: EmailVerificationPage,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  },
  ForgotPassword: {
    screen: ForgotPassword,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  }
}, { initialRouteName: 'SignIn' })

const AuthSwitchNavigator = createSwitchNavigator({
  AuthLoading: {
    screen: AuthLoading,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  },
  PersonalPage: PersonalPageStack,
  Auth: AuthStack
}, { initialRouteName: 'AuthLoading' })

const tabBarIconSize = 25

const Tabs = () => createBottomTabNavigator({
  Main: {
    screen: MainStack,
    navigationOptions: {
      tabBarLabel: i18n.t('navigation.main'),
      tabBarIcon: ({ tintColor }) => <Icon name='md-home' type='ionicon' size={tabBarIconSize}
        color={tintColor} />
    }
  },
  Leaderboard: {
    screen: Leaderboard,
    navigationOptions: {
      tabBarLabel: i18n.t('navigation.leaderboard'),
      tabBarIcon: ({ tintColor }) => <Icon name='md-stats' type='ionicon' size={tabBarIconSize}
        color={tintColor} />
    }
  },
  PersonalPage: {
    screen: AuthSwitchNavigator,
    navigationOptions: {
      tabBarLabel: i18n.t('navigation.personalPage'),
      tabBarIcon: ({ tintColor }) => <Icon name='md-body' type='ionicon' size={tabBarIconSize}
        color={tintColor} />
    }
  },
  Settings: {
    screen: Settings,
    navigationOptions: {
      tabBarLabel: i18n.t('navigation.settings'),
      tabBarIcon: ({ tintColor }) => <Icon name='md-build' type='ionicon' size={tabBarIconSize}
        color={tintColor} />
    }
  },
  About: {
    screen: About,
    navigationOptions: {
      tabBarLabel: i18n.t('navigation.about'),
      tabBarIcon: ({ tintColor }) => <Icon name='md-information-circle' type='ionicon'
        size={tabBarIconSize} color={tintColor} />
    }
  }
}, { initialRouteName: 'Main' })

export const createRootNavigator = () => {
  return createStackNavigator(
    {
      Tabs: {
        screen: Tabs(),
        navigationOptions: ({ navigation }) => ({
          gesturesEnabled: false
        })
      }
    },
    {
      headerMode: 'none',
      mode: 'modal'
    }
  )
}
