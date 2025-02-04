import React, { useState, useEffect } from "react";
import {
  Animated,
  BackHandler,
  Text,
  View,
  TextInput,
  TouchableHighlight,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { categorizeTask } from "../services/geminiService";
import { animateClosing, animateOpening } from "../utils/animationUtils";
import TaskAdvancedOptions from "./TaskAdvancedOptions";
import CategoryPickerPopup from "./CategoryPickerPopup";
import DatePickerPopup from "./DatePickerPopup";
import styles from "../styles/styles";

function CreateTaskPopup(props) {
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
        if (
          (typeof text === "string" && text.replace(/\s/g, "").length != 0) ||
          selectedCategory.name !== "Escolhido por IA" ||
          isTaskUrgent !== null ||
          selectedDate
        ) {
          props.openDiscardPopup();
        } else {
          props.close();
        }
        return true;
      }
    );
    return () => backHandler.remove();
  }, [text, selectedCategory, isTaskUrgent, selectedDate]);

  function saveTask() {
    props.openLoadingPopup();
    const taskCategory =
      selectedCategory.name === "Escolhido por IA"
        ? null
        : selectedCategory.name;
    categorizeTask(text, taskCategory, isTaskUrgent, selectedDate).then(
      (taskInfo) => {
        const id = uuidv4();
        const time = Date.now();
        const task = {
          text: text,
          categoryName: taskInfo.categoryName,
          categoryColor: taskInfo.categoryColor,
          dueDate: taskInfo.dueDate,
          isUrgent: taskInfo.isUrgent,
          insights: taskInfo.insights,
          isCompleted: false,
          createdAt: time,
          updatedAt: time,
        };
        props.setTasks((prev) => ({
          ...prev,
          [id]: task,
        }));
        props.closeLoadingPopup();
        setTimeout(() => {
          props.openSuccessPopup();
        }, 500);
      }
    );
    props.close();
  }

  function checkText() {
    if (typeof text === "string" && text.trim().length != 0) {
      saveTask();
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialIcons name="post-add" size={20} color="white" />
          <Text style={[styles.header, { paddingLeft: 3 }]}>
            Criar nova tarefa
          </Text>
        </View>
        <TextInput
          style={styles.taskInput}
          multiline={true}
          textAlignVertical="top"
          onChangeText={onChangeText}
          cursorColor={"#efdb00"}
          placeholder="Digite aqui..."
          placeholderTextColor={"#b5b5b5"}
        />
        <TaskAdvancedOptions
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
              if (
                (typeof text === "string" &&
                  text.replace(/\s/g, "").length != 0) ||
                selectedCategory.name !== "Escolhido por IA" ||
                isTaskUrgent !== null ||
                selectedDate
              ) {
                props.openDiscardPopup();
              } else {
                props.close();
              }
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

export default CreateTaskPopup;
