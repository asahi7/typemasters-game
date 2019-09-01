import React from "react";

const TypingLanguageContext = React.createContext({
  typingLanguageState: {
    typingLanguage: "en",
    changeTypingLanguage: () => {}
  }
});

export default TypingLanguageContext;
