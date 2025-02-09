import { useContext, useEffect, useRef } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AntDesign, MaterialIcons, Octicons } from "@expo/vector-icons";
import { ThemeContext } from "../contexts/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCROLL_INITIAL_POSITION = SCREEN_WIDTH / 6 + 2.5;

function Task(props) {
  const { styles } = useContext(ThemeContext);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef) {
      scrollRef.current?.scrollTo({
        x: SCROLL_INITIAL_POSITION,
        animated: false,
      });
    }
  }, [scrollRef]);

  return (
    <View style={styles.taskControl}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.taskControlScroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="normal"
        contentOffset={{ x: SCROLL_INITIAL_POSITION }}
        onLayout={() => {
          scrollRef.current?.scrollTo({
            x: SCROLL_INITIAL_POSITION,
            animated: false,
          });
        }}
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
        <TouchableOpacity
          style={[
            styles.task,
            { width: props.width },
            props.isUrgent && {
              backgroundColor: styles.urgentTask.backgroundColor,
            },
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
              <View style={{ flexDirection: "row" }}>
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
              {props.dueDate && (
                <View
                  style={{
                    marginRight: 3,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons
                    name="calendar-today"
                    size={16}
                    color={styles.icon.color}
                  />
                  <Text style={styles.dueDateTaskLabelText}>
                    {new Date(props.dueDate).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.text} numberOfLines={3}>
              {props.text}
            </Text>
            <View
              style={[
                styles.category,
                props.isUrgent && styles.urgentTaskCategoryLabel,
              ]}
            >
              <Octicons name="dot-fill" size={22} color={props.categoryColor} />
              <Text
                style={[
                  styles.categoryText,
                  { textAlign: "center", paddingLeft: 5 },
                ]}
              >
                {props.categoryName}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
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
            color="#fff"
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default Task;
