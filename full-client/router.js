import React from "react";
import {
  createStackNavigator,
  createBottomTabNavigator,
  createSwitchNavigator
} from "react-navigation";
import { Icon } from "react-native-elements";
import Main from "./screens/Main";
import Game from "./screens/Game";
import Leaderboard from "./screens/Leaderboard";
import SignIn from "./screens/SignIn";
import SignUp from "./screens/SignUp";
import PersonalPage from "./screens/PersonalPage";
import Settings from "./screens/Settings";
import About from "./screens/About";
import AuthLoading from "./screens/AuthLoading";
import PersonalCharts from "./screens/PersonalCharts";
import EmailVerificationPage from "./screens/EmailVerificationPage";
import ForgotPassword from "./screens/ForgotPassword";
import i18n from "i18n-js";

const MainStack = createStackNavigator(
  {
    Main: {
      screen: Main,
      navigationOptions: ({ navigation }) => ({
        header: null
      })
    },
    Game: Game
  },
  { initialRouteName: "Main" }
);

const PersonalPageStack = createStackNavigator(
  {
    PersonalPage: {
      screen: PersonalPage,
      navigationOptions: ({ navigation }) => ({
        header: null
      })
    },
    PersonalCharts: PersonalCharts
  },
  { initialRouteName: "PersonalPage" }
);

const AuthStack = createStackNavigator(
  {
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
    ForgotPassword: ForgotPassword
  },
  { initialRouteName: "SignIn" }
);

const AuthSwitchNavigator = createSwitchNavigator(
  {
    AuthLoading: {
      screen: AuthLoading,
      navigationOptions: ({ navigation }) => ({
        header: null
      })
    },
    PersonalPage: PersonalPageStack,
    Auth: AuthStack
  },
  { initialRouteName: "AuthLoading" }
);

const tabBarIconSize = 25;

const mainLabel = i18n.t("navigation.main");
const leaderboardLabel = i18n.t("navigation.leaderboard");
const personalPageLabel = i18n.t("navigation.personalPage");
const settingsLabel = i18n.t("navigation.settings");
const aboutLabel = i18n.t("navigation.about");

const Tabs = createBottomTabNavigator(
  {
    Main: {
      screen: MainStack,
      navigationOptions: {
        tabBarLabel: (() => {
          mainLabel;
        })(),
        tabBarIcon: ({ tintColor }) => (
          <Icon
            name="md-home"
            type="ionicon"
            size={tabBarIconSize}
            color={tintColor}
          />
        )
      }
    },
    Leaderboard: {
      screen: Leaderboard,
      navigationOptions: {
        tabBarLabel: (() => {
          leaderboardLabel;
        })(),
        tabBarIcon: ({ tintColor }) => (
          <Icon
            name="md-stats"
            type="ionicon"
            size={tabBarIconSize}
            color={tintColor}
          />
        )
      }
    },
    PersonalPage: {
      screen: AuthSwitchNavigator,
      navigationOptions: {
        tabBarLabel: (() => {
          personalPageLabel;
        })(),
        tabBarIcon: ({ tintColor }) => (
          <Icon
            name="md-body"
            type="ionicon"
            size={tabBarIconSize}
            color={tintColor}
          />
        )
      }
    },
    Settings: {
      screen: Settings,
      navigationOptions: {
        tabBarLabel: (() => {
          settingsLabel;
        })(),
        tabBarIcon: ({ tintColor }) => (
          <Icon
            name="md-build"
            type="ionicon"
            size={tabBarIconSize}
            color={tintColor}
          />
        )
      }
    },
    About: {
      screen: About,
      navigationOptions: {
        tabBarLabel: (() => {
          aboutLabel;
        })(),
        tabBarIcon: ({ tintColor }) => (
          <Icon
            name="md-information-circle"
            type="ionicon"
            size={tabBarIconSize}
            color={tintColor}
          />
        )
      }
    }
  },
  { initialRouteName: "Main" }
);

const RootStack = createStackNavigator(
  {
    Tabs: {
      screen: Tabs,
      navigationOptions: ({ navigation }) => ({
        gesturesEnabled: false
      })
    }
  },
  {
    headerMode: "none",
    mode: "modal"
  }
);

export default RootStack;
