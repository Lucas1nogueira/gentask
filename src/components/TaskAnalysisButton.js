import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import {
  animateClosingDown,
  animateOpeningUp,
  animateRotation,
} from "../utils/animationUtils";
import styles from "../styles/styles";

function TaskAnalysisButton(props) {
  const rotation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const topAnimation = useRef(new Animated.Value(0)).current;

  const [isTaskAnalysisMenuOpen, setTaskAnalysisMenuOpen] = useState(false);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const opacity = opacityAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const top = topAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, -145],
  });

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isTaskAnalysisMenuOpen) {
          animateClosingDown(opacityAnimation, topAnimation, () =>
            setTaskAnalysisMenuOpen(false)
          );
          return true;
        }
      }
    );
    return () => backHandler.remove();
  }, [isTaskAnalysisMenuOpen]);

  useEffect(() => {
    animateRotation(rotation);
  }, [rotation]);

  return (
    <View style={{ flexDirection: "row" }}>
      {isTaskAnalysisMenuOpen && (
        <Animated.View
          style={[
            styles.taskAnalysisFloatingMenu,
            { opacity: opacity, top: top },
          ]}
        >
          <View style={styles.taskAnalysisFloatingMenuBox}>
            <TouchableHighlight onPress={() => props.openWeeklyTaskAnalysis()}>
              <View style={styles.taskAnalysisMenuOption}>
                <MaterialIcons name="view-week" size={20} color="white" />
                <Text style={[styles.text, { paddingLeft: 3 }]}>
                  Ajuda para a semana
                </Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={() => props.openMonthlyTaskAnalysis()}>
              <View style={styles.taskAnalysisMenuOption}>
                <MaterialIcons name="calendar-month" size={20} color="white" />
                <Text style={[styles.text, { paddingLeft: 3 }]}>
                  Ajuda para o mês
                </Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={styles.taskAnalysisFloatingMenuBottomTriangle} />
        </Animated.View>
      )}
      <TouchableOpacity
        style={[
          styles.taskAnalysisButton,
          { opacity: props.isActive ? 1 : 0.5 },
        ]}
        onPress={() => {
          if (props.isActive) {
            if (!isTaskAnalysisMenuOpen) {
              setTaskAnalysisMenuOpen(true);
              animateOpeningUp(opacityAnimation, topAnimation);
            } else {
              animateClosingDown(opacityAnimation, topAnimation, () =>
                setTaskAnalysisMenuOpen(false)
              );
            }
          }
        }}
      >
        <Animated.View
          style={{ position: "absolute", transform: [{ rotate: spin }] }}
        >
          <LinearGradient
            colors={["#2a7eaa", "#2aaa6c"]}
            style={{ width: 60, height: 60 }}
          />
        </Animated.View>
        <MaterialCommunityIcons
          name="robot-happy-outline"
          size={25}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}

export default TaskAnalysisButton;
