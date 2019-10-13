import React from "react";
import { View, Text, AsyncStorage, ScrollView, NetInfo } from "react-native";
import WebAPI from "../WebAPI";
import Loading from "./Loading";
import Commons from "../Commons";
import globalStyles from "../styles";
import moment from "moment";
import i18n from "i18n-js";
import _ from "lodash";
import ConnectionContext from "../context/ConnnectionContext";
import TypingLanguageContext from "../context/TypingLanguageContext";

export default React.forwardRef((props, ref) => (
  <TypingLanguageContext.Consumer>
    {typingLanguageState => (
      <ConnectionContext.Consumer>
        {online => (
          <Leaderboard
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

export class Leaderboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: {
        bestResults: [],
        bestAvgResults: [],
        bestCpmTodayResults: [],
        bestAccTodayResults: []
      }
    };
    this.updateScreen = this.updateScreen.bind(this);
    this.getPersistentDataOffline = this.getPersistentDataOffline.bind(this);
    this.getApiDataOnline = this.getApiDataOnline.bind(this);
  }

  async componentDidMount() {
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
      console.log("Leaderboard updated screen");
    }
    if (this.props.online) {
      this.getApiDataOnline();
    } else {
      this.getPersistentDataOffline();
    }
  }

  getPersistentDataOffline() {
    return AsyncStorage.getItem("leaderboard-data").then(value => {
      if (!value) {
        this.setState({
          data: {
            bestResults: [],
            bestAvgResults: [],
            bestCpmTodayResults: [],
            bestAccTodayResults: []
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
    return Promise.all([
      WebAPI.getBestResults(this.props.typingLanguage),
      WebAPI.getBestAvgResults(this.props.typingLanguage),
      WebAPI.getBestCpmTodayResults(this.props.typingLanguage),
      WebAPI.getBestAccTodayResults(this.props.typingLanguage)
    ])
      .then(results => {
        data = {
          bestResults: results[0],
          bestAvgResults: results[1],
          bestCpmTodayResults: results[2],
          bestAccTodayResults: results[3]
        };
      })
      .then(() => {
        return AsyncStorage.setItem(
          "leaderboard-data",
          JSON.stringify(data)
        ).then(() => {
          this.setState({
            data,
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

  render() {
    if (this.state.loading) return <Loading />;
    return (
      <View style={globalStyles.container}>
        <ScrollView style={globalStyles.scrollView}>
          {!_.isEmpty(this.state.data.bestCpmTodayResults) && (
            <View style={{ marginTop: 10 }}>
              <Text style={globalStyles.tableHeader}>
                {i18n.t("leaderboard.bestTodayByCpm")}
              </Text>
              {this.state.data.bestCpmTodayResults.map((result, i) => {
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
                  </View>
                );
              })}
            </View>
          )}
          {!_.isEmpty(this.state.data.bestAccTodayResults) && (
            <View style={{ marginTop: 10 }}>
              <Text style={globalStyles.tableHeader}>
                {i18n.t("leaderboard.bestTodayByAcc")}
              </Text>
              {this.state.data.bestAccTodayResults.map((result, i) => {
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
                    <Text style={globalStyles.column}>{result.accuracy}</Text>
                  </View>
                );
              })}
            </View>
          )}
          {!_.isEmpty(this.state.data.bestAvgResults) && (
            <View style={{ marginTop: 10 }}>
              <Text style={globalStyles.tableHeader}>
                {i18n.t("leaderboard.bestTodayByAvgCpm")}
              </Text>
              {this.state.data.bestAvgResults.map((result, i) => {
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
                    <Text style={globalStyles.column}>
                      {Math.round(result.avg)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
          {!_.isEmpty(this.state.data.bestResults) && (
            <View style={{ marginTop: 10 }}>
              <Text style={globalStyles.tableHeader}>
                {i18n.t("leaderboard.bestByCpm")}
              </Text>
              {this.state.data.bestResults.map((result, i) => {
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
                      {moment(result.race.date).format("HH:mm, D MMMM, YYYY")}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}
