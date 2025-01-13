import { useRef } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { AntDesign, Octicons } from "@expo/vector-icons";
import styles from "../styles/styles";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCROLL_INITIAL_POSITION = SCREEN_WIDTH / 7 + 2.4;

function Task(props) {
  const scrollRef = useRef(null);

  return (
    <View style={styles.taskContainer}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "white",
          borderRadius: 15,
          overflow: "hidden",
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="normal"
        contentOffset={{ x: SCROLL_INITIAL_POSITION, y: 0 }}
        onScrollEndDrag={(event) => {
          const offsetX = event.nativeEvent.contentOffset.x;

          if (offsetX <= 35) {
            scrollRef.current?.scrollTo({ x: 0, animated: true });
          } else if (offsetX > 35 && offsetX < 105) {
            scrollRef.current?.scrollTo({
              x: SCROLL_INITIAL_POSITION,
              animated: true,
            });
          } else if (offsetX >= 105) {
            scrollRef.current?.scrollToEnd({ animated: true });
          }
        }}
      >
        <TouchableOpacity
          style={styles.deleteTaskButton}
          onPress={() => {
            props.delete();
          }}
        >
          <AntDesign name="delete" size={24} color="white" />
        </TouchableOpacity>
        <TouchableHighlight
          style={[
            styles.task,
            props.isUrgent && { backgroundColor: "#4c0800" },
          ]}
          onPress={() => props.action()}
        >
          <View
            style={{
              width: "100%",
              height: "100%",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <View style={styles.taskLabels}>
              {!props.isCompleted ? (
                <View style={styles.pendingTaskLabel}>
                  <Text style={styles.pendingTaskLabelText}>PENDENTE</Text>
                </View>
              ) : (
                <View style={styles.completedTaskLabel}>
                  <Text style={styles.completedTaskLabelText}>CONCLUÍDO</Text>
                </View>
              )}
              {props.isUrgent && (
                <View style={styles.urgentTaskLabel}>
                  <Text style={styles.urgentTaskLabelText}>URGENTE</Text>
                </View>
              )}
            </View>
            <Text style={styles.text} numberOfLines={3}>
              {props.text}
            </Text>
            <View
              style={[
                styles.category,
                props.isUrgent && { backgroundColor: "#300500" },
              ]}
            >
              <Octicons name="dot-fill" size={22} color={props.color} />
              <Text
                style={[
                  styles.categoryText,
                  { textAlign: "center", paddingLeft: 5 },
                ]}
              >
                {props.category}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
        <TouchableOpacity
          style={
            !props.isCompleted
              ? styles.markTaskAsCompletedButton
              : styles.markTaskAsPendingButton
          }
          onPress={() => {
            props.checkCompleted();
            scrollRef.current?.scrollTo({
              x: SCROLL_INITIAL_POSITION,
              animated: true,
            });
          }}
        >
          <AntDesign
            name={!props.isCompleted ? "check" : "clockcircleo"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default Task;
