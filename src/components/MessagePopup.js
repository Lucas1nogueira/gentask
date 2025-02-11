import React, { useContext, useEffect } from "react";
import { Text, View, BackHandler, TouchableOpacity } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../contexts/ThemeContext";

function MessagePopup(props) {
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
        <View
          style={[
            styles.popupButtonRow,
            props.error && { justifyContent: "flex-end" },
          ]}
        >
          <TouchableOpacity
            style={[styles.commonButton, styles.cancelButton]}
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
              <AntDesign name="back" size={20} color="white" />
              <Text style={[styles.text, { color: "white" }]}>Voltar</Text>
            </View>
          </TouchableOpacity>
          {!props.error && (
            <TouchableOpacity
              style={[styles.commonButton, styles.confirmButton]}
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
                  color="white"
                />
                <Text style={[styles.text, { color: "white" }]}>
                  {props.actionName}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default MessagePopup;
