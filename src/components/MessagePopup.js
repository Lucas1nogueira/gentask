import { AntDesign, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useContext, useEffect } from "react";
import { BackHandler, Text, TouchableOpacity, View } from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";

function MessagePopup(props) {
  const { styles } = useContext(ThemeContext);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        props.close();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  return (
    <View
      style={[
        styles.fullscreenArea,
        {
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
        },
      ]}
    >
      <View style={styles.messagePopup}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <SimpleLineIcons
            name={props.iconName}
            size={16}
            color={styles.icon.color}
          />
          <Text style={[styles.header, { paddingLeft: 7 }]}>{props.title}</Text>
        </View>
        <Text style={[styles.text, { marginTop: 10 }]}>
          {props.description}
        </Text>
        <View
          style={[
            styles.popupButtonRow,
            props.error && { justifyContent: "flex-end" },
          ]}
        >
          <TouchableOpacity
            style={[styles.commonButton, styles.cancelButton]}
            onPress={() => props.close()}
          >
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              <AntDesign name="arrowleft" size={20} color="white" />
              <Text style={[styles.text, { color: "white" }]}>Voltar</Text>
            </View>
          </TouchableOpacity>
          {!props.error && (
            <TouchableOpacity
              style={[styles.commonButton, styles.confirmButton]}
              onPress={() => {
                props.action();
                props.close();
              }}
            >
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={
                    props.actionName == "Exit"
                      ? "close"
                      : props.actionName == "Delete"
                      ? "trash"
                      : "checkmark"
                  }
                  size={20}
                  color="white"
                />
                <Text style={[styles.text, { color: "white" }]}>
                  {props.actionName}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default MessagePopup;
