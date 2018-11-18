import React from 'react'
import { createStackNavigator, createBottomTabNavigator, StackNavigator } from 'react-navigation'
import { Icon } from 'react-native-elements'

import Main from './screens/Main'
import Game from './screens/Game'
import Leaderboard from './screens/Leaderboard'
import SignIn from './screens/SignIn'
import SignUp from './screens/SignUp'
import PersonalPage from './screens/PersonalPage'
import Settings from './screens/Settings'
import About from './screens/About'

const tabBarIconSize = 25

export const MainStack = StackNavigator({
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

export const PersonalPageStack = StackNavigator({
  PersonalPage: {
    screen: PersonalPage,
    navigationOptions: ({ navigation }) => ({
      header: null
    })
  },
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
  }
}, { initialRouteName: 'PersonalPage' })

export const Tabs = createBottomTabNavigator({
  'Main': {
    screen: MainStack,
    navigationOptions: {
      tabBarLabel: 'Main',
      tabBarIcon: ({ tintColor }) => <Icon name='md-home' type='ionicon' size={tabBarIconSize}
        color={tintColor} />
    }
  },
  'Leaderboard': {
    screen: Leaderboard,
    navigationOptions: {
      tabBarLabel: 'Leaderboard',
      tabBarIcon: ({ tintColor }) => <Icon name='md-stats' type='ionicon' size={tabBarIconSize}
        color={tintColor} />
    }
  },
  'Personal Page': {
    screen: PersonalPageStack,
    navigationOptions: {
      tabBarLabel: 'Personal Page',
      tabBarIcon: ({ tintColor }) => <Icon name='md-body' type='ionicon' size={tabBarIconSize}
        color={tintColor} />
    }
  },
  'Settings': {
    screen: Settings,
    navigationOptions: {
      tabBarLabel: 'Settings',
      tabBarIcon: ({ tintColor }) => <Icon name='md-build' type='ionicon' size={tabBarIconSize}
        color={tintColor} />
    }
  },
  'About': {
    screen: About,
    navigationOptions: {
      tabBarLabel: 'About',
      tabBarIcon: ({ tintColor }) => <Icon name='md-information-circle' type='ionicon'
        size={tabBarIconSize} color={tintColor} />
    }
  }
})

export const createRootNavigator = () => {
  return createStackNavigator(
    {
      Tabs: {
        screen: Tabs,
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
