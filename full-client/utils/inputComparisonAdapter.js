import _ from "lodash";

const _replaceAll = (str, find, replace) => {
  return str.replace(new RegExp(find, "g"), replace);
};

const inputComparisonAdapter = (word, input, language, fullCompare = false) => {
  input = input.trim();
  if (language === "kzLat") {
    const standard = [
      "%E1",
      "%u01F5",
      "%u0144",
      "%F3",
      "%FA",
      "%FD",
      "%C1",
      "%u01F4",
      "%u0143",
      "%D3",
      "%DA",
      "%DD"
    ];
    const nonStandard = [
      "a%u0301",
      "g%u0301",
      "n%u0301",
      "o%u0301",
      "u%u0301",
      "y%u0301",
      "A%u0301",
      "G%u0301",
      "N%u0301",
      "O%u0301",
      "U%u0301",
      "Y%u0301"
    ];
    input = escape(input);
    for (let i = 0; i < standard.length; i++) {
      input = _replaceAll(input, nonStandard[i], standard[i]);
    }
    if (!fullCompare) {
      return _.startsWith(escape(word), input);
    } else {
      return escape(word) === input;
    }
  } else {
    if (!fullCompare) {
      return _.startsWith(word, input);
    } else {
      return word === input;
    }
  }
};

export default inputComparisonAdapter;
