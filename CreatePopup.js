import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  BackHandler,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import styles from "./styles";

function CreatePopup(props) {
  const [text, onChangeText] = useState("");

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        typeof text === "string" &&
        text.replace(/\s/g, "").length != 0 &&
        text != props.taskToChange
          ? props.openDiscardPopup()
          : props.closeCreatePopup();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [text]);

  function checkTextAndSave() {
    if (typeof text === "string" && text.trim().length != 0) {
      props.isAnyTaskCreated
        ? props.setTasks((prev) => [...prev, text])
        : props.setTasks([text]);
      props.closeCreatePopup();
    } else {
      props.openNoTextPopup();
    }
  }

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
      <View style={styles.taskPopup}>
        <Text style={styles.text}>New task</Text>
        <TextInput
          style={styles.taskInput}
          multiline={true}
          textAlignVertical="top"
          onChangeText={onChangeText}
          cursorColor={"#efdb00"}
          placeholder="Insert here..."
          placeholderTextColor={"#b5b5b5"}
        />
        <View style={styles.popupButtonRow}>
          <TouchableHighlight
            style={[styles.commonButton, { backgroundColor: "#470c0c" }]}
            onPress={() => {
              typeof text === "string" &&
              text.replace(/\s/g, "").length != 0 &&
              (text != props.taskToChange) != ""
                ? props.openDiscardPopup()
                : props.closeCreatePopup();
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
              <AntDesign name="back" size={20} color="#fff" />
              <Text style={styles.text}>Cancel</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={[styles.commonButton, { backgroundColor: "#0d4f6b" }]}
            onPress={() => {
              checkTextAndSave();
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
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.text}>Add</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}

export default CreatePopup;
