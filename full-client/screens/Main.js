import React from "react";
import {
  View,
  Text,
  Image,
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
        <View style={globalStyles.inside_container}>
          <StatusBar barStyle="dark-content" />
          <View style={{ marginTop: 70 }} />
          {!this.state.data && (
            <View>
              <Text style={globalStyles.tableHeader}>
                {i18n.t("common.noData")}
              </Text>
            </View>
          )}
          {this.state.data && (
            <ScrollView style={globalStyles.scrollView}>
              {/* TODO(aibek): add link to settings for language */}
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <Image source={require("./img/bkg_txt.png")} />
              </View>
              <View style={{ marginTop: 200 }} />
              <View style={{ marginTop: 10, alignItems: "center" }}>
                <TouchableOpacity onPress={this.handlePlayPressed}>
                  <Image
                    source={require("./img/play_btn.png")}
                    style={styles.button}
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center"
  }
});
