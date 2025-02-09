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

export function animateExpanding(property, callbackFunction) {
  Animated.timing(property, {
    toValue: 1,
    duration: 150,
    useNativeDriver: false,
  }).start(() => {
    if (callbackFunction) {
      callbackFunction();
    }
  });
}

export function animateCollapsing(property, callbackFunction) {
  Animated.timing(property, {
    toValue: 0,
    duration: 100,
    useNativeDriver: false,
  }).start(() => {
    if (callbackFunction) {
      callbackFunction();
    }
  });
}

export function animateToggleSwitch(property, toValue, callbackFunction) {
  Animated.timing(property, {
    toValue: toValue,
    duration: 300,
    useNativeDriver: true,
  }).start(() => {
    if (callbackFunction) {
      callbackFunction();
    }
  });
}

export function animateOpeningUp(opacityAnimation, topAnimation) {
  Animated.parallel([
    Animated.timing(opacityAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }),
    Animated.timing(topAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }),
  ]).start();
}

export function animateClosingDown(
  opacityAnimation,
  topAnimation,
  callbackFunction
) {
  Animated.parallel([
    Animated.timing(opacityAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }),
    Animated.timing(topAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }),
  ]).start(() => {
    callbackFunction();
  });
}

export const animateBlinking = (property) =>
  Animated.loop(
    Animated.sequence([
      Animated.timing(property, {
        toValue: 0.5,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(property, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ])
  );
