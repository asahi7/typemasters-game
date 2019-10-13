import React from "react";
import { StyleSheet, Text, TextInput, Button, View } from "react-native";
import firebase from "firebase";
import Commons from "../Commons";
import globalStyles from "../styles";
import DropdownAlert from "react-native-dropdownalert";
import i18n from "i18n-js";
import ConnectionContext from "../context/ConnnectionContext";

export default React.forwardRef((props, ref) => (
  <ConnectionContext.Consumer>
    {online => <SignUp {...props} online={online} ref={ref} />}
  </ConnectionContext.Consumer>
));

export class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      errorMessage: null
    };
    this.handleSignUp = this.handleSignUp.bind(this);
  }

  componentDidMount() {
    if (__DEV__) {
      console.log("User is " + (this.props.online ? "online" : "offline"));
    }
  }

  handleSignUp() {
    if (this.props.online) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(authObj => {
          authObj.user.sendEmailVerification();
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
        {this.state.errorMessage && (
          <Text style={{ color: "red" }}>{this.state.errorMessage}</Text>
        )}
        <TextInput
          placeholder={i18n.t("common.email")}
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          secureTextEntry
          placeholder={i18n.t("common.password")}
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />
        <View style={globalStyles.normalButton}>
          <Button title={i18n.t("signUp.signUp")} onPress={this.handleSignUp} />
        </View>
        <View style={globalStyles.normalButton}>
          <Button
            onPress={() => this.props.navigation.navigate("SignIn")}
            title={i18n.t("signUp.haveAccount")}
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
