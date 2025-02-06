import { useContext } from "react";
import { Text, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { ThemeContext } from "../contexts/ThemeContext";

function MenuOption(props) {
  const { styles } = useContext(ThemeContext);

  return (
    <TouchableOpacity style={styles.menuOption} onPress={() => props.action()}>
      <Feather name={props.iconName} size={24} color={styles.icon.color} />
      <Text style={[styles.text, { paddingLeft: 5 }]}>{props.text}</Text>
    </TouchableOpacity>
  );
}

export default MenuOption;
