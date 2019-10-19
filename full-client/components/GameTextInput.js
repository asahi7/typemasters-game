import React from "react";
import { StyleSheet, View, TextInput } from "react-native";
import _ from "lodash";
import i18n from "i18n-js";
import inputComparisonAdapter from "../utils/inputComparisonAdapter";

export default class GameTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      correctInput: true
    };
    this.wordIndex = 0;
    this.lastInputBackspace = false;
    this.totalInputChars = 0;
    this.correctInputChars = 0;
    this.handleUserInput = this.handleUserInput.bind(this);
    this.isNotLastMatchingWordOfText = this.isNotLastMatchingWordOfText.bind(
      this
    );
    this.isLastMatchingWordOfText = this.isLastMatchingWordOfText.bind(this);
    this.setInitialState = this.setInitialState.bind(this);
  }

  componentDidMount() {
    this.setInitialState();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.refresh !== this.props.refresh) {
      this.setInitialState();
    }
  }

  componentWillUnmount() {
    this._textInput.setNativeProps({ text: "" });
  }

  setInitialState() {
    this.setState({
      correctInput: true
    });
    this._textInput.setNativeProps({ text: "" });
    this.wordIndex = 0;
    this.totalInputChars = 0;
    this.correctInputChars = 0;
  }

  // References https://github.com/facebook/react-native/issues/20119#issuecomment-421994973
  handleUserInput(input) {
    if (!this.props.textArray || _.isEmpty(this.props.textArray)) {
      return;
    }
    const word = this.props.textArray[this.wordIndex];
    if (!this.lastInputBackspace) {
      this.totalInputChars = this.totalInputChars + 1;
    }
    const matchSuccess = inputComparisonAdapter(
      word,
      input,
      this.props.language
    );
    if (matchSuccess) {
      this.setState({
        correctInput: true
      });
      if (!this.lastInputBackspace) {
        this.correctInputChars = this.correctInputChars + 1;
      }
    } else {
      this.setState({
        correctInput: false
      });
    }
    if (this.lastInputBackspace) {
      this.lastInputBackspace = false;
    }
    this.props.accuracyHandler(this.totalInputChars, this.correctInputChars);
    if (
      this.isNotLastMatchingWordOfText(input) ||
      this.isLastMatchingWordOfText(input)
    ) {
      this._textInput.clear();
      this.props.handler(
        word.length,
        this.props.textArray.slice(this.wordIndex + 1).join(" ")
      );
      this.wordIndex = this.wordIndex + 1;
    }
  }

  isNotLastMatchingWordOfText(input) {
    const word = this.props.textArray[this.wordIndex];
    return (
      input.charAt(input.length - 1) === " " &&
      this.props.textArray.length - 1 !== this.wordIndex &&
      inputComparisonAdapter(
        word,
        input.slice(0, input.length - 1),
        this.props.language,
        true
      )
    );
  }

  isLastMatchingWordOfText(input) {
    const word = this.props.textArray[this.wordIndex];
    return (
      this.props.textArray.length - 1 === this.wordIndex &&
      inputComparisonAdapter(word, input, this.props.language, true)
    );
  }

  render() {
    return (
      <View style={styles.textInput}>
        <TextInput
          style={[
            styles.textInputStyle,
            this.state.correctInput
              ? styles.correctTextInput
              : styles.incorrectTextInput
          ]}
          autoCapitalize="none"
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace") {
              this.lastInputBackspace = true;
            }
          }}
          onChangeText={this.handleUserInput}
          ref={input => {
            this._textInput = input;
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInput: {
    flex: 0.1,
    flexDirection: "row",
    alignItems: "stretch",
    margin: 10,
    color: "#FFFFFF",
    borderRadius: 40
  },
  textInputStyle: {
    flex: 1,
    padding: 5,
    height: 40,
    borderWidth: 2,
    fontFamily: "monospace"
  },
  correctTextInput: {
    borderColor: "#4ce300",
    borderRadius: 40,
    color: "#FFFFFF"
  },
  incorrectTextInput: {
    borderColor: "#ff0000",
    borderRadius: 40,
    color: "#FFFFFF"
  }
});
