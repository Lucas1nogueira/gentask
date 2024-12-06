import React, { useEffect } from "react";
import { Text, Animated, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import styles from "../styles/styles";

function MinimalPopup(props) {
  if (!props.loading) {
    useEffect(() => {
      setTimeout(() => {
        props.close();
      }, 3000);
    }, []);
  }

  return (
    <Animated.View
      style={[
        styles.minimalPopup,
        props.customTop && { top: props.customTop },
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
      {props.loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <FontAwesome name="exclamation-circle" size={24} color="white" />
      )}
      <Text style={[styles.text, { paddingLeft: 5 }]}>{props.message}</Text>
    </Animated.View>
  );
}

export default MinimalPopup;
