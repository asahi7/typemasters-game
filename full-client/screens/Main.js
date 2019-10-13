import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  AsyncStorage,
  StatusBar
} from "react-native";
import globalStyles from "../styles";
import Commons from "../Commons";
import WebAPI from "../WebAPI";
import Loading from "./Loading";
import moment from "moment";
import firebase from "firebase";
import i18n from "i18n-js";
import _ from "lodash";
import ConnectionContext from "../context/ConnnectionContext";

export default React.forwardRef((props, ref) => (
  <ConnectionContext.Consumer>
    {online => <Main {...props} online={online} ref={ref} />}
  </ConnectionContext.Consumer>
));

export class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        gamesPlayedCnt: null,
        lastGames: [],
        gamesPlayedCntUser: null
      },
      loading: true,
      authenticated: null
    };
    this.handlePlayPressed = this.handlePlayPressed.bind(this);
    this.updateScreen = this.updateScreen.bind(this);
    this.getPersistentDataOffline = this.getPersistentDataOffline.bind(this);
    this.getApiDataOnline = this.getApiDataOnline.bind(this);
  }

  componentDidMount() {
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.updateScreen();
      }
    );
    if (__DEV__) {
      console.log("User is " + (this.props.online ? "online" : "offline"));
    }
    if (this.props.online) {
      this.getApiDataOnline().then(() => {
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
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  async updateScreen() {
    if (__DEV__) {
      console.log("Main updated screen");
    }
    this.setState({ errorMessage: null });
    if (this.props.online) {
      this.getApiDataOnline();
    } else {
      this.getPersistentDataOffline();
    }
  }

  getPersistentDataOffline() {
    return AsyncStorage.getItem("main-data").then(value => {
      if (!value) {
        this.setState({
          data: {
            gamesPlayedCnt: null,
            lastGames: [],
            gamesPlayedCntUser: null
          }
        });
      } else {
        const data = JSON.parse(value);
        this.setState({
          data
        });
      }
    });
  }

  getApiDataOnline() {
    let data = {};
    const user = firebase.auth().currentUser;
    if (user && user.emailVerified) {
      return Promise.all([
        WebAPI.countGamesPlayedToday(),
        WebAPI.getLastPlayedGames(),
        WebAPI.countUserPlayedToday(user.uid)
      ])
        .then(results => {
          data = {
            gamesPlayedCnt: results[0].result,
            lastGames: results[1].result,
            gamesPlayedCntUser: results[2].result
          };
        })
        .then(() => {
          return AsyncStorage.setItem("main-data", JSON.stringify(data)).then(
            () => {
              this.setState({
                data,
                authenticated: true,
                loading: false
              });
            }
          );
        })
        .catch(error => {
          if (__DEV__) {
            console.log(error);
          }
          throw error;
        });
    } else {
      return Promise.all([
        WebAPI.countGamesPlayedToday(),
        WebAPI.getLastPlayedGames()
      ])
        .then(results => {
          data = {
            gamesPlayedCnt: results[0].result,
            lastGames: results[1].result,
            gamesPlayedCntUser: 0
          };
        })
        .then(() => {
          return AsyncStorage.setItem("main-data", JSON.stringify(data)).then(
            () => {
              this.setState({
                data,
                authenticated: false,
                loading: false
              });
            }
          );
        })
        .catch(error => {
          if (__DEV__) {
            console.log(error);
          }
          throw error;
        });
    }
  }

  handlePlayPressed() {
    this.props.navigation.navigate("Game");
  }

  render() {
    if (this.state.loading) return <Loading />;
    return (
      <View style={globalStyles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>{i18n.t("main.header")}</Text>
        </View>
        {!this.state.data && (
          <View>
            <Text style={globalStyles.tableHeader}>
              {i18n.t("common.noData")}
            </Text>
          </View>
        )}
        {this.state.data && (
          <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
            {/* TODO(aibek): add link to settings for language */}
            <View style={{ marginTop: 10, alignItems: "center" }}>
              <Text style={globalStyles.normalText}>
                {i18n.t("main.chooseLangText")}
              </Text>
              <TouchableOpacity
                style={styles.playButton}
                onPress={this.handlePlayPressed}
              >
                <Text style={styles.playButtonText}>
                  {i18n.t("main.playButton")}
                </Text>
              </TouchableOpacity>
            </View>
            {!this.state.authenticated && (
              <View style={{ marginTop: 10 }}>
                <Text style={[globalStyles.normalText, { color: "red" }]}>
                  {i18n.t("common.signInToSave")}
                </Text>
              </View>
            )}
            {this.state.authenticated && (
              <View style={{ marginTop: 10 }}>
                <Text style={globalStyles.tableHeader}>
                  {i18n.t("main.yourGamesCount")}:{" "}
                  {this.state.data.gamesPlayedCntUser}
                </Text>
              </View>
            )}
            <View style={{ marginTop: 10 }}>
              <Text style={globalStyles.tableHeader}>
                {i18n.t("main.totalGamesCount")}:{" "}
                {this.state.data.gamesPlayedCnt}
              </Text>
            </View>
            {/* TODO(aibek): fill out last played games from API */}
            {!_.isEmpty(this.state.data.lastGames) && (
              <View style={{ marginTop: 20 }}>
                <Text style={globalStyles.tableHeader}>
                  {i18n.t("main.lastGames")}
                </Text>
                {this.state.data.lastGames.map((result, i) => {
                  return (
                    <View style={globalStyles.row} key={i}>
                      <Text style={globalStyles.column}>
                        {result.user.nickname ? result.user.nickname : "noname"}
                      </Text>
                      <Text style={globalStyles.column}>
                        {result.user.country
                          ? result.user.country
                          : "not specified"}
                      </Text>
                      <Text style={globalStyles.column}>{result.cpm}</Text>
                      <Text style={globalStyles.column}>
                        {moment(result.race.date).fromNow()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  playButton: {
    borderWidth: 1,
    borderColor: "#7f1717",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
    height: 100,
    marginTop: 10,
    backgroundColor: "#ed4747",
    borderRadius: 10,
    paddingLeft: 15,
    paddingRight: 15
  },
  playButtonText: {
    color: "#fff",
    fontSize: 40
  }
});
