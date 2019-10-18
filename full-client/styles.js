import { StyleSheet, PixelRatio } from "react-native";

let FONTS = {
  HEADER_FONT: 30,
  TABLE_HEADER_FONT: 15,
  NORMAL_TEXT_FONT: 16,
  TABLE_FONT: 12
};

if (PixelRatio.get() <= 2) {
  FONTS = {
    HEADER_FONT: 20,
    TABLE_HEADER_FONT: 16,
    NORMAL_TEXT_FONT: 12,
    TABLE_FONT: 10
  };
}

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "#5E81C6"
  },
  inside_container: {
    flex: 1,
    marginTop: 100,
    marginBottom: 50,
    paddingLeft: 30,
    paddingRight: 30,
    flexDirection: "column",
    alignItems: "stretch",
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10
  },
  gameView: {
    flex: 1,
    flexDirection: "column",
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: "center"
  },
  header: {
    fontSize: FONTS.HEADER_FONT,
    color: "#FFFFFF",
    fontFamily:"monospace",
    letterSpacing: 1,
    textAlign: "center",
    fontWeight: "700"
  },
  tableHeader: {
    fontSize: FONTS.TABLE_HEADER_FONT,
    color: "#FFFFFF",
    fontFamily:"monospace",
    letterSpacing: 1,
    textAlign: "center",
    fontWeight: "500",
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 5
  },
  smallText: {
    fontSize: 12,
    color: "#71B6D5",
    fontWeight: "bold",
    fontFamily:"monospace",
    textAlign: "center",
  },
  normalText: {
    fontSize: FONTS.NORMAL_TEXT_FONT,
    color: "#FFFFFF",
    fontFamily:"monospace",
    fontWeight: "bold",
    textAlign: "center",
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 5
  },
  row: {
    flex: 0.1,
    marginTop: 1,
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft:12,
    paddingRight:12,
    paddingTop:5,
    paddingBottom:5,
    fontFamily:"monospace",
    fontSize: 10
  },
  column: {
    marginLeft: 10,
    marginRight: 10,
    color: "#FFFFFF",
    fontFamily:"monospace",
    fontWeight: "bold",
    fontSize: FONTS.TABLE_FONT
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  normalButton: {
    marginTop: 5,
    flex: 0.1,
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center"
  },
  backgroundImage: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    height: '100%'
  },
  raceTextView: {
    flex: 3,
    flexDirection: 'column',
    padding: 10,
    paddingBottom: 30,
  },
  bigText: {
    color: "#FFFFFF",
    fontFamily:"monospace",
    fontSize: 20,
  },
  smallButtonContainer: {
    marginTop: 5,
    flexWrap: 'wrap',
    flexDirection:'row',
    alignItems: "center",
    justifyContent: "center",
    paddingLeft:5,
    paddingRight:5,
    paddingTop:5,
    paddingBottom:5
  },
  smallButton: {
    color: "#FFFFFF",
    fontFamily:"monospace",
    fontSize: 15,
    paddingLeft:12,
    paddingRight:12,
    paddingTop:5,
    paddingBottom:5,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 30
  },
  textHeader: {
    color: "#FFFFFF",
    fontFamily:"monospace",
    fontSize: 10,
  },
  containerWithInlineButtons: {
    flexWrap: 'wrap',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row'
  },
  commonInformationTextInput: {
    height: 40,
    width: '100%',
    borderColor: '#71B6D5',
    borderWidth: 2,
    color: '#FFFFFF',
    borderRadius: 40,
    marginTop: 8,
    paddingLeft: 2,
    paddingRight: 2,
  },
});

export { globalStyles as default, globalStyles, FONTS };
