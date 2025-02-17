import { useContext } from "react";
import { Text, Animated, View, TouchableOpacity } from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from "../contexts/ThemeContext";

function TaskSuggestionPopup(props) {
  const { styles } = useContext(ThemeContext);

  return (
    <Animated.View
      style={[
        styles.taskSuggestionPopup,
        {
          opacity: props.opacityAnimation,
          transform: [
            {
              translateX: props.rightAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View
        style={{
          marginTop: 10,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name="robot-happy-outline"
          size={18}
          color={styles.icon.color}
        />
        <Text
          style={[
            styles.text,
            props.color && { color: "white" },
            { paddingLeft: 5 },
          ]}
        >
          Sugestão de tarefa
        </Text>
      </View>
      <View style={styles.taskSuggestionOutput}>
        <Text style={styles.text}>{props.suggestion}</Text>
      </View>
      <View style={styles.taskSuggestionButtonRow}>
        <TouchableOpacity
          style={styles.taskSuggestionRejectButton}
          onPress={() => props.close()}
        >
          <AntDesign name="close" size={16} color="white" />
          <Text
            style={[
              styles.text,
              { fontSize: 12, color: "white", paddingLeft: 3 },
            ]}
          >
            Rejeitar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.taskSuggestionAcceptButton}
          onPress={() => props.action()}
        >
          <AntDesign name="check" size={16} color="white" />
          <Text
            style={[
              styles.text,
              { fontSize: 12, color: "white", paddingLeft: 3 },
            ]}
          >
            Aceitar
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default TaskSuggestionPopup;
