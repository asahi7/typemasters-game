import React from "react";
import RootStack from "./router";
import * as firebase from "firebase";
import * as Localization from "expo-localization";
import { en, ru } from "./i18n";
import Sentry from "sentry-expo";
import DropdownAlert from "react-native-dropdownalert";
import i18n from "i18n-js";
import firebaseConfig from "./consts/firebase";
import { NetInfo } from "react-native";
import ConnectionContext from "./context/ConnnectionContext";

if (__DEV__) {
  console.log("__DEV__: " + __DEV__);
}

// Remove this once Sentry is correctly setup.
Sentry.enableInExpoDevelopment = true;

Sentry.config(
  "https://87a1b73b40134530a69a4178026fd4eb@sentry.io/1424807"
).install();

// TODO(aibek): check if async call is needed for Android in order to detect language change
i18n.fallbacks = true;
i18n.translations = { en, ru, kk: ru };
i18n.locale = Localization.locale;

firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      online: true
    };
    this.handleConnectivityChange = this.handleConnectivityChange.bind(this);
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this.handleConnectivityChange
    );
  }

  handleConnectivityChange(isOnline) {
    console.log("connectivity change", isOnline);
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
    console.log("app", this.state.online);
    return (
      <ConnectionContext.Provider value={this.state.online}>
        <RootStack />
        <DropdownAlert
          ref={ref => {
            this.dropdown = ref;
          }}
        />
      </ConnectionContext.Provider>
    );
  }
}
