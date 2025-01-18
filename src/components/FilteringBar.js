import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Octicons } from "@expo/vector-icons";
import styles from "../styles/styles";

function FilteringBar(props) {
  useEffect(() => {
    if (props.tasks) {
      if (props.selectedCategory.name == "Tudo") {
        props.setFilteredTasks(props.tasks);
      } else {
        const filteredTasks = Object.entries(props.tasks)
          .filter(
            ([taskId, task]) => task.category === props.selectedCategory.name
          )
          .reduce((accumulator, [taskId, task]) => {
            accumulator[taskId] = task;
            return accumulator;
          }, {});
        props.setFilteredTasks(filteredTasks);
      }
    }
  }, [props.tasks, props.selectedCategory]);

  return (
    <View style={styles.filteringBar}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={[styles.text, { paddingRight: 10 }]}>Categoria:</Text>
        <TouchableOpacity
          style={styles.categorySelectionButton}
          onPress={() => props.openSelectPopup()}
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
      <View style={{ flexDirection: "row" }}>
        <Octicons name="filter" size={22} color="white" />
      </View>
    </View>
  );
}

export default FilteringBar;
