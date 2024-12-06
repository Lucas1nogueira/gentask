import React from "react";
import { Text, View, Animated, Pressable } from "react-native";
import styles from "../styles/styles";

function Menu(props) {
  return (
    <View
      style={[styles.fullscreenArea, { backgroundColor: "rgba(0,0,0,0.5)" }]}
    >
      <Animated.View
        style={[
          styles.menuLeft,
          {
            transform: [
              {
                translateX: props.animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-200, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.text}>MyTasks - Simple Task Manager</Text>
      </Animated.View>
      <Pressable style={styles.menuRight} onPress={props.close} />
    </View>
  );
}

export default Menu;
