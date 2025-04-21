import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
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
import TrashedTask from "./TrashedTask";

function TrashedTaskContainer(props) {
  const { styles } = useContext(ThemeContext);

  const [showTrashedTasks, setShowTrashedTasks] = useState(false);
  const [trashedTasks, setTrashedTasks] = useState([]);
  const [taskWidth, setTaskWidth] = useState(null);

  useEffect(() => {
    if (props.foundTrashedTasks) {
      const tasksArray = Object.entries(props.foundTrashedTasks).map(
        ([id, task]) => ({
          id,
          ...task,
        })
      );
      setTrashedTasks(tasksArray);
    }
  }, [props.foundTrashedTasks]);

  useEffect(() => {
    if (props.didTrashedTasksLoad && taskWidth) {
      setTimeout(() => {
        setShowTrashedTasks(true);
      }, 500);
    }
  }, [props.didTrashedTasksLoad, taskWidth]);

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
          {!showTrashedTasks ? (
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
          ) : props.foundTrashedTasks &&
            Object.keys(props.foundTrashedTasks).length !== 0 ? (
            <FlatList
              data={trashedTasks}
              renderItem={({ item }) => (
                <TrashedTask
                  key={item.id}
                  width={taskWidth}
                  text={item.text}
                  categoryName={item.categoryName}
                  categoryColor={item.categoryColor}
                  dueDate={item.dueDate}
                  isUrgent={item.isUrgent}
                  isCompleted={item.isCompleted}
                  delete={() => props.delete(item.id)}
                  restore={() => props.restore(item.id)}
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
              <Octicons name="trash" size={22} color={styles.text.color} />
              <Text style={[styles.text, { paddingLeft: 5 }]}>
                {props.emptyMessage}
              </Text>
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
          <TouchableOpacity
            style={[
              styles.emptyTrashButton,
              !props.foundTrashedTasks ||
              !showTrashedTasks ||
              trashedTasks.length === 0
                ? {
                    opacity: 0.5,
                  }
                : { opacity: 1 },
            ]}
            onPress={() => props.openTrashedTaskClearPopup()}
            disabled={
              !props.foundTrashedTasks ||
              !showTrashedTasks ||
              trashedTasks.length === 0
            }
          >
            <MaterialCommunityIcons name="trash-can" size={22} color="white" />
            <Text style={[styles.header, { color: "white", paddingLeft: 2 }]}>
              Esvaziar lixeira
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default TrashedTaskContainer;
