import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Task from "./Task";
import styles from "../styles/styles";

function TasksArea(props) {
  const [isAddTaskPressed, setAddTaskPressed] = useState(false);

  return (
    <View style={styles.tasksArea}>
      {props.tasks && JSON.stringify(props.tasks) != "[]" ? (
        <FlatList
          style={{ maxHeight: 805 }}
          data={props.tasks}
          renderItem={({ item, index }) => (
            <Task
              key={item.key}
              action={() => props.taskViewPopup(index)}
              text={item.text}
              category={item.category}
              color={item.color}
              delete={() => props.delete(index)}
            />
          )}
        />
      ) : (
        <Text style={styles.text}>No tasks yet!</Text>
      )}
      <Pressable
        style={[
          styles.addTask,
          isAddTaskPressed ? { opacity: 0.5 } : { opacity: 1 },
        ]}
        onPress={props.openCreatePopup}
        onPressIn={() => setAddTaskPressed(true)}
        onPressOut={() => setAddTaskPressed(false)}
      >
        <Text style={styles.text}>New task</Text>
        <Ionicons name="add" size={40} color="white" />
      </Pressable>
    </View>
  );
}

export default TasksArea;
