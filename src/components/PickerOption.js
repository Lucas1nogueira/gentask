import { Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../styles/styles";

function PickerOption(props) {
  return (
    <TouchableOpacity
      style={[
        styles.pickerOption,
        props.selected && { backgroundColor: "#274c4b" },
      ]}
      onPress={() => props.action()}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <MaterialCommunityIcons
          name={props.iconName || "checkbox-blank-circle"}
          size={16}
          color={props.iconColor || "white"}
        />
        <Text style={[styles.text, { paddingLeft: 10 }]}>{props.title}</Text>
      </View>
      {props.selected && (
        <MaterialCommunityIcons name="check-bold" size={24} color="white" />
      )}
    </TouchableOpacity>
  );
}

export default PickerOption;
