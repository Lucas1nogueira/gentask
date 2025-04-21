import { Entypo, MaterialIcons } from "@expo/vector-icons/";
import { useContext, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import { animateCollapsing, animateExpanding } from "../utils/animationUtils";

function TaskInsights(props) {
  const { styles } = useContext(ThemeContext);

  const expandAnimation = useRef(new Animated.Value(1)).current;

  const [showInsights, setShowInsights] = useState(true);

  const heightInterpolate = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [25, 115],
  });

  return (
    <View style={[styles.expandableSelection]}>
      <Animated.View style={{ overflow: "hidden", height: heightInterpolate }}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          onPress={() => {
            if (!showInsights) {
              animateExpanding(expandAnimation);
              setShowInsights(true);
            } else {
              animateCollapsing(expandAnimation);
              setShowInsights(false);
            }
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <MaterialIcons
              name="insights"
              size={20}
              color={styles.icon.color}
            />
            <Text style={[styles.header, { paddingLeft: 5 }]}>Insights</Text>
          </View>
          <Entypo name="select-arrows" size={20} color={styles.icon.color} />
        </TouchableOpacity>
        <ScrollView style={styles.taskInsight}>
          <Text style={styles.text}>{props.insights}</Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

export default TaskInsights;
