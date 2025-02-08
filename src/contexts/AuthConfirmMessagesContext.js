import { createContext, useEffect, useState } from "react";
import { Animated } from "react-native";

export const AuthConfirmMessagesContext = createContext();

export const AuthConfirmMessagesProvider = ({ children }) => {
  const [authConfirmMessage, setAuthConfirmMessage] = useState("");

  const [authConfirmPopups, setAuthConfirmPopups] = useState({
    signIn: false,
    signUp: false,
    logout: false,
  });

  const [authConfirmPopupAnimations] = useState({
    signIn: new Animated.Value(0),
    signInRight: new Animated.Value(0),
    signUp: new Animated.Value(0),
    signUpRight: new Animated.Value(0),
    logout: new Animated.Value(0),
    logoutRight: new Animated.Value(0),
  });

  return (
    <AuthConfirmMessagesContext.Provider
      value={{
        authConfirmMessage,
        setAuthConfirmMessage,
        authConfirmPopups,
        setAuthConfirmPopups,
        authConfirmPopupAnimations,
      }}
    >
      {children}
    </AuthConfirmMessagesContext.Provider>
  );
};
