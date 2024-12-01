import React, { useEffect } from "react";
import { Text, Animated } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import styles from "./styles";

function MinimalPopup(props) {
  useEffect(() => {
    setTimeout(() => {
      props.close();
    }, 3000);
  }, []);

  return (
    <Animated.View
      style={[
        styles.minimalPopup,
        {
          backgroundColor: props.color,
          opacity: props.opacityAnimation,
          transform: [
            {
              translateX: props.rightAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <FontAwesome name="exclamation-circle" size={24} color="white" />
      <Text style={styles.text}>{props.message}</Text>
    </Animated.View>
  );
}

export default MinimalPopup;
