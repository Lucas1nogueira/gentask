import { useContext } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from "../contexts/ThemeContext";

function PickerOption(props) {
  const { styles } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={[
        styles.pickerOption,
        props.selected && styles.selectedPickerOption,
      ]}
      onPress={() => props.action()}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <MaterialCommunityIcons
          name={props.iconName || "checkbox-blank-circle"}
          size={16}
          color={props.iconColor || styles.icon.color}
        />
        <Text
          style={[
            props.selected ? styles.header : styles.text,
            { paddingLeft: 10 },
          ]}
        >
          {props.title}
        </Text>
      </View>
      {props.selected && (
        <MaterialCommunityIcons
          name="check-bold"
          size={24}
          color={styles.icon.color}
        />
      )}
    </TouchableOpacity>
  );
}

export default PickerOption;
