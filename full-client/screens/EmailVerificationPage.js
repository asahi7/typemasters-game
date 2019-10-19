import React from "react";
import { Text, Button, View, TouchableOpacity } from "react-native";
import firebase from "firebase";
import Commons from "../Commons";
import globalStyles from "../styles";
import Loading from "./Loading";
import i18n from "i18n-js";
import Sentry from "sentry-expo";
import Hr from "../components/Hr";

// TODO(aibek): add offline mode
export default class EmailVerificationPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true
    };
    this.sendNewLink = this.sendNewLink.bind(this);
    this.updateScreen = this.updateScreen.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  componentDidMount() {
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.updateScreen();
      }
    );
    this.updateScreen();
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  updateScreen() {
    if (__DEV__) {
      console.log("Email verification page updated screen");
    }
    const user = firebase.auth().currentUser;
    this.setState({ user, loading: false });
  }

  sendNewLink() {
    if (this.state.user && !this.state.emailVerified) {
      this.state.user.sendEmailVerification();
    }
  }

  handleSignOut() {
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
            Sentry.captureException(error);
            console.log(error);
          }
        }
      );
  }

  render() {
    if (this.state.loading) return <Loading />;
    return (
      <View style={globalStyles.container}>
        <View style={globalStyles.inside_container}>
          <Text style={globalStyles.normalText}>
            {i18n.t("emailVerification.text")}
          </Text>
          <Hr />
          <View style={globalStyles.containerWithInlineButtons}>
            <View style={globalStyles.smallButtonContainer}>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("SignIn")}
              >
                <Text style={globalStyles.smallButton}>
                  {i18n.t("common.signIn")}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={globalStyles.smallButtonContainer}>
              <TouchableOpacity onPress={this.sendNewLink}>
                <Text style={globalStyles.smallButton}>
                  {i18n.t("emailVerification.sendLink")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Hr />
        </View>
      </View>
    );
  }
}
