import React, { useContext, useEffect } from "react";
import {
  Animated,
  BackHandler,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import MenuOption from "./MenuOption";

function Menu(props) {
  const { styles } = useContext(ThemeContext);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        props.close();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../assets/adaptive-icon.png")}
            style={{ width: 80, height: 80, marginLeft: -15, marginRight: -10 }}
          />
          <View>
            <Text style={styles.header}>Gentask</Text>
            <Text style={styles.text}>Task Manager + AI</Text>
          </View>
        </View>
        <View style={styles.menuOptions}>
          <MenuOption
            iconName="settings"
            text="Ajustes"
            action={props.openSettingsPopup}
          />
        </View>
      </Animated.View>
      <Pressable style={styles.menuRight} onPress={props.close} />
    </View>
  );
}

export default Menu;
