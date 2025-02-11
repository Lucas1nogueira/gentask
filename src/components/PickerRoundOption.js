import { useContext } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from "../contexts/ThemeContext";

function PickerRoundOption(props) {
  const { styles } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={[
        styles.pickerRoundOption,
        props.selected && styles.selectedPickerRoundOption,
      ]}
      onPress={() => props.action()}
    >
      <View
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name={props.iconName}
          size={32}
          color={styles.icon.color}
        />
        <Text
          style={[
            { fontSize: 12, textAlign: "center" },
            props.selected ? styles.header : styles.text,
          ]}
        >
          {props.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default PickerRoundOption;
