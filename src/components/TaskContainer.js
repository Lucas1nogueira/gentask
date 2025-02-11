import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Task from "./Task";
import { ThemeContext } from "../contexts/ThemeContext";
import TaskAnalysisButton from "./TaskAnalysisButton";

function TaskContainer(props) {
  const { styles } = useContext(ThemeContext);

  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isAddTaskPressed, setAddTaskPressed] = useState(false);
  const [taskWidth, setTaskWidth] = useState(null);

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

  const handleTaskListLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setTaskWidth(width);
  };

  return (
    <View style={{ paddingHorizontal: 15 }}>
      <View style={styles.taskContainer}>
        <View
          style={{
            width: "100%",
            maxHeight: Platform.OS === "web" ? "86%" : "89.5%",
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
            marginTop: 10,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <TaskAnalysisButton
            isActive={props.isTaskAnalysisButtonActive}
            openWeeklyTaskAnalysis={() => props.openWeeklyTaskAnalysis()}
            openMonthlyTaskAnalysis={() => props.openMonthlyTaskAnalysis()}
          />
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
            <MaterialIcons name="add" size={35} color={styles.icon.color} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default TaskContainer;
