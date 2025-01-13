import React, { useEffect } from "react";
import { Text, View, TouchableHighlight, BackHandler } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import styles from "../styles/styles";

function SettingsPopup(props) {
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
          backgroundColor: "rgba(0,0,0,0.5)",
        },
      ]}
    >
      <View style={styles.settingsPopup}>
        <Text style={styles.text}>Configurações</Text>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <TouchableHighlight style={styles.settingsButton}>
            <>
              <MaterialIcons name="email" size={24} color="white" />
              <Text style={[styles.text, { paddingLeft: 3 }]}>Contato</Text>
            </>
          </TouchableHighlight>
          <TouchableHighlight style={styles.settingsButton}>
            <>
              <MaterialIcons name="mode-night" size={24} color="white" />
              <Text style={[styles.text, { paddingLeft: 3 }]}>
                Modo noturno
              </Text>
            </>
          </TouchableHighlight>
        </View>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <TouchableHighlight style={styles.settingsButton}>
            <>
              <MaterialIcons name="cleaning-services" size={24} color="white" />
              <Text style={[styles.text, { paddingLeft: 3 }]}>
                Limpar tarefas
              </Text>
            </>
          </TouchableHighlight>
          <TouchableHighlight style={styles.settingsButton}>
            <>
              <MaterialIcons name="logout" size={24} color="white" />
              <Text style={[styles.text, { paddingLeft: 3 }]}>Desconectar</Text>
            </>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
}

export default SettingsPopup;
