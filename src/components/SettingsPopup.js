import React, { useContext, useEffect } from "react";
import { Text, View, TouchableOpacity, BackHandler } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons/";
import { ThemeContext } from "../contexts/ThemeContext";

function SettingsPopup(props) {
  const { styles, toggleTheme } = useContext(ThemeContext);

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
        <View
          style={{
            marginBottom: 10,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="settings-sharp" size={18} color={styles.icon.color} />
          <Text style={[styles.header, { paddingLeft: 5 }]}>Configurações</Text>
        </View>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity style={styles.settingsButton}>
            <MaterialIcons name="email" size={24} color={styles.icon.color} />
            <Text style={[styles.text, { paddingLeft: 3 }]}>Contato</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => toggleTheme()}
          >
            <MaterialIcons
              name="mode-night"
              size={24}
              color={styles.icon.color}
            />
            <Text style={[styles.text, { paddingLeft: 3 }]}>Modo noturno</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity style={styles.settingsButton}>
            <MaterialIcons
              name="cleaning-services"
              size={24}
              color={styles.icon.color}
            />
            <Text style={[styles.text, { paddingLeft: 3 }]}>
              Limpar tarefas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <MaterialIcons name="logout" size={24} color={styles.icon.color} />
            <Text style={[styles.text, { paddingLeft: 3 }]}>Desconectar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default SettingsPopup;
