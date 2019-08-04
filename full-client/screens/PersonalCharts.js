import React from "react";
import { View, Text, AsyncStorage, ScrollView, NetInfo } from "react-native";
import firebase from "firebase";
import WebAPI from "../WebAPI";
import Loading from "./Loading";
import { LinearGradient } from "expo-linear-gradient";
import Commons from "../Commons";
import globalStyles from "../styles";
import PureChart from "react-native-pure-chart";
import DropdownAlert from "react-native-dropdownalert";
import i18n from "i18n-js";

// TODO(aibek): make the limit configurable, current is 100, could be 500, 1000
// TODO(aibek): current chart shows the cpm results from beginning, but it has more sense to show the last N ones.
// in increasing order
export default class PersonalCharts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      cpmData: [],
      accData: []
    };
    this.updateScreen = this.updateScreen.bind(this);
    this.getPersistentDataOffline = this.getPersistentDataOffline.bind(this);
    this.handleConnectivityChange = this.handleConnectivityChange.bind(this);
    this.getApiDataOnline = this.getApiDataOnline.bind(this);
    this.updateTextLanguageState = this.updateTextLanguageState.bind(this);
  }

  async componentDidMount() {
    await this.updateTextLanguageState();
    NetInfo.isConnected.fetch().then(isConnected => {
      if (__DEV__) {
        console.log("User is " + (isConnected ? "online" : "offline"));
      }
      if (!isConnected) {
        this.online = false;
        this.getPersistentDataOffline().then(() => {
          this.setState({
            loading: false
          });
        });
      } else {
        this.online = true;
        this.getApiDataOnline().then(() => {
          this.setState({
            loading: false
          });
        });
      }
    });
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this.handleConnectivityChange
    );
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.updateScreen();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
    NetInfo.isConnected.removeEventListener(
      "connectionChange",
      this.handleConnectivityChange
    );
  }

  async updateScreen() {
    if (__DEV__) {
      console.log("Updated screen");
    }
    await this.updateTextLanguageState();
    if (this.online) {
      this.getApiDataOnline();
    } else {
      this.getPersistentDataOffline();
    }
  }

  getPersistentDataOffline() {
    return AsyncStorage.getItem("personalCharts-data").then(value => {
      if (!value) {
        this.setState({
          data: []
        });
      } else {
        const data = JSON.parse(value);
        this.setState({
          cpmData: data.cpmData,
          accData: data.accData
        });
      }
    });
  }

  getApiDataOnline() {
    let cpmData = {};
    let accData = {};
    const user = firebase.auth().currentUser;
    return Promise.all([
      WebAPI.getGameHistoryByDay(user.uid, this.state.textLanguage)
    ])
      .then(results => {
        cpmData = results[0].result.map(res => {
          return {
            x: res.date,
            y: +res.cpm
          };
        });
        accData = results[0].result.map(res => {
          return {
            x: res.date,
            y: +res.accuracy
          };
        });
      })
      .then(() => {
        return AsyncStorage.setItem(
          "personalCharts-data",
          JSON.stringify({ cpmData, accData })
        ).then(() => {
          this.setState({
            cpmData,
            accData,
            loading: false
          });
        });
      })
      .catch(error => {
        if (__DEV__) {
          console.log(error);
        }
        throw error;
      });
  }

  handleConnectivityChange(isConnected) {
    if (isConnected) {
      this.online = true;
      this.dropdown.alertWithType(
        "success",
        i18n.t("common.success"),
        i18n.t("common.backOnline")
      );
      this.getApiDataOnline();
    } else {
      this.online = false;
      this.dropdown.alertWithType(
        "warn",
        i18n.t("common.warn"),
        i18n.t("common.noInternet")
      );
    }
  }

  async updateTextLanguageState() {
    const textLanguage = await AsyncStorage.getItem("textLanguage");
    if (!textLanguage) {
      this.setState({
        textLanguage: "en"
      });
      await AsyncStorage.setItem("textLanguage", "en");
    } else {
      this.setState({
        textLanguage: textLanguage
      });
    }
  }

  render() {
    if (this.state.loading) return <Loading />;
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            {i18n.t("personalCharts.header")}
          </Text>
        </View>
        <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>
              {i18n.t("personalCharts.last100DaysCpm")}
            </Text>
            <PureChart data={this.state.cpmData} type="line" />
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>
              {i18n.t("personalCharts.last100DaysAcc")}
            </Text>
            <PureChart data={this.state.accData} type="line" />
          </View>
        </ScrollView>
        <DropdownAlert
          ref={ref => {
            this.dropdown = ref;
          }}
        />
      </LinearGradient>
    );
  }
}
