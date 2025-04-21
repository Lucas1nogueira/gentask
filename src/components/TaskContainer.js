import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import Task from "./Task";
import TaskAnalysisButton from "./TaskAnalysisButton";

function TaskContainer(props) {
  const { styles } = useContext(ThemeContext);

  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskWidth, setTaskWidth] = useState(null);
  const [currentTime] = useState(new Date(Date.now()).setHours(0, 0, 0, 0));

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
            height: Platform.OS === "web" ? "86%" : "89.5%",
            maxHeight: Platform.OS === "web" ? "86%" : "89.5%",
            borderRadius: 15,
            overflow: "hidden",
          }}
          onLayout={handleTaskListLayout}
        >
          {!showTasks ? (
            <View
              style={{
                minWidth: "100%",
                minHeight: "100%",
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
                  currentTime={currentTime}
                />
              )}
            />
          ) : (
            <View
              style={{
                minWidth: "100%",
                minHeight: "100%",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={styles.text}>{props.emptyMessage}</Text>
            </View>
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
          {Platform.OS === "web" ? (
            props.isTaskAnalysisButtonActive && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={() => props.openChatbot()}>
                  <View style={styles.webTaskAnalysisButton}>
                    <MaterialIcons
                      name="message"
                      size={20}
                      color={styles.icon.color}
                    />
                    <Text style={[styles.text, { paddingLeft: 3 }]}>
                      Chatbot
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => props.openProfileAnalysis()}>
                  <View style={styles.webTaskAnalysisButton}>
                    <MaterialCommunityIcons
                      name="account-question-outline"
                      size={20}
                      color={styles.icon.color}
                    />
                    <Text style={[styles.text, { paddingLeft: 3 }]}>
                      Análise de perfil
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => props.openWeeklyTaskAnalysis()}
                >
                  <View style={styles.webTaskAnalysisButton}>
                    <MaterialIcons
                      name="view-week"
                      size={20}
                      color={styles.icon.color}
                    />
                    <Text style={[styles.text, { paddingLeft: 3 }]}>
                      Ajuda para a semana
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => props.openMonthlyTaskAnalysis()}
                >
                  <View style={styles.webTaskAnalysisButton}>
                    <MaterialIcons
                      name="calendar-month"
                      size={20}
                      color={styles.icon.color}
                    />
                    <Text style={[styles.text, { paddingLeft: 3 }]}>
                      Ajuda para o mês
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <TaskAnalysisButton
              isActive={props.isTaskAnalysisButtonActive}
              openChatbot={() => props.openChatbot()}
              openProfileAnalysis={() => props.openProfileAnalysis()}
              openWeeklyTaskAnalysis={() => props.openWeeklyTaskAnalysis()}
              openMonthlyTaskAnalysis={() => props.openMonthlyTaskAnalysis()}
            />
          )}
          <TouchableOpacity
            style={{ marginLeft: 17, opacity: !showTasks && 0.5 }}
            onPress={() => props.openCreatePopup()}
            disabled={!showTasks}
          >
            <LinearGradient
              colors={styles.taskAnalysisButtonGradient.colors}
              style={styles.addTaskButton}
            >
              <Text style={styles.text}>Nova tarefa</Text>
              <MaterialIcons name="add" size={35} color={styles.icon.color} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default TaskContainer;
