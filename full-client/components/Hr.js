import React from "react";
import { View } from "react-native";

export default class Hr extends React.Component {
  render() {
    return (
      <View
        style={{
          borderBottomColor: "transparent",
          borderBottomWidth: 1,
          marginTop: 5,
          marginBottom: 5,
          borderColor: "transparent",
          width: "80%",
          alignSelf: "center"
        }}
      />
    );
  }
}
