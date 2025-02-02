import React, { useState, useEffect } from "react";
import {
  Animated,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  BackHandler,
} from "react-native";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { categorizeTask } from "../services/geminiService";
import { animateClosing, animateOpening } from "../utils/animationUtils";
import ExpandableSelection from "./ExpandableSelection";
import CategoryPickerPopup from "./CategoryPickerPopup";
import DatePickerPopup from "./DatePickerPopup";
import styles from "../styles/styles";

function TaskViewPopup(props) {
  const [text, onChangeText] = useState("");

  const [selectedCategory, setSelectedCategory] = useState({
    name: "Escolhido por IA",
    color: "white",
  });
  const [isTaskUrgent, setTaskUrgent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [popups, setPopups] = useState({
    categoryPicker: false,
    datePicker: false,
  });

  const [popupAnimations] = useState({
    categoryPicker: new Animated.Value(0),
    datePicker: new Animated.Value(0),
  });

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
    setSelectedCategory({
      name: props.selectedTask.categoryName,
      color: props.selectedTask.categoryColor,
    });
    setTaskUrgent(props.selectedTask.isUrgent);
    setSelectedDate(props.selectedTask.dueDate);
  }, []);

  function updateTask() {
    if (text != props.selectedTask.text) {
      props.openLoadingPopup();
      const taskCategory =
        selectedCategory.name === "Escolhido por IA"
          ? null
          : selectedCategory.name;
      categorizeTask(text, taskCategory, isTaskUrgent, selectedDate).then(
        (taskInfo) => {
          const taskId = props.selectedTaskId;
          const time = Date.now();
          const task = {
            text: text,
            categoryName: taskInfo.categoryName,
            categoryColor: taskInfo.categoryColor,
            dueDate: taskInfo.dueDate,
            isUrgent: taskInfo.isUrgent,
            insights: taskInfo.insights,
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
        }
      );
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
      {popups.categoryPicker && (
        <Animated.View
          style={[
            styles.fullscreenArea,
            { opacity: popupAnimations.categoryPicker },
          ]}
        >
          <CategoryPickerPopup
            close={() => {
              animateClosing(popupAnimations["categoryPicker"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  categoryPicker: false,
                }))
              );
            }}
            setSelectedCategory={setSelectedCategory}
            defaultOption={{ name: "Escolhido por IA", color: "white" }}
          />
        </Animated.View>
      )}
      {popups.datePicker && (
        <Animated.View
          style={[
            styles.fullscreenArea,
            { opacity: popupAnimations.datePicker },
          ]}
        >
          <DatePickerPopup
            close={() => {
              animateClosing(popupAnimations["datePicker"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  datePicker: false,
                }))
              );
            }}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </Animated.View>
      )}
      <View style={styles.taskPopup}>
        <Text style={styles.text}>Visualização da tarefa</Text>
        <TextInput
          style={styles.taskInput}
          multiline={true}
          textAlignVertical="top"
          defaultValue={props.selectedTask.text}
          onChangeText={onChangeText}
          cursorColor={"#efdb00"}
          placeholder="Digite aqui..."
          placeholderTextColor={"#b5b5b5"}
        />
        {props.selectedTask.insights && (
          <View style={styles.taskInsight}>
            <View style={{ flexDirection: "row" }}>
              <MaterialIcons name="insights" size={20} color="white" />
              <Text style={[styles.header, { paddingLeft: 5 }]}>Insights</Text>
            </View>
            <Text style={styles.text}>{props.selectedTask.insights}</Text>
          </View>
        )}
        <ExpandableSelection
          openCategoryPickerPopup={() => {
            setPopups((prevState) => ({
              ...prevState,
              categoryPicker: true,
            }));
            animateOpening(popupAnimations["categoryPicker"]);
          }}
          openDatePickerPopup={() => {
            setPopups((prevState) => ({
              ...prevState,
              datePicker: true,
            }));
            animateOpening(popupAnimations["datePicker"]);
          }}
          selectedCategory={selectedCategory}
          isTaskUrgent={isTaskUrgent}
          setTaskUrgent={setTaskUrgent}
          selectedDate={selectedDate}
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
              <Text style={styles.text}>Voltar</Text>
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
              <Text style={styles.text}>Salvar</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}

export default TaskViewPopup;
