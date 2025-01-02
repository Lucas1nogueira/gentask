import { Text, TouchableHighlight, View } from "react-native";
import { AntDesign, Octicons } from "@expo/vector-icons";
import styles from "../styles/styles";

function Task(props) {
  return (
    <TouchableHighlight
      key={props.key}
      style={styles.task}
      onPress={() => props.action()}
    >
      <View style={styles.listRow}>
        <View
          style={{
            width: "83%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.text} numberOfLines={3}>
            {props.text}
          </Text>
          <View
            style={{
              height: 30,
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 10,
              backgroundColor: "#333",
              paddingHorizontal: 7,
            }}
          >
            <Octicons name="dot-fill" size={22} color={props.color} />
            <Text
              style={[styles.category, { textAlign: "center", paddingLeft: 5 }]}
            >
              {props.category}
            </Text>
          </View>
        </View>
        <TouchableHighlight
          style={styles.deleteButton}
          onPress={() => props.delete()}
        >
          <AntDesign name="delete" size={24} color="white" />
        </TouchableHighlight>
      </View>
    </TouchableHighlight>
  );
}

export default Task;
