import { StyleSheet, PixelRatio } from "react-native";

let FONTS = {
  HEADER_FONT: 30,
  TABLE_HEADER_FONT: 20,
  NORMAL_TEXT_FONT: 16,
  TABLE_FONT: 13
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
    backgroundColor: "#71B6D5"
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
    letterSpacing: 1,
    textAlign: "center",
    fontWeight: "700"
  },
  tableHeader: {
    fontSize: FONTS.TABLE_HEADER_FONT,
    color: "#FFFFFF",
    letterSpacing: 1,
    textAlign: "center",
    fontWeight: "700"
  },
  normalText: {
    fontSize: FONTS.NORMAL_TEXT_FONT,
    color: "#FFFFFF",
    textAlign: "center",
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 5
  },
  row: {
    flex: 0.1,
    borderWidth: 1,
    marginTop: 1,
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "space-between"
  },
  column: {
    marginLeft: 10,
    marginRight: 10,
    color: "#FFFFFF",
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
  }
});

export { globalStyles as default, globalStyles, FONTS };
