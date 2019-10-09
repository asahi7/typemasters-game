import React from "react";
import { StyleSheet, Text, TextInput, Button, View } from "react-native";
import firebase from "firebase";
import WebAPI from "../WebAPI";
import Commons from "../Commons";
import globalStyles from "../styles";
import DropdownAlert from "react-native-dropdownalert";
import i18n from "i18n-js";
import Sentry from "sentry-expo";
import ConnectionContext from "../context/ConnnectionContext";

export default React.forwardRef((props, ref) => (
  <ConnectionContext.Consumer>
    {online => <SignIn {...props} online={online} ref={ref} />}
  </ConnectionContext.Consumer>
));

export class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      errorMessage: null
    };
    this.handleSignIn = this.handleSignIn.bind(this);
  }

  async componentDidMount() {
    if (__DEV__) {
      console.log("User is " + (this.props.online ? "online" : "offline"));
    }
  }

  handleSignIn() {
    const { email, password } = this.state;
    if (this.props.online) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(authObj => {
          if (__DEV__) {
            console.log("Signed in");
          }
          if (authObj.user && !authObj.user.emailVerified) {
            this.props.navigation.navigate("EmailVerificationPage");
          } else if (authObj.user) {
            return WebAPI.createUserIfNotExists(
              authObj.user.email,
              authObj.user.uid
            )
              .then(() => {
                this.props.navigation.navigate("PersonalPage");
              })
              .catch(error => {
                Sentry.captureException(error);
                if (__DEV__) {
                  console.log(error);
                }
              });
          }
        })
        .catch(error => this.setState({ errorMessage: error.message }));
    } else {
      this.dropdown.alertWithType(
        "warn",
        i18n.t("common.warn"),
        i18n.t("common.cantInternet")
      );
    }
  }

  render() {
    return (
      <View style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>{i18n.t("signIn.header")}</Text>
        </View>
        {this.state.errorMessage && (
          <Text style={{ color: "red" }}>{this.state.errorMessage}</Text>
        )}
        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          placeholder={i18n.t("common.email")}
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          secureTextEntry
          style={styles.textInput}
          autoCapitalize="none"
          placeholder={i18n.t("common.password")}
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />
        <View style={globalStyles.normalButton}>
          <Button
            onPress={this.handleSignIn}
            title={i18n.t("common.signIn")}
            color={Commons.buttonColor}
          />
        </View>
        <View style={globalStyles.normalButton}>
          <Button
            onPress={() => this.props.navigation.navigate("SignUp")}
            title={i18n.t("signIn.dontHaveAccount")}
            color={Commons.buttonColor}
          />
        </View>
        <View style={globalStyles.normalButton}>
          <Button
            onPress={() => this.props.navigation.navigate("ForgotPassword")}
            title={i18n.t("signIn.forgotPassword")}
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
