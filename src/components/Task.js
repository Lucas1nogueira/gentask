import { useRef } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { AntDesign, Octicons } from "@expo/vector-icons";
import styles from "../styles/styles";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCROLL_INITIAL_POSITION = SCREEN_WIDTH / 7 + 2.4;

function Task(props) {
  const scrollRef = useRef(null);

  return (
    <View
      style={{
        marginVertical: 10,
        width: "100%",
        height: 100,
        borderRadius: 15,
        overflow: "hidden",
      }}
    >
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
        <TouchableHighlight
          style={styles.deleteButton}
          onPress={() => {
            props.delete();
          }}
        >
          <AntDesign name="delete" size={24} color="white" />
        </TouchableHighlight>
        <TouchableHighlight style={styles.task} onPress={() => props.action()}>
          <View
            style={{
              width: "100%",
              height: "100%",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.text} numberOfLines={3}>
              {props.completed && "\u2714 "}
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
                style={[
                  styles.category,
                  { textAlign: "center", paddingLeft: 5 },
                ]}
              >
                {props.category}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.completedButton}
          onPress={() => {
            props.checkCompleted();
            scrollRef.current?.scrollTo({
              x: SCROLL_INITIAL_POSITION,
              animated: true,
            });
          }}
        >
          <AntDesign name="check" size={24} color="white" />
        </TouchableHighlight>
      </ScrollView>
    </View>
  );
}

export default Task;
