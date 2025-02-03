import { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { Entypo, MaterialIcons, Octicons } from "@expo/vector-icons/";
import {
  animateCollapsing,
  animateExpanding,
  animateToggleSwitch,
} from "../utils/animationUtils";
import styles from "../styles/styles";

function TaskAdvancedOptions(props) {
  const expandAnimation = useRef(new Animated.Value(0)).current;
  const toggleSwitchAnimation = useRef(new Animated.Value(0)).current;

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const heightInterpolate = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [25, 180],
  });

  const backgroundColor = toggleSwitchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#9b0f03", "#23b701"],
  });

  const ballPosition = toggleSwitchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });

  useEffect(() => {
    if (props.isTaskUrgent) {
      animateToggleSwitch(toggleSwitchAnimation, 1);
    }
  }, [props.isTaskUrgent]);

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
            if (!showAdvancedOptions) {
              animateExpanding(expandAnimation);
              setShowAdvancedOptions(true);
            } else {
              animateCollapsing(expandAnimation);
              setShowAdvancedOptions(false);
            }
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="settings" size={20} color="white" />
            <Text style={[styles.text, { paddingLeft: 5 }]}>Avançado</Text>
          </View>
          <Entypo name="select-arrows" size={20} color="white" />
        </TouchableOpacity>
        {showAdvancedOptions && (
          <>
            <View
              style={{
                marginTop: 15,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={[styles.text, { paddingRight: 10 }]}>
                Categoria:
              </Text>
              <TouchableOpacity
                style={styles.categorySelectionButton}
                onPress={() => props.openCategoryPickerPopup()}
              >
                <Octicons
                  name="dot-fill"
                  size={22}
                  color={props.selectedCategory.color}
                />
                <Text style={[styles.text, { paddingLeft: 5 }]}>
                  {props.selectedCategory.name}
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                marginTop: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={[styles.text, { paddingRight: 10 }]}>
                Marcar como urgente?
              </Text>
              <View
                style={{
                  width: 150,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={styles.categorySelectionButton}
                  onPress={() => {
                    if (props.isTaskUrgent === null) {
                      props.setTaskUrgent(false);
                    } else {
                      animateToggleSwitch(
                        toggleSwitchAnimation,
                        0,
                        props.setTaskUrgent(null)
                      );
                    }
                  }}
                >
                  <MaterialIcons name="insights" size={20} color="white" />
                  <Text style={[styles.text, { paddingLeft: 5 }]}>
                    {props.isTaskUrgent === null ? "Auto" : "Manual"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (
                      props.isTaskUrgent === null ||
                      props.isTaskUrgent === false
                    ) {
                      animateToggleSwitch(
                        toggleSwitchAnimation,
                        1,
                        props.setTaskUrgent(true)
                      );
                    } else if (props.isTaskUrgent === true) {
                      animateToggleSwitch(
                        toggleSwitchAnimation,
                        0,
                        props.setTaskUrgent(false)
                      );
                    }
                  }}
                >
                  {/* Bug conhecido: background do switch com mal-funcionamento */}
                  <Animated.View
                    style={[
                      styles.toggleSwitchContainer,
                      props.isTaskUrgent !== null
                        ? { backgroundColor: backgroundColor }
                        : { backgroundColor: "#333" },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.toggleSwitchBall,
                        props.isTaskUrgent === null && {
                          backgroundColor: "#999",
                        },
                        {
                          transform: [{ translateX: ballPosition }],
                        },
                      ]}
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                marginTop: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={[styles.text, { paddingRight: 10 }]}>
                Selecione uma data:
              </Text>
              <TouchableOpacity
                style={styles.categorySelectionButton}
                onPress={() => props.openDatePickerPopup()}
              >
                <Octicons name="calendar" size={14} color="white" />
                <Text style={[styles.text, { paddingLeft: 5 }]}>
                  {props.selectedDate === null
                    ? "Escolhido por IA"
                    : props.selectedDate === false
                    ? "Não definida"
                    : new Date(props.selectedDate).toLocaleDateString("pt-BR")}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

export default TaskAdvancedOptions;
