import { useState, useEffect, useContext } from "react";
import {
  Animated,
  BackHandler,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { addTask } from "../services/firebase/firestore";
import { categorizeTask } from "../services/aiService";
import { animateClosing, animateOpening } from "../utils/animationUtils";
import { ThemeContext } from "../contexts/ThemeContext";
import TaskAdvancedOptions from "./TaskAdvancedOptions";
import CategoryPickerPopup from "./CategoryPickerPopup";
import DatePickerPopup from "./DatePickerPopup";

function TaskCreationPopup(props) {
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

  useEffect(() => {
    if (props.taskSuggestion) {
      onChangeText(props.taskSuggestion);
    }
  }, []);

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
        addTask(id, task).catch(() => {
          props.setErrorMessage(
            "Não foi possível salvar a tarefa na nuvem!\nA tarefa foi salva localmente."
          );
          props.openErrorPopup();
        });
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
          backgroundColor: "rgba(0,0,0,0.3)",
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "position"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.taskPopup}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons
              name="post-add"
              size={20}
              color={styles.icon.color}
            />
            <Text style={[styles.header, { paddingLeft: 3 }]}>
              Criar nova tarefa
            </Text>
          </View>
          <TextInput
            style={[styles.taskInput, Platform.OS !== "web" && { height: 300 }]}
            multiline={true}
            textAlignVertical="top"
            value={text}
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
            <TouchableOpacity
              style={[styles.commonButton, styles.cancelButton]}
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
      </KeyboardAvoidingView>
    </View>
  );
}

export default TaskCreationPopup;
