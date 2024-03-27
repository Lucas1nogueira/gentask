import React from "react";
import { Text, View, Pressable } from "react-native";
import styles from "./styles";

function Menu(props) {
  return (
    <View style={styles.fullscreenArea}>
      <View style={styles.menuLeft}>
        <Text style={styles.text}>MyTasks - Simple Task Manager</Text>
      </View>
      <Pressable style={styles.menuRight} onPress={props.closeMenu} />
    </View>
  );
}

export default Menu;
