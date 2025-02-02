import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { animateRotation } from "../utils/animationUtils";
import Task from "./Task";
import styles from "../styles/styles";

function TasksContainer(props) {
  const rotation = useRef(new Animated.Value(0)).current;

  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isMagicAIPressed, setMagicAIPressed] = useState(false);
  const [isAddTaskPressed, setAddTaskPressed] = useState(false);
  const [taskWidth, setTaskWidth] = useState(null);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    if (props.foundTasks) {
      const tasksArray = Object.entries(props.foundTasks).map(([id, task]) => ({
        id,
        ...task,
      }));
      setTasks(tasksArray);
    }
  }, [props.foundTasks]);

  useEffect(() => {
    if (props.didTasksLoad && taskWidth) {
      setTimeout(() => {
        setShowTasks(true);
      }, 500);
    }
  }, [props.didTasksLoad, taskWidth]);

  useEffect(() => {
    animateRotation(rotation);
  }, [rotation]);

  const handleTaskListLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTaskWidth(width);
  };

  return (
    <View style={styles.tasksContainer}>
      <View
        style={{
          width: "100%",
          maxHeight: "89.5%",
          borderRadius: 15,
          overflow: "hidden",
        }}
        onLayout={handleTaskListLayout}
      >
        {!showTasks ? (
          <View
            style={{
              width: "100%",
              height: "100%",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator
              size="small"
              color={styles.activityIndicator.color}
            />
            <Text style={[styles.text, { paddingLeft: 5 }]}>
              Carregando tarefas...
            </Text>
          </View>
        ) : props.foundTasks && Object.keys(props.foundTasks).length !== 0 ? (
          <FlatList
            data={tasks}
            renderItem={({ item }) => (
              <Task
                key={item.id}
                width={taskWidth}
                action={() => props.taskViewPopup(item.id)}
                text={item.text}
                categoryName={item.categoryName}
                categoryColor={item.categoryColor}
                dueDate={item.dueDate}
                isUrgent={item.isUrgent}
                isCompleted={item.isCompleted}
                delete={() => props.delete(item.id)}
                checkCompleted={() => {
                  props.checkCompleted(item.id);
                }}
              />
            )}
          />
        ) : (
          <Text style={styles.text}>{props.emptyMessage}</Text>
        )}
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          style={[
            styles.magicAIButton,
            isMagicAIPressed ? { opacity: 0.5 } : { opacity: 1 },
          ]}
          onPress={() => null}
          onPressIn={() => setMagicAIPressed(true)}
          onPressOut={() => setMagicAIPressed(false)}
        >
          <Animated.View
            style={{ position: "absolute", transform: [{ rotate: spin }] }}
          >
            <LinearGradient
              colors={["#2a7eaa", "#2aaa6c"]}
              style={{ width: 60, height: 60 }}
            />
          </Animated.View>
          <MaterialCommunityIcons
            name="robot-happy-outline"
            size={25}
            color="white"
          />
        </Pressable>
        <Pressable
          style={[
            styles.addTaskButton,
            isAddTaskPressed ? { opacity: 0.5 } : { opacity: 1 },
          ]}
          onPress={() => props.openCreatePopup()}
          onPressIn={() => setAddTaskPressed(true)}
          onPressOut={() => setAddTaskPressed(false)}
        >
          <Text style={styles.text}>Nova tarefa</Text>
          <Ionicons name="add" size={40} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

export default TasksContainer;
