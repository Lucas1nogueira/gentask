import React, { useEffect } from "react";
import { Text, View, TouchableHighlight, BackHandler } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import styles from "../styles/styles";

function MessagePopup(props) {
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
      style={[
        styles.fullscreenArea,
        {
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        },
      ]}
    >
      <View style={styles.messagePopup}>
        <Text style={styles.header}>{props.title}</Text>
        <Text style={[styles.text, { marginTop: 10 }]}>
          {props.description}
        </Text>
        <View style={styles.popupButtonRow}>
          <TouchableHighlight
            style={[styles.commonButton, { backgroundColor: "#0d4f6b" }]}
            onPress={() => props.close()}
          >
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              <AntDesign name="back" size={20} color="#fff" />
              <Text style={styles.text}>Voltar</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={[
              styles.commonButton,
              { backgroundColor: props.actionButtonColor },
            ]}
            onPress={() => {
              props.action();
              props.close();
            }}
          >
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              <Ionicons
                name={
                  props.actionName == "Exit"
                    ? "close"
                    : props.actionName == "Delete"
                    ? "trash"
                    : "checkmark"
                }
                size={20}
                color="#fff"
              />
              <Text style={styles.text}>{props.actionName}</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}

export default MessagePopup;
