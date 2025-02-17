import React, { useState, useEffect, useContext } from "react";
import {
  Animated,
  Text,
  View,
  TextInput,
  BackHandler,
  TouchableOpacity,
  Platform,
} from "react-native";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { modifyTask } from "../services/firebase/firestore";
import { categorizeTask } from "../services/aiService";
import { animateClosing, animateOpening } from "../utils/animationUtils";
import { ThemeContext } from "../contexts/ThemeContext";
import TaskInsights from "./TaskInsights";
import TaskAdvancedOptions from "./TaskAdvancedOptions";
import CategoryPickerPopup from "./CategoryPickerPopup";
import DatePickerPopup from "./DatePickerPopup";

function TaskViewPopup(props) {
  const { styles } = useContext(ThemeContext);

  const [text, onChangeText] = useState("");

  const [selectedCategory, setSelectedCategory] = useState({
    name: "Escolhido por IA",
    color: "grey",
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
          (typeof text === "string" &&
            text.replace(/\s/g, "").length != 0 &&
            text != props.selectedTask.text) ||
          props.selectedTask.categoryName !== selectedCategory.name ||
          props.selectedTask.isUrgent !== isTaskUrgent ||
          (selectedDate && props.selectedTask.dueDate !== selectedDate)
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

  useEffect(() => {
    onChangeText(props.selectedTask.text);
    setSelectedCategory({
      name: props.selectedTask.categoryName,
      color: props.selectedTask.categoryColor,
    });
    setTaskUrgent(props.selectedTask.isUrgent);
    setSelectedDate(props.selectedTask.dueDate || false);
  }, []);

  function updateTask() {
    if (
      text != props.selectedTask.text ||
      props.selectedTask.categoryName !== selectedCategory.name ||
      props.selectedTask.isUrgent !== isTaskUrgent ||
      (selectedDate && props.selectedTask.dueDate !== selectedDate)
    ) {
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
          modifyTask(taskId, task).catch(() => {
            props.setErrorMessage(
              "Não foi possível atualizar a tarefa na nuvem!\nA tarefa foi modificada localmente."
            );
            props.openErrorPopup();
          });
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
            defaultOption={{ name: "Escolhido por IA", color: "grey" }}
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
          <MaterialIcons name="edit-note" size={20} color={styles.icon.color} />
          <Text style={styles.header}>Visualização da tarefa</Text>
        </View>
        <TextInput
          style={[
            styles.taskInput,
            { height: Platform.OS === "web" ? 180 : 250 },
          ]}
          multiline={true}
          textAlignVertical="top"
          defaultValue={props.selectedTask.text}
          onChangeText={onChangeText}
          cursorColor={"#efdb00"}
          placeholder="Digite aqui..."
          placeholderTextColor={"#b5b5b5"}
        />
        {props.selectedTask.insights && (
          <TaskInsights insights={props.selectedTask.insights} />
        )}
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
          <TouchableOpacity
            style={[styles.commonButton, styles.cancelButton]}
            onPress={() => {
              if (
                (typeof text === "string" &&
                  text.replace(/\s/g, "").length != 0 &&
                  text != props.selectedTask.text) ||
                props.selectedTask.categoryName !== selectedCategory.name ||
                props.selectedTask.isUrgent !== isTaskUrgent ||
                (selectedDate && props.selectedTask.dueDate !== selectedDate)
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
              <AntDesign name="arrowleft" size={20} color="white" />
              <Text style={[styles.text, { color: "white" }]}>Voltar</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.commonButton, styles.confirmButton]}
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
              <Ionicons name="save-outline" size={20} color="white" />
              <Text style={[styles.text, { color: "white" }]}>Salvar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default TaskViewPopup;
