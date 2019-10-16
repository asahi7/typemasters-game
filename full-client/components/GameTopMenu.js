import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import i18n from "i18n-js";
import { FONTS } from "../styles";

export default class GameTopMenu extends React.Component {
  render() {
    return (
      <View style={styles.gameStatusBar}>
        <View style={styles.gameStatusBarItem}>
          <Text style={styles.gameStatusBarItemText}>
            {this.props.position}/{this.props.numOfPlayers}{" "}
            {i18n.t("game.position")}
          </Text>
        </View>
        <View style={styles.gameStatusBarSeparator}></View>
        <View style={styles.gameStatusBarItem}>
          <Text style={styles.gameStatusBarItemText}>
            {this.props.timeLeft} {i18n.t("game.timeLeft")}
          </Text>
        </View>
        <View style={styles.gameStatusBarSeparator}></View>
        <View style={styles.gameStatusBarItem}>
          <Text style={styles.gameStatusBarItemText}>{this.props.cpm} cpm</Text>
        </View>
        <View style={styles.gameStatusBarSeparator}></View>
        <View style={[styles.gameStatusBarItem, { borderRightWidth: 0 }]}>
          <Text style={styles.gameStatusBarItemText}>
            {this.props.accuracy}% {i18n.t("game.accuracy")}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  gameStatusBar: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  gameStatusBarItem: {},
  gameStatusBarSeparator: {
    height: 15,
    width: 2,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: "#71B6D5"
  },
  gameStatusBarItemText: {
    fontSize: FONTS.TABLE_FONT,
    color: "#FFFFFF",
    fontFamily:"monospace"
  }
});
