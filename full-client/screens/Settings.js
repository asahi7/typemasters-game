import React from "react";
import {
  Text,
  StyleSheet,
  AsyncStorage,
  Picker,
  View,
  TextInput,
  Button,
  Keyboard,
  ScrollView,
  Switch
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import WebAPI from "../WebAPI";
import Loading from "./Loading";
import firebase from "firebase";
import Commons from "../Commons";
import { globalStyles, FONTS } from "../styles";
import DropdownAlert from "react-native-dropdownalert";
import i18n from "i18n-js";
import countryList from "../consts/countryList";
import ConnectionContext from "../context/ConnnectionContext";
import TypingLanguageContext from "../context/TypingLanguageContext";

export default React.forwardRef((props, ref) => (
  <TypingLanguageContext.Consumer>
    {typingLanguageState => (
      <ConnectionContext.Consumer>
        {online => (
          <Settings
            {...props}
            typingLanguage={typingLanguageState.typingLanguage}
            changeTypingLanguage={typingLanguageState.changeTypingLanguage}
            online={online}
            ref={ref}
          />
        )}
      </ConnectionContext.Consumer>
    )}
  </TypingLanguageContext.Consumer>
));

// TODO(aibek): refactor in future to avoid duplication, maybe use template pattern
export class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textLanguage: null,
      loading: true,
      authenticated: null,
      nicknameInput: "",
      errorMessage: null,
      userData: null,
      ratedSwitch: true,
      supportedLangs: null
    };
    this.textLanguageSelected = this.textLanguageSelected.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.handleNicknameInput = this.handleNicknameInput.bind(this);
    this.updateScreen = this.updateScreen.bind(this);
    this.countrySelected = this.countrySelected.bind(this);
    this.getPersistentDataOffline = this.getPersistentDataOffline.bind(this);
    this.getApiDataOnline = this.getApiDataOnline.bind(this);
    this.getRatedSwitchValue = this.getRatedSwitchValue.bind(this);
    this.handleRatedSwitch = this.handleRatedSwitch.bind(this);
  }

  async componentDidMount() {
    await this.getRatedSwitchValue();
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
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.updateScreen();
      }
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }

  async updateScreen() {
    if (__DEV__) {
      console.log("Updated screen");
    }
    this.setState({ errorMessage: null });
    if (this.props.online) {
      this.getApiDataOnline();
    } else {
      this.getPersistentDataOffline();
    }
  }

  getPersistentDataOffline() {
    return AsyncStorage.getItem("settings-userData").then(value => {
      if (!value) {
        this.setState({
          userData: null
        });
      } else {
        const userData = JSON.parse(value);
        this.setState({
          userData
        });
      }
    });
  }

  getApiDataOnline() {
    let userData = {};
    const user = firebase.auth().currentUser;
    const promises = [];
    promises.push(WebAPI.getSupportedLanguages());
    if (user && user.emailVerified) {
      promises.push(WebAPI.getUserInfo(user.uid));
    } else {
      this.setState({
        authenticated: false,
        loading: false
      });
    }
    Promise.all(promises)
      .then(results => {
        this.setState({
          supportedLangs: results[0]
        });
        if (results[1]) {
          userData = {
            nickname: results[1].nickname,
            country: results[1].country
          };
          return AsyncStorage.setItem(
            "settings-userData",
            JSON.stringify(userData)
          ).then(() => {
            this.setState({
              userData,
              authenticated: true,
              loading: false
            });
          });
        }
      })
      .catch(error => {
        if (__DEV__) {
          console.log(error);
        }
        throw error;
      });
  }

  async getRatedSwitchValue() {
    const value = await AsyncStorage.getItem("ratedSwitchValue");
    if (__DEV__) {
      console.log("Rated switch value " + value);
    }
    if (!value) {
      this.setState({
        ratedSwitch: true
      });
      await AsyncStorage.setItem("ratedSwitchValue", "true");
    } else {
      this.setState({
        ratedSwitch: value === "true"
      });
    }
  }

  saveSettings() {
    this.setState({ errorMessage: null });
    this.props.changeTypingLanguage(this.state.textLanguage);
    AsyncStorage.setItem(
      "ratedSwitchValue",
      this.state.ratedSwitch === true ? "true" : "false"
    );
    if (this.props.online) {
      if (this.state.authenticated) {
        const nicknameInput = this.state.nicknameInput;
        if (nicknameInput.length !== 0) {
          WebAPI.saveNickname(this.state.nicknameInput)
            .then(() => {
              this.setState({
                userData: {
                  ...this.state.userData,
                  nickname: nicknameInput
                }
              });
            })
            .catch(error => {
              // TODO(aibek): add i18n
              if (error.message === "Validation Error") {
                this.setState({
                  errorMessage: error.err[0].msg + " in " + error.err[0].param
                });
                return;
              }
              this.setState({ errorMessage: error.message });
            });
        }
        // TODO(aibek): might be unnecessary call when no change happens
        if (
          this.state.userData.country !== "Select" &&
          this.state.userData.country
        ) {
          WebAPI.saveCountry(this.state.userData.country).catch(error => {
            if (__DEV__) {
              console.log(JSON.stringify(error));
            }
            // TODO(aibek): add i18n
            if (error.message === "Validation Error") {
              this.setState({
                errorMessage: error.err[0].msg + " in " + error.err[0].param
              });
              return;
            }
            this.setState({ errorMessage: error.message });
          });
        }
        this.setState({ nicknameInput: "" });
      }
    } else {
      this.dropdown.alertWithType(
        "warn",
        i18n.t("common.warning"),
        i18n.t("settings.saveSettingsOffline")
      );
    }
    Keyboard.dismiss();
  }

  textLanguageSelected(textLanguage) {
    this.setState({ textLanguage });
  }

  countrySelected(itemValue) {
    this.setState({
      userData: {
        ...this.state.userData,
        country: itemValue
      }
    });
  }

  handleNicknameInput(input) {
    this.setState({
      nicknameInput: input
    });
  }

  handleRatedSwitch(value) {
    this.setState({
      ratedSwitch: value
    });
  }

  render() {
    if (this.state.loading) return <Loading />;
    const typingLanguageSelection = this.state.textLanguage
      ? this.state.textLanguage
      : this.props.typingLanguage;
    return (
      <LinearGradient colors={Commons.bgColors} style={globalStyles.container}>
        <View style={{ marginTop: 30 }}>
          <Text style={globalStyles.header}>{i18n.t("settings.header")}</Text>
        </View>
        {!this.state.userData && (
          <View>
            <Text style={globalStyles.tableHeader}>
              {i18n.t("common.noData")}
            </Text>
          </View>
        )}
        <ScrollView
          style={{ marginTop: 10, marginBottom: 10 }}
          keyboardShouldPersistTaps={"always"}
        >
          {this.state.userData && (
            <View>
              {this.state.errorMessage && (
                <Text style={{ color: "red" }}>{this.state.errorMessage}</Text>
              )}
              <View style={{ marginTop: 10 }}>
                {this.state.authenticated && (
                  <View style={globalStyles.row}>
                    <Text style={globalStyles.column}>
                      {i18n.t("settings.yourNickname")}:
                    </Text>
                    <Text style={globalStyles.column}>
                      {this.state.userData.nickname
                        ? this.state.userData.nickname
                        : i18n.t("settings.notSpecified")}
                    </Text>
                  </View>
                )}
                {this.state.authenticated && (
                  <View style={globalStyles.row}>
                    <Text style={globalStyles.column}>
                      {i18n.t("settings.changeNickname")}:
                    </Text>
                    <View style={globalStyles.column}>
                      <TextInput
                        style={styles.textInput}
                        autoCapitalize="none"
                        placeholder={i18n.t("settings.yourNicknameInput")}
                        onChangeText={this.handleNicknameInput}
                        value={this.state.nicknameInput}
                      />
                    </View>
                  </View>
                )}
                {this.state.authenticated && (
                  <View style={globalStyles.row}>
                    <Text style={globalStyles.column}>
                      {i18n.t("common.country")}:
                    </Text>
                    <Picker
                      selectedValue={
                        this.state.userData.country
                          ? this.state.userData.country
                          : "Select"
                      }
                      style={[{ width: 150, height: 100 }, styles.column]}
                      itemStyle={{
                        height: 100,
                        fontSize: FONTS.TABLE_HEADER_FONT
                      }}
                      onValueChange={this.countrySelected}
                    >
                      {countryList.map(country => {
                        return (
                          <Picker.Item
                            value={country}
                            label={country}
                            key={country}
                          />
                        );
                      })}
                    </Picker>
                  </View>
                )}
              </View>
            </View>
          )}
          <View style={globalStyles.row}>
            <Text style={globalStyles.column}>
              {i18n.t("settings.typingLanguage")}:
            </Text>
            {typingLanguageSelection && this.state.supportedLangs && (
              <Picker
                selectedValue={typingLanguageSelection}
                prompt={i18n.t("settings.selectTypingLanguage")}
                style={[{ width: 150, height: 100 }, styles.column]}
                itemStyle={{ height: 100, fontSize: FONTS.TABLE_HEADER_FONT }}
                onValueChange={this.textLanguageSelected}
              >
                {this.state.supportedLangs.map((lang, index) => {
                  return (
                    <Picker.Item
                      value={lang.value}
                      label={lang.label}
                      key={index}
                    />
                  );
                })}
              </Picker>
            )}
          </View>
          <View style={globalStyles.row}>
            <Text style={globalStyles.column}>
              {i18n.t("settings.ratedSwitch")}:
            </Text>
            <Switch
              onValueChange={this.handleRatedSwitch}
              value={this.state.ratedSwitch}
            />
          </View>
          <View style={globalStyles.normalButton}>
            <Button
              onPress={this.saveSettings}
              title={i18n.t("settings.save")}
              color={Commons.buttonColor}
            />
          </View>
        </ScrollView>
        <DropdownAlert
          ref={ref => {
            this.dropdown = ref;
          }}
        />
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  textInput: {
    width: 100,
    paddingLeft: 2,
    paddingRight: 2
  },
  column: {
    marginLeft: 10,
    marginRight: 10
  }
});
