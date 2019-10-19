import _ from "lodash";
import { Text, View } from "react-native";
import { globalStyles } from "../styles";
import React from "react";

const prepareFlatListElements = elementMapper => {
  const listElements = [];
  Object.keys(elementMapper).forEach(key => {
    if (elementMapper[key].executeIf && !elementMapper[key].executeIf()) {
      return;
    }
    let value = _.get(
      elementMapper[key].accessorObject(),
      elementMapper[key].valuePath,
      null
    );
    console.log(key, value);
    if (value === undefined || value === null) {
      const defaultValue = elementMapper[key].defaultValue;
      if (defaultValue !== null && defaultValue !== undefined) {
        if (typeof defaultValue === "function") {
          value = defaultValue();
        } else {
          value = defaultValue;
        }
      } else {
        return null;
      }
    }
    if (elementMapper[key].preprocessor) {
      value = elementMapper[key].preprocessor(value);
    }
    if (elementMapper[key].wrapIntoElement) {
      value = elementMapper[key].wrapIntoElement(value);
    }
    listElements.push({
      key: elementMapper[key].key,
      value
    });
  });
  return listElements;
};

const renderItem = ({ item }) => {
  const isValuePrimitive = Object(item.value) !== item.value;
  return (
    <View style={globalStyles.row}>
      <Text style={globalStyles.column}>{item.key}</Text>
      {isValuePrimitive && (
        <Text style={globalStyles.column}>{item.value}</Text>
      )}
      {!isValuePrimitive && item.value}
    </View>
  );
};

export { prepareFlatListElements, renderItem };
