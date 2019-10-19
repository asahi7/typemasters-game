import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
  TouchableOpacity,
  Image
} from "react-native";
import firebase from "firebase";
import WebAPI from "../WebAPI";
import Commons from "../Commons";
import globalStyles from "../styles";
import DropdownAlert from "react-native-dropdownalert";
import i18n from "i18n-js";
import Sentry from "sentry-expo";
import ConnectionContext from "../context/ConnnectionContext";
import Hr from "../components/Hr";

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

  componentDidMount() {
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
        <View style={globalStyles.inside_container}>
          {this.state.errorMessage && (
            <Text style={{ color: "red" }}>{this.state.errorMessage}</Text>
          )}
          <TextInput
            style={globalStyles.commonInformationTextInput}
            autoCapitalize="none"
            placeholder={i18n.t("common.email")}
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
          />
          <TextInput
            secureTextEntry
            style={globalStyles.commonInformationTextInput}
            autoCapitalize="none"
            placeholder={i18n.t("common.password")}
            onChangeText={password => this.setState({ password })}
            value={this.state.password}
          />
          <Hr />
          <View style={globalStyles.containerWithInlineButtons}>
            <View style={globalStyles.smallButtonContainer}>
              <TouchableOpacity onPress={this.handleSignIn}>
                <Text style={globalStyles.smallButton}>
                  {i18n.t("common.signIn")}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={globalStyles.smallButtonContainer}>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("SignUp")}
              >
                <Text style={globalStyles.smallButton}>
                  {i18n.t("signIn.dontHaveAccount")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Hr />
          <View style={globalStyles.smallButtonContainer}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("ForgotPassword")}
            >
              <Text style={globalStyles.smallButton}>
                {i18n.t("signIn.forgotPassword")}
              </Text>
            </TouchableOpacity>
          </View>
          <DropdownAlert
            ref={ref => {
              this.dropdown = ref;
            }}
          />
        </View>
      </View>
    );
  }
}
