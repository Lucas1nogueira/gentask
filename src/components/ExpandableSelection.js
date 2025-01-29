import { useRef, useState } from "react";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";
import { Entypo, Octicons } from "@expo/vector-icons/";
import {
  animateCollapsing,
  animateExpanding,
  animateToggleSwitch,
} from "../utils/animationUtils";
import styles from "../styles/styles";

function ExpandableSelection(props) {
  const expandAnimation = useRef(new Animated.Value(0)).current;
  const toggleSwitchAnimation = useRef(new Animated.Value(0)).current;

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const heightInterpolate = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [25, 165],
  });

  const backgroundColor = toggleSwitchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#9b0f03", "#23b701"],
  });

  const ballPosition = toggleSwitchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
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
            if (!showAdvancedOptions) {
              animateExpanding(expandAnimation);
              setShowAdvancedOptions(true);
            } else {
              animateCollapsing(expandAnimation);
              setShowAdvancedOptions(false);
            }
          }}
        >
          <Text style={styles.text}>Avançado</Text>
          <Entypo name="select-arrows" size={20} color="white" />
        </TouchableOpacity>
        {showAdvancedOptions && (
          <>
            <View
              style={{
                marginTop: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={[styles.text, { paddingRight: 10 }]}>
                Selecione uma categoria:
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
              <TouchableOpacity
                onPress={() => {
                  animateToggleSwitch(
                    toggleSwitchAnimation,
                    props.isTaskUrgent ? 0 : 1,
                    props.setTaskUrgent(!props.isTaskUrgent)
                  );
                }}
              >
                <Animated.View
                  style={[styles.toggleSwitchContainer, { backgroundColor }]}
                >
                  <Animated.View
                    style={[
                      styles.toggleSwitchBall,
                      {
                        transform: [{ translateX: ballPosition }],
                      },
                    ]}
                  />
                </Animated.View>
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
                Selecione uma data:
              </Text>
              <TouchableOpacity
                style={styles.categorySelectionButton}
                onPress={() => props.openDatePickerPopup()}
              >
                <Octicons name="calendar" size={14} color="white" />
                <Text style={[styles.text, { paddingLeft: 5 }]}>
                  {!props.selectedDate
                    ? "Escolhido por IA"
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

export default ExpandableSelection;
