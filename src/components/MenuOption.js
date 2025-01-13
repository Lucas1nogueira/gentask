import { Text, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import styles from "../styles/styles";

function MenuOption(props) {
  return (
    <TouchableOpacity style={styles.menuOption} onPress={() => props.action()}>
      <Feather name={props.iconName} size={24} color="white" />
      <Text style={[styles.text, { paddingLeft: 5 }]}>{props.text}</Text>
    </TouchableOpacity>
  );
}

export default MenuOption;
