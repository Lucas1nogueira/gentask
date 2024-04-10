import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Alert,
  BackHandler,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import styles from "./styles";

function ViewPoup(props) {
  const [text, onChangeText] = useState("");

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        Alert.alert("Discard changes", "Are you sure?", [
          { text: "Cancel", onPress: () => null },
          { text: "OK", onPress: () => props.closeViewPopup() },
        ]);
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  function checkTextAndSave() {
    if (text != "") {
      props.tasks[props.index] = text;
      props.setTasks(props.tasks);
      props.save();
      props.closeViewPopup();
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
            onPress={() =>
              Alert.alert("Discard changes", "Are you sure?", [
                { text: "Cancel", onPress: () => null },
                { text: "OK", onPress: () => props.closeViewPopup() },
              ])
            }
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
