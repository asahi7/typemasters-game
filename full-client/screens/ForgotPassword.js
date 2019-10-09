import React from "react";
import { Text, Button, View, TextInput, StyleSheet } from "react-native";
import firebase from "firebase";
import Commons from "../Commons";
import globalStyles from "../styles";
import Loading from "./Loading";
import DropdownAlert from "react-native-dropdownalert";
import i18n from "i18n-js";

export default class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: ""
    };
    this.sendResetLink = this.sendResetLink.bind(this);
  }

  sendResetLink() {
    const auth = firebase.auth();
    auth
      .sendPasswordResetEmail(this.state.email)
      .then(() => {
        this.dropdown.alertWithType(
          "info",
          i18n.t("common.info"),
          i18n.t("forgotPassowrd.linkSent")
        );
      })
      .catch(error => {
        // TODO(aibek): handle better
        this.dropdown.alertWithType(
          "error",
          i18n.t("common.error"),
          i18n.t("forgotPassword.somethingWrong")
        );
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
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>
            {i18n.t("forgotPassword.header")}
          </Text>
        </View>
        <Text style={globalStyles.normalText}>
          {i18n.t("forgotPassword.text")}
        </Text>
        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          placeholder={i18n.t("common.email")}
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <View style={globalStyles.normalButton}>
          <Button
            onPress={this.sendResetLink}
            title={i18n.t("forgotPassword.resetPassword")}
            color={Commons.buttonColor}
          />
        </View>
        <DropdownAlert
          ref={ref => {
            this.dropdown = ref;
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInput: {
    height: 40,
    width: "90%",
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 8,
    paddingLeft: 2,
    paddingRight: 2
  }
});
