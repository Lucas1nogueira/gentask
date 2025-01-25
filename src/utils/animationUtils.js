import { Animated, Easing } from "react-native";

export function animateOpening(property) {
  Animated.timing(property, {
    toValue: 1,
    duration: 300,
    easing: Easing.ease,
    useNativeDriver: true,
  }).start();
}

export function animateClosing(property, callbackFunction) {
  Animated.timing(property, {
    toValue: 0,
    duration: 300,
    easing: Easing.ease,
    useNativeDriver: true,
  }).start(() => {
    callbackFunction();
  });
}

export function animateSlideIn(property) {
  Animated.timing(property, {
    toValue: 1,
    duration: 400,
    easing: Easing.ease,
    useNativeDriver: true,
  }).start();
}

export function animateSlideOut(property) {
  Animated.timing(property, {
    toValue: 0,
    duration: 400,
    easing: Easing.ease,
    useNativeDriver: true,
  }).start();
}

export function animateRotation(property) {
  Animated.loop(
    Animated.timing(property, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: true,
      easing: Easing.linear,
    })
  ).start();
}
