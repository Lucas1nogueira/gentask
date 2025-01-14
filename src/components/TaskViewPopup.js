import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableHighlight,
  BackHandler,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { categorizeTask } from "../services/geminiService";
import styles from "../styles/styles";

function TaskViewPopup(props) {
  const [text, onChangeText] = useState("");

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        typeof text === "string" &&
        text.replace(/\s/g, "").length != 0 &&
        text != props.selectedTask.text
          ? props.openDiscardPopup()
          : props.close();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [text]);

  useEffect(() => {
    onChangeText(props.selectedTask.text);
  }, []);

  function updateTask() {
    if (text != props.selectedTask.text) {
      props.openLoadingPopup();
      categorizeTask(text).then((taskInfo) => {
        const taskId = props.selectedTaskId;
        const time = Date.now();
        const task = {
          text: text,
          category: taskInfo.categoryName,
          color: taskInfo.categoryColor,
          isUrgent: taskInfo.isUrgent,
          isCompleted: props.selectedTask.isCompleted,
          createdAt: props.selectedTask.createdAt,
          updatedAt: time,
        };
        const updatedTasks = { ...props.tasks };
        updatedTasks[taskId] = task;
        props.setTasks(updatedTasks);
        props.closeLoadingPopup();
        setTimeout(() => {
          props.openSuccessPopup();
        }, 500);
      });
    }
    props.close();
  }

  function checkText() {
    if (typeof text === "string" && text.trim().length != 0) {
      updateTask();
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
          defaultValue={props.selectedTask.text}
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
              text != props.selectedTask.text
                ? props.openDiscardPopup()
                : props.close();
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
              checkText();
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

export default TaskViewPopup;
