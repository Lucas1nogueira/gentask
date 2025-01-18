import { useEffect, useRef, useState } from "react";
import { Animated, FlatList, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { animateRotation } from "../utils/animationUtils";
import Task from "./Task";
import styles from "../styles/styles";

function TasksArea(props) {
  const rotation = useRef(new Animated.Value(0)).current;

  const [sortedTasks, setSortedTasks] = useState([]);
  const [isMagicAIPressed, setMagicAIPressed] = useState(false);
  const [isAddTaskPressed, setAddTaskPressed] = useState(false);
  const [taskWidth, setTaskWidth] = useState(0);

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
      const sorted = tasksArray.sort((a, b) => b.isUrgent - a.isUrgent);
      setSortedTasks(sorted);
    }
  }, [props.foundTasks]);

  useEffect(() => {
    animateRotation(rotation);
  }, [rotation]);

  const handleTaskListLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTaskWidth(width);
  };

  return (
    <View style={styles.tasksArea}>
      {props.foundTasks && Object.keys(props.foundTasks).length !== 0 ? (
        <FlatList
          style={{ width: "100%", maxHeight: 805 }}
          data={sortedTasks}
          onLayout={handleTaskListLayout}
          renderItem={({ item }) => (
            <Task
              key={item.id}
              width={taskWidth}
              action={() => props.taskViewPopup(item.id)}
              text={item.text}
              category={item.category}
              color={item.color}
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
            size={30}
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
          <Text style={styles.text}>New task</Text>
          <Ionicons name="add" size={40} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

export default TasksArea;
