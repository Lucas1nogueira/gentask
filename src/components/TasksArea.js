import { useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
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
            <TouchableHighlight
              key={item.key}
              style={styles.listItem}
              onPress={() => props.taskViewPopup(index)}
            >
              <View style={styles.listRow}>
                <View
                  style={{
                    width: "83%",
                    flexDirection: "column",
                  }}
                >
                  <Text style={styles.text} numberOfLines={3}>
                    {item.text}
                  </Text>
                  <View
                    style={{
                      height: 25,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#333",
                    }}
                  >
                    <Text style={[styles.text, { textAlign: "center" }]}>
                      {item.category}
                    </Text>
                  </View>
                </View>
                <TouchableHighlight
                  style={styles.deleteButton}
                  onPress={() => props.delete(index)}
                >
                  <AntDesign name="delete" size={24} color="white" />
                </TouchableHighlight>
              </View>
            </TouchableHighlight>
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
