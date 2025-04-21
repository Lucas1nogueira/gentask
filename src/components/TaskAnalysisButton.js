import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import {
  animateClosingDown,
  animateOpeningUp,
  animateRotation,
} from "../utils/animationUtils";

function TaskAnalysisButton(props) {
  const { styles } = useContext(ThemeContext);

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
    outputRange: [-220, -280],
  });

  function close() {
    animateClosingDown(opacityAnimation, topAnimation, () =>
      setTaskAnalysisMenuOpen(false)
    );
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isTaskAnalysisMenuOpen) {
          close();
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
            <TouchableOpacity
              onPress={() => {
                props.openChatbot();
                close();
              }}
            >
              <View style={styles.taskAnalysisMenuOption}>
                <MaterialIcons
                  name="message"
                  size={20}
                  color={styles.icon.color}
                />
                <Text style={[styles.text, { paddingLeft: 3 }]}>
                  Abrir chatbot
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                props.openProfileAnalysis();
                close();
              }}
            >
              <View style={styles.taskAnalysisMenuOption}>
                <MaterialCommunityIcons
                  name="account-question-outline"
                  size={20}
                  color={styles.icon.color}
                />
                <Text style={[styles.text, { paddingLeft: 3 }]}>
                  Análise de perfil
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                props.openWeeklyTaskAnalysis();
                close();
              }}
            >
              <View style={styles.taskAnalysisMenuOption}>
                <MaterialIcons
                  name="view-week"
                  size={20}
                  color={styles.icon.color}
                />
                <Text style={[styles.text, { paddingLeft: 3 }]}>
                  Ajuda para a semana
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                props.openMonthlyTaskAnalysis();
                close();
              }}
            >
              <View style={styles.taskAnalysisMenuOption}>
                <MaterialIcons
                  name="calendar-month"
                  size={20}
                  color={styles.icon.color}
                />
                <Text style={[styles.text, { paddingLeft: 3 }]}>
                  Ajuda para o mês
                </Text>
              </View>
            </TouchableOpacity>
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
            colors={styles.taskAnalysisButtonGradient.colors}
            style={{ width: 60, height: 60 }}
          />
        </Animated.View>
        <MaterialCommunityIcons
          style={{ paddingLeft: 2 }}
          name="robot-happy-outline"
          size={25}
          color={styles.icon.color}
        />
      </TouchableOpacity>
    </View>
  );
}

export default TaskAnalysisButton;
