import React from "react";
import { Text, View, ScrollView } from "react-native";
import Commons from "../Commons";
import globalStyles from "../styles";
import i18n from "i18n-js";
import Hr from "../components/Hr";

export default class About extends React.Component {
  render() {
    return (
      <View style={globalStyles.container}>
        <ScrollView style={{ marginTop: 10, marginBottom: 10 }}>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>
              {i18n.t("about.subHeader1")}
            </Text>
            <Text style={globalStyles.normalText}>
              {i18n.t("about.firstP")}
            </Text>
            <Hr />
            <Text style={globalStyles.normalText}>
              {i18n.t("about.secondP")}
            </Text>
            <Hr />
            <Text style={globalStyles.normalText}>
              {i18n.t("about.thirdP")}
            </Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>
              {i18n.t("about.subHeader2")}
            </Text>
            <Text style={globalStyles.normalText}>
              {i18n.t("about.fourthP")}
            </Text>
            <Hr />
            <Text style={globalStyles.normalText}>
              {i18n.t("about.fifthP")}
            </Text>
            <Hr />
            <Text style={globalStyles.normalText}>
              {i18n.t("about.sixthP")}
            </Text>
            <Hr />
            <Text style={globalStyles.normalText}>
              {i18n.t("about.seventhP")}
            </Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={globalStyles.tableHeader}>
              {i18n.t("about.subHeader3")}
            </Text>
            <Text style={globalStyles.normalText}>
              {i18n.t("about.eighthP")}
            </Text>
            <Hr />
            <Text style={globalStyles.normalText}>
              {i18n.t("about.ninethP")}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}
