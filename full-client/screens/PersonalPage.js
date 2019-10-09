import React from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  AsyncStorage,
  ScrollView
} from "react-native";
import firebase from "firebase";
import WebAPI from "../WebAPI";
import Loading from "./Loading";
import Commons from "../Commons";
import _ from "lodash";
import globalStyles from "../styles";
import moment from "moment";
import DropdownAlert from "react-native-dropdownalert";
import i18n from "i18n-js";
import ConnectionContext from "../context/ConnnectionContext";
import TypingLanguageContext from "../context/TypingLanguageContext";
import { PersonalCharts } from "./PersonalCharts";

export default React.forwardRef((props, ref) => (
  <TypingLanguageContext.Consumer>
    {typingLanguageState => (
      <ConnectionContext.Consumer>
        {online => (
          <PersonalPage
            {...props}
            typingLanguage={typingLanguageState.typingLanguage}
            online={online}
            ref={ref}
          />
        )}
      </ConnectionContext.Consumer>
    )}
  </TypingLanguageContext.Consumer>
));

export class PersonalPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      userData: null
    };
    this.handleSignOut = this.handleSignOut.bind(this);
    this.updateScreen = this.updateScreen.bind(this);
    this.getPersistentDataOffline = this.getPersistentDataOffline.bind(this);
    this.getApiDataOnline = this.getApiDataOnline.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.prepareListElements = this.prepareListElements.bind(this);
    this.elementMapper = {
      nickname: {
        key: i18n.t("personalPage.nickname"),
        accessorObject: () => this.state,
        valuePath: "userData.userInfo.nickname"
      },
      email: {
        key: i18n.t("common.email"),
        accessorObject: () => this.state,
        valuePath: "userData.userInfo.email"
      },
      country: {
        key: i18n.t("common.country"),
        accessorObject: () => this.state,
        valuePath: "userData.userInfo.country"
      },
      UID: {
        key: "UID",
        accessorObject: () => this.state,
        valuePath: "userData.userInfo.uid"
      },
      typingLanguage: {
        key: i18n.t("personalPage.typingLanguage"),
        accessorObject: () => this.props,
        valuePath: "typingLanguage"
      },
      totalGames: {
        key: i18n.t("personalPage.totalGames"),
        accessorObject: () => this.state,
        valuePath: "userData.totalRaces"
      },
      averageCpm: {
        key: i18n.t("personalPage.averageCpm"),
        accessorObject: () => this.state,
        valuePath: "userData.avgCpm",
        preprocessor: val => val + " cpm"
      },
      averageAccuracy: {
        key: i18n.t("personalPage.averageAccuracy"),
        accessorObject: () => this.state,
        valuePath: "userData.avgAccuracy",
        preprocessor: val => val + " %"
      },
      averageCpm10: {
        key: i18n.t("personalPage.averageCpm10"),
        accessorObject: () => this.state,
        valuePath: "userData.lastAvgCpm",
        preprocessor: val => val + " cpm"
      },
      averageAccuracy10: {
        key: i18n.t("personalPage.averageAccuracy10"),
        accessorObject: () => this.state,
        valuePath: "userData.lastAvgAccuracy",
        preprocessor: val => val + " %"
      },
      gamesWon: {
        key: i18n.t("personalPage.gamesWon"),
        accessorObject: () => this.state,
        valuePath: "userData.gamesWon"
      },
      bestResult: {
        key: i18n.t("personalPage.bestResult"),
        accessorObject: () => this.state,
        valuePath: "userData.bestResult",
        preprocessor: val => val + " cpm"
      },
      lastGame: {
        key: i18n.t("personalPage.lastGame"),
        accessorObject: () => this.state,
        valuePath: "userData.lastPlayed",
        preprocessor: val => moment(val).format("HH:mm, D MMMM, YYYY")
      },
      lastGameCpm: {
        key: i18n.t("personalPage.lastGameCpm"),
        accessorObject: () => this.state,
        valuePath: "userData.lastScore",
        preprocessor: val => val + " cpm"
      },
      lastGameAccuracy: {
        key: i18n.t("personalPage.lastGameAccuracy"),
        accessorObject: () => this.state,
        valuePath: "userData.lastAccuracy",
        preprocessor: val => val + " %"
      },
      firstGameCpm: {
        key: i18n.t("personalPage.firstGameCpm"),
        accessorObject: () => this.state,
        valuePath: "userData.firstRaceData.racePlayers[0].cpm",
        preprocessor: val => val + " cpm"
      },
      firstGame: {
        key: i18n.t("personalPage.firstGame"),
        accessorObject: () => this.state,
        valuePath: "userData.firstRaceData.date",
        preprocessor: val => moment(val).format("HH:mm, D MMMM, YYYY")
      }
    };
  }

  async componentDidMount() {
    this.props.navigation.setParams({ handleSignOut: this.handleSignOut });
    if (__DEV__) {
      console.log("User is " + (this.props.online ? "online" : "offline"));
    }
    if (this.props.online) {
      this.getApiDataOnline(firebase.auth().currentUser).then(() => {
        this.setState({
          loading: false
        });
      });
    } else {
      this.getPersistentDataOffline().then(() => {
        this.setState({
          loading: false
        });
      });
    }
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.updateScreen();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.userData !== this.state.userData ||
      prevProps.typingLanguage !== this.props.typingLanguage
    ) {
      const listElements = this.prepareListElements();
      this.setState({
        listElements
      });
    }
  }

  async updateScreen() {
    if (__DEV__) {
      console.log("Updated screen");
    }
    if (this.props.online) {
      this.getApiDataOnline(firebase.auth().currentUser);
    } else {
      this.getPersistentDataOffline();
    }
  }

  getPersistentDataOffline() {
    return AsyncStorage.getItem("personalPage-userData").then(value => {
      if (!value) {
        this.setState({
          userData: null
        });
      } else {
        const userData = JSON.parse(value);
        this.setState({
          userData
        });
      }
    });
  }

  getApiDataOnline(user) {
    let userData = {};
    // This is done because user might not exist on the database and will create it first
    return WebAPI.getUserInfo(user.uid)
      .then(result => {
        userData.userInfo = result;
      })
      .then(() => {
        return Promise.all([
          WebAPI.getRaceCount(user.uid, this.props.typingLanguage),
          WebAPI.getAverageCpm(user.uid, this.props.typingLanguage),
          WebAPI.getLatestAverageCpm(user.uid, this.props.typingLanguage),
          WebAPI.getLastPlayedGame(user.uid, this.props.typingLanguage),
          WebAPI.getBestResult(user.uid, this.props.typingLanguage),
          WebAPI.getGamesWon(user.uid, this.props.typingLanguage),
          WebAPI.getFirstRace(user.uid, this.props.typingLanguage),
          WebAPI.getAverageAccuracy(user.uid, this.props.typingLanguage),
          WebAPI.getLastAverageAccuracy(user.uid, this.props.typingLanguage)
        ]).then(results => {
          // TODO(aibek): remove .result from each response
          userData = {
            ...userData,
            totalRaces: results[0].result,
            avgCpm: Math.round(
              results[1].result !== null ? results[1].result : null
            ),
            lastAvgCpm: Math.round(results[2].result),
            lastPlayed:
              results[3].result !== null ? results[3].result.date : null,
            lastScore:
              results[3].result !== null ? results[3].result.cpm : null,
            lastAccuracy:
              results[3].result !== null ? results[3].result.accuracy : null,
            bestResult: results[4].result,
            gamesWon: results[5].result,
            firstRaceData: results[6].result,
            avgAccuracy: results[7].result,
            lastAvgAccuracy: results[8].result
          };
        });
      })
      .then(() => {
        return AsyncStorage.setItem(
          "personalPage-userData",
          JSON.stringify(userData)
        ).then(() => {
          this.setState({
            userData,
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

  handleSignOut() {
    if (this.props.online) {
      firebase
        .auth()
        .signOut()
        .then(
          function() {
            if (__DEV__) {
              console.log("Signed out");
            }
          },
          function(error) {
            if (__DEV__) {
              console.log(error);
            }
          }
        );
    } else {
      this.dropdown.alertWithType(
        "error",
        i18n.t("common.error"),
        i18n.t("personalPage.cantSignOutOffline")
      );
    }
  }

  prepareListElements() {
    const listElements = [];
    Object.keys(this.elementMapper).forEach(key => {
      let value = _.get(
        this.elementMapper[key].accessorObject(),
        this.elementMapper[key].valuePath,
        null
      );
      if (!value) {
        return null;
      }
      if (this.elementMapper[key].preprocessor) {
        value = this.elementMapper[key].preprocessor(value);
      }
      listElements.push({
        key: this.elementMapper[key].key,
        value
      });
    });
    return listElements;
  }

  renderItem({ item }) {
    return (
      <View style={globalStyles.row}>
        <Text style={globalStyles.column}>{item.key}</Text>
        <Text style={globalStyles.column}>{item.value}</Text>
      </View>
    );
  }

  render() {
    if (this.state.loading) return <Loading />;
    return (
      <View style={globalStyles.container}>
        {!this.state.userData && (
          <View>
            <Text style={globalStyles.tableHeader}>
              {i18n.t("common.noData")}
            </Text>
          </View>
        )}
        {this.state.userData && (
          <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
            <View style={{ marginTop: 10 }}>
              <Text style={globalStyles.tableHeader}>
                {i18n.t("personalPage.general")}:
              </Text>
              <FlatList
                data={this.state.listElements}
                renderItem={this.renderItem}
              />
            </View>
            <View style={{ marginTop: 10 }}>
              <Text style={[globalStyles.normalText, { color: "red" }]}>
                {i18n.t("personalPage.dataMayNotUpdate")}
              </Text>
            </View>
            <View style={globalStyles.normalButton}>
              <Button
                onPress={() => this.props.navigation.navigate("PersonalCharts")}
                title={i18n.t("personalPage.showCharts")}
                color="#841584"
              />
            </View>
          </ScrollView>
        )}
        <DropdownAlert
          ref={ref => {
            this.dropdown = ref;
          }}
        />
      </View>
    );
  }
}
