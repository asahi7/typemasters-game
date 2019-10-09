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
        <View style={styles.gameStatusBarItem}>
          <Text style={styles.gameStatusBarItemText}>
            {this.props.timeLeft} {i18n.t("game.timeLeft")}
          </Text>
        </View>
        <View style={styles.gameStatusBarItem}>
          <Text style={styles.gameStatusBarItemText}>{this.props.cpm} cpm</Text>
        </View>
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
    flex: 0.1,
    flexDirection: "row",
    marginTop: 50,
    marginBottom: 30
  },
  gameStatusBarItem: {
    paddingLeft: 3,
    paddingRight: 3,
    borderRightWidth: 1,
    borderRightColor: "#62bcff",
    borderLeftWidth: 1,
    borderLeftColor: "#62bcff",
    alignItems: "center",
    justifyContent: "center"
  },
  gameStatusBarItemText: {
    fontSize: FONTS.TABLE_FONT
  }
});
