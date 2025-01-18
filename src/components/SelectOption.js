import { Text, TouchableOpacity } from "react-native";
import { Octicons } from "@expo/vector-icons";
import styles from "../styles/styles";

function SelectOption(props) {
  return (
    <TouchableOpacity
      style={styles.selectOption}
      onPress={() => props.action()}
    >
      <Octicons name="dot-fill" size={22} color={props.categoryColor} />
      <Text style={[styles.text, { paddingLeft: 10 }]}>
        {props.categoryName}
      </Text>
    </TouchableOpacity>
  );
}

export default SelectOption;
