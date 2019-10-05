import React from "react";
import * as firebase from "firebase";
import * as Localization from "expo-localization";
import { en, ru } from "./i18n";
import Sentry from "sentry-expo";
import DropdownAlert from "react-native-dropdownalert";
import i18n from "i18n-js";
import RootStack from "./router";
import firebaseConfig from "./consts/firebase";
import { AsyncStorage, NetInfo } from "react-native";
import ConnectionContext from "./context/ConnnectionContext";
import TypingLanguageContext from "./context/TypingLanguageContext";

if (__DEV__) {
  console.log("__DEV__: " + __DEV__);
}

i18n.fallbacks = true;
i18n.translations = { en, ru, kk: ru };
i18n.locale = Localization.locale;

// Remove this once Sentry is correctly setup.
Sentry.enableInExpoDevelopment = true;

Sentry.config(
  "https://87a1b73b40134530a69a4178026fd4eb@sentry.io/1424807"
).install();

// TODO(aibek): check if async call is needed for Android in order to detect language change

firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      online: true,
      typingLanguageState: {
        typingLanguage: "en",
        changeTypingLanguage: () => {}
      }
    };
    this.passInitialRender = false;
    this.handleConnectivityChange = this.handleConnectivityChange.bind(this);
    this.changeTypingLanguage = this.changeTypingLanguage.bind(this);
    this.initTypingLanguage = this.initTypingLanguage.bind(this);
  }

  componentDidMount() {
    this.initTypingLanguage();
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this.handleConnectivityChange
    );
  }

  initTypingLanguage() {
    AsyncStorage.getItem("typingLanguage").then(typingLanguage => {
      if (__DEV__) {
        console.log("Typing language " + typingLanguage);
      }
      if (!typingLanguage) {
        typingLanguage = "en";
        AsyncStorage.setItem("typingLanguage", "en");
      }
      this.setState({
        typingLanguageState: {
          typingLanguage: typingLanguage,
          changeTypingLanguage: this.changeTypingLanguage
        }
      });
    });
  }

  changeTypingLanguage(newLanguage) {
    if (!newLanguage) {
      return;
    }
    AsyncStorage.setItem("typingLanguage", newLanguage);
    this.setState({
      typingLanguageState: {
        ...this.state.typingLanguageState,
        typingLanguage: newLanguage
      }
    });
  }

  handleConnectivityChange(isOnline) {
    if (!this.passInitialRender) {
      this.passInitialRender = true;
      return;
    }
    if (isOnline) {
      this.setState({
        online: true
      });
      if (this.dropdown) {
        this.dropdown.alertWithType(
          "success",
          i18n.t("common.success"),
          i18n.t("common.backOnline")
        );
      }
    } else {
      this.setState({
        online: false
      });
      if (this.dropdown) {
        this.dropdown.alertWithType(
          "warn",
          i18n.t("common.warn"),
          i18n.t("common.noInternet")
        );
      }
    }
  }

  render() {
    return (
      <TypingLanguageContext.Provider value={this.state.typingLanguageState}>
        <ConnectionContext.Provider value={this.state.online}>
          <RootStack />
          <DropdownAlert
            ref={ref => {
              this.dropdown = ref;
            }}
          />
        </ConnectionContext.Provider>
      </TypingLanguageContext.Provider>
    );
  }
}
