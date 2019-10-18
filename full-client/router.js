import React from 'react'
import {
  createStackNavigator,
  createSwitchNavigator,
  createAppContainer,
} from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import Commons from './Commons'
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
import {
  Button,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { en, ru } from './i18n'
import { gameStyles } from './styles'
import * as Localization from 'expo-localization'

i18n.fallbacks = true
i18n.translations = {en, ru, kk: ru}
i18n.locale = Localization.locale

const mainLabel = i18n.t('navigation.main')
const leaderboardLabel = i18n.t('navigation.leaderboard')
const personalPageLabel = i18n.t('navigation.personalPage')
const settingsLabel = i18n.t('navigation.settings')
const aboutLabel = i18n.t('navigation.about')
const gameLabel = i18n.t('navigation.game')
const personalChartsLabel = i18n.t('navigation.personalCharts')
const signInLabel = i18n.t('navigation.signIn')
const signUpLabel = i18n.t('navigation.signUp')
const forgotPasswordLabel = i18n.t('navigation.forgotPassword')
const confirmEmailLabel = i18n.t('navigation.confirmEmail')

const MainStack = createStackNavigator(
  {
    Main: {
      screen: Main,
      navigationOptions: {
        headerTransparent: true,
      },
    },
    Game: {
      screen: Game,
      navigationOptions: ({navigation}) => {
        return {
          headerTransparent: true,
          headerRight: (
            <View style={{marginRight: 10}}>
              {navigation.getParam('gamePlaying') === true ? (
                <View style={{marginTop: 10, alignItems: 'center'}}>
                  <TouchableOpacity
                    onPress={() => navigation.getParam('playButtonPressed')()}
                  >
                    <Image source={require('./screens/img/stop_sm_btn.webp')}/>
                  </TouchableOpacity>
                </View>

              ) : (
                <View style={{marginTop: 10, alignItems: 'center'}}>
                  <TouchableOpacity
                    onPress={() => navigation.getParam('playButtonPressed')()}
                  >
                    <Image source={require('./screens/img/play_sm_btn.webp')}/>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ),
        }
      },
    },
  },
  {initialRouteName: 'Main'},
)

const LeaderboardStack = createStackNavigator(
  {
    Leaderboard: {
      screen: Leaderboard,
      navigationOptions: {
        headerTransparent: true,
      },
    },
  },
  {initialRouteName: 'Leaderboard'},
)

const SettingsStack = createStackNavigator(
  {
    Settings: {
      screen: Settings,
      navigationOptions: ({navigation}) => {
        return {
          headerTransparent: true,
          headerRight: (
            <View style={{marginTop: 10, marginRight: 20, alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => navigation.getParam('saveSettings')()}
              >
                <Image source={require('./screens/img/save_sm_btn.webp')}/>
              </TouchableOpacity>
            </View>
          ),
        }
      },
    },
  },
  {
    initialRouteName: 'Settings',
  },
)

const AboutStack = createStackNavigator(
  {
    About: {
      screen: About,
      navigationOptions: {
        headerTransparent: true,
      },
    },
  },
  {initialRouteName: 'About'},
)

const PersonalPageStack = createStackNavigator(
  {
    PersonalPage: {
      screen: PersonalPage,
      navigationOptions: ({navigation}) => {
        return {
          headerTitle: personalPageLabel,
          headerTitleStyle: {
            color: 'white'
          },
          headerRight: (
            <View style={{marginRight: 10}}>
              <Button
                onPress={() => navigation.getParam('handleSignOut')()}
                title={i18n.t('personalPage.signOut')}
              />
            </View>
          ),
        }
      },
    },
    PersonalCharts: {
      screen: PersonalCharts,
      navigationOptions: {
        headerTitle: personalChartsLabel,
        headerTitleStyle: {
          color: 'white'
        }
      },
    },
  },
  {initialRouteName: 'PersonalPage'},
)

const AuthStack = createStackNavigator(
  {
    SignUp: {
      screen: SignUp,
      navigationOptions: {
        headerTransparent: true,
        headerTitle: signUpLabel,
        headerTitleStyle: {
          color: 'white'
        }
      },
    },
    SignIn: {
      screen: SignIn,
      navigationOptions: {
        headerTransparent: true,
        headerTitle: signInLabel,
        headerTitleStyle: {
          color: 'white'
        }
      },
    },
    EmailVerificationPage: {
      screen: EmailVerificationPage,
      navigationOptions: {
        headerTransparent: true,
        headerTitle: confirmEmailLabel,
        headerTitleStyle: {
          color: 'white'
        }
      },
    },
    ForgotPassword: {
      screen: ForgotPassword,
      navigationOptions: {
        headerTransparent: true,
        headerTitle: forgotPasswordLabel,
        headerTitleStyle: {
          color: 'white'
        }
      },
    },
  },
  {initialRouteName: 'SignIn'},
)

const AuthSwitchNavigator = createSwitchNavigator(
  {
    AuthLoading: {
      screen: AuthLoading,
      navigationOptions: ({navigation}) => ({
        header: null,
      }),
    },
    PersonalPage: PersonalPageStack,
    Auth: AuthStack,
  },
  {initialRouteName: 'AuthLoading'},
)

const tabBarIconSize = 25

const Tabs = createBottomTabNavigator(
  {
    Main: {
      screen: MainStack,
      navigationOptions: {
        tabBarIcon: ({tintColor}) => (
          <Icon
            name="md-home"
            type="ionicon"
            size={tabBarIconSize}
            color={tintColor}
          />
        ),
        header: null,
      },
    },
    Leaderboard: {
      screen: LeaderboardStack,
      navigationOptions: {
        headerTitle: leaderboardLabel,
        headerTitleStyle: {
          color: 'white'
        },
        tabBarLabel: (() => {
          leaderboardLabel
        })(),
        tabBarIcon: ({tintColor}) => (
          <Icon
            name="md-stats"
            type="ionicon"
            size={tabBarIconSize}
            color={tintColor}
          />
        ),
      },
    },
    PersonalPage: {
      screen: AuthSwitchNavigator,
      navigationOptions: {
        tabBarLabel: (() => {
          personalPageLabel
        })(),
        tabBarIcon: ({tintColor}) => (
          <Icon
            name="md-body"
            type="ionicon"
            size={tabBarIconSize}
            color={tintColor}
          />
        ),
      },
    },
    Settings: {
      screen: SettingsStack,
      navigationOptions: ({navigation}) => {
        return {
          tabBarLabel: (() => {
            settingsLabel
          })(),
          tabBarIcon: ({tintColor}) => (
            <Icon
              name="md-build"
              type="ionicon"
              size={tabBarIconSize}
              color={tintColor}
            />
          ),
        }
      },
    },
    About: {
      screen: AboutStack,
      navigationOptions: {
        tabBarLabel: (() => {
          aboutLabel
        })(),
        tabBarIcon: ({tintColor}) => (
          <Icon
            name="md-information-circle"
            type="ionicon"
            size={tabBarIconSize}
            color={tintColor}
          />
        ),
      },
    },
  },
  {
    initialRouteName: 'Main',
    tabBarOptions: {
      activeTintColor: '#53A4D0',
      inactiveTintColor: '#FFFFFF',

      tabStyle: {
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
      },
      style: {
        backgroundColor: '#5E81C6',
      },
    },
  },
)

const RootStack = createStackNavigator({
  Tabs: {
    screen: Tabs,
    navigationOptions: {
      header: null,
    },
  },
})

export default createAppContainer(RootStack)
