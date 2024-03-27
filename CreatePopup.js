import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Alert,
  BackHandler,
} from "react-native";
import styles from "./styles";

function CreatePopup(props) {
  const [text, onChangeText] = useState("");

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        Alert.alert("Dischard task", "Are you sure?", [
          { text: "Cancel", onPress: () => null },
          { text: "OK", onPress: () => props.closeCreatePopup() },
        ]);
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  function checkTextAndSave() {
    if (text != "") {
      props.isAnyTaskCreated
        ? props.setTasks((prev) => [...prev, text])
        : props.setTasks([text]);
      props.closeCreatePopup();
    } else {
      alert("Please, insert any text!");
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
            onPress={() =>
              Alert.alert("Dischard task", "Are you sure?", [
                { text: "Cancel", onPress: () => null },
                { text: "OK", onPress: () => props.closeCreatePopup() },
              ])
            }
          >
            <Text style={styles.text}>Cancel</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={[styles.commonButton, { backgroundColor: "#0d4f6b" }]}
            onPress={() => {
              checkTextAndSave();
            }}
          >
            <Text style={styles.text}>Add</Text>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}

export default CreatePopup;
