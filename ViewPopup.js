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

function ViewPoup(props) {
  const [text, onChangeText] = useState("");
  const [didTextChange, setTextChange] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        typeof text === "string" &&
        text.replace(/\s/g, "").length != 0 &&
        text != props.taskToChange
          ? props.openDiscardPopup()
          : props.closeViewPopup();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [text]);

  useEffect(() => {
    onChangeText(props.taskToChange);
  }, []);

  function checkTextAndSave() {
    if (typeof text === "string" && text.trim().length != 0) {
      props.tasks[props.index] = text;
      props.setTasks(props.tasks);
      props.save();
      props.closeViewPopup();
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
        <Text style={styles.text}>Task view</Text>
        <TextInput
          style={styles.taskInput}
          multiline={true}
          textAlignVertical="top"
          defaultValue={props.taskToChange}
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
              text != props.taskToChange
                ? props.openDiscardPopup()
                : props.closeViewPopup();
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
              <Text style={styles.text}>Close</Text>
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
              <Text style={styles.text}>Save</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}

export default ViewPoup;
