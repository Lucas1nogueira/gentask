import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Octicons } from "@expo/vector-icons";
import styles from "../styles/styles";

function FilteringBar(props) {
  const [tasksFilteredByCategory, setTasksFilteredByCategory] = useState(null);
  const [tasksSortedByTime, setTasksSortedByTime] = useState(null);
  const [tasksSortedByCompletion, setTasksSortedByCompletion] = useState(null);
  const [tasksSortedByUrgency, setTasksSortedByUrgency] = useState(null);

  useEffect(() => {
    if (props.tasks) {
      if (props.selectedCategory.name == "Tudo") {
        setTasksFilteredByCategory(props.tasks);
      } else {
        const filteredTasks = Object.entries(props.tasks)
          .filter(
            ([taskId, task]) => task.category === props.selectedCategory.name
          )
          .reduce((accumulator, [taskId, task]) => {
            accumulator[taskId] = task;
            return accumulator;
          }, {});
        setTasksFilteredByCategory(filteredTasks);
      }
    }
  }, [props.tasks, props.selectedCategory]);

  useEffect(() => {
    if (tasksFilteredByCategory) {
      if (props.selectedSort == "created_asc") {
        setTasksSortedByTime(tasksFilteredByCategory);
      } else if (props.selectedSort == "created_desc") {
        const sortedTasks = Object.entries(tasksFilteredByCategory)
          .sort(([, taskA], [, taskB]) => {
            return new Date(taskB.createdAt) - new Date(taskA.createdAt);
          })
          .reduce((accumulator, [taskId, task]) => {
            accumulator[taskId] = task;
            return accumulator;
          }, {});
        setTasksSortedByTime(sortedTasks);
      } else if (props.selectedSort == "updated_asc") {
        const sortedTasks = Object.entries(tasksFilteredByCategory)
          .sort(([, taskA], [, taskB]) => {
            return new Date(taskA.updatedAt) - new Date(taskB.updatedAt);
          })
          .reduce((accumulator, [taskId, task]) => {
            accumulator[taskId] = task;
            return accumulator;
          }, {});
        setTasksSortedByTime(sortedTasks);
      } else if (props.selectedSort == "updated_desc") {
        const sortedTasks = Object.entries(tasksFilteredByCategory)
          .sort(([, taskA], [, taskB]) => {
            return new Date(taskB.updatedAt) - new Date(taskA.updatedAt);
          })
          .reduce((accumulator, [taskId, task]) => {
            accumulator[taskId] = task;
            return accumulator;
          }, {});
        setTasksSortedByTime(sortedTasks);
      }
    }
  }, [tasksFilteredByCategory, props.selectedSort]);

  useEffect(() => {
    if (tasksSortedByTime) {
      if (props.completedTasksFirst === false) {
        setTasksSortedByCompletion(tasksSortedByTime);
      } else if (props.completedTasksFirst === true) {
        const sortedTasks = Object.entries(tasksSortedByTime)
          .sort(([, taskA], [, taskB]) => {
            if (taskA.isCompleted && !taskB.isCompleted) return -1;
            if (!taskA.isCompleted && taskB.isCompleted) return 1;
            return 0;
          })
          .reduce((accumulator, [taskId, task]) => {
            accumulator[taskId] = task;
            return accumulator;
          }, {});
        setTasksSortedByCompletion(sortedTasks);
      }
    }
  }, [tasksSortedByTime, props.completedTasksFirst]);

  useEffect(() => {
    if (tasksSortedByCompletion) {
      if (props.urgentTasksFirst === false) {
        setTasksSortedByUrgency(tasksSortedByCompletion);
      } else if (props.urgentTasksFirst === true) {
        const sortedTasks = Object.entries(tasksSortedByCompletion)
          .sort(([, taskA], [, taskB]) => {
            if (taskA.isUrgent && !taskB.isUrgent) return -1;
            if (!taskA.isUrgent && taskB.isUrgent) return 1;
            return 0;
          })
          .reduce((accumulator, [taskId, task]) => {
            accumulator[taskId] = task;
            return accumulator;
          }, {});
        setTasksSortedByUrgency(sortedTasks);
      }
    }
  }, [tasksSortedByCompletion, props.urgentTasksFirst]);

  useEffect(() => {
    if (tasksSortedByUrgency) {
      props.setSortedTasks(tasksSortedByUrgency);
    }
  }, [tasksSortedByUrgency]);

  return (
    <View style={styles.filteringBar}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={[styles.text, { paddingRight: 10 }]}>Categoria:</Text>
        <TouchableOpacity
          style={styles.categorySelectionButton}
          onPress={() => props.openCategoryPickerPopup()}
        >
          <Octicons
            name="dot-fill"
            size={22}
            color={props.selectedCategory.color}
          />
          <Text style={[styles.text, { paddingLeft: 5 }]}>
            {props.selectedCategory.name}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => props.openSortPickerPopup()}>
        <Octicons name="sort-desc" size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
}

export default FilteringBar;
