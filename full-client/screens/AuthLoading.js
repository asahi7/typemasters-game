import React from "react";
import { View, Text, ActivityIndicator, AsyncStorage } from "react-native";
import firebase from "firebase";
import globalStyles from "../styles";
import WebAPI from "../WebAPI";
import i18n from "i18n-js";

export default class AuthLoading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    // Every time user's log in state changes, this will be triggered.
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        AsyncStorage.clear();
      }
      if (user && user.emailVerified) {
        if (__DEV__) {
          console.log("User is verified");
        }
        WebAPI.createUserIfNotExists(user.email, user.uid).then(() => {
          this.props.navigation.navigate("PersonalPage");
        });
      } else if (user && !user.emailVerified) {
        if (__DEV__) {
          console.log(
            "User is not verified redirecting to EmailVerificationPage"
          );
        }
        this.props.navigation.navigate("EmailVerificationPage");
      } else {
        if (__DEV__) {
          console.log("User is not present");
        }
        this.props.navigation.navigate("SignIn");
      }
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>{i18n.t("loading.loading")}</Text>
        </View>
      );
    }
  }
}
