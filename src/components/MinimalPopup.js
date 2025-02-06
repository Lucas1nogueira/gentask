import React, { useContext, useEffect } from "react";
import { Text, Animated, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { ThemeContext } from "../contexts/ThemeContext";

function MinimalPopup(props) {
  const { styles } = useContext(ThemeContext);

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
        props.color && { backgroundColor: props.color },
        {
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
        <ActivityIndicator size="small" color={styles.icon.color} />
      ) : (
        <FontAwesome name="exclamation-circle" size={24} color="white" />
      )}
      <Text
        style={[
          styles.text,
          props.color && { color: "white" },
          { paddingLeft: 5 },
        ]}
      >
        {props.message}
      </Text>
    </Animated.View>
  );
}

export default MinimalPopup;
