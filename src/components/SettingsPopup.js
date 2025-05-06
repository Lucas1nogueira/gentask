import { Ionicons, MaterialIcons } from "@expo/vector-icons/";
import * as MailComposer from "expo-mail-composer";
import { useContext, useEffect } from "react";
import {
  Alert,
  BackHandler,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";

function SettingsPopup(props) {
  const { styles, toggleTheme, isDarkThemeActive } = useContext(ThemeContext);

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
    <Pressable
      style={[
        styles.fullscreenArea,
        {
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.3)",
        },
      ]}
      onPress={() => props.close()}
    >
      <Pressable style={styles.settingsPopup}>
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
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={async () => {
              try {
                const isAvailable = await MailComposer.isAvailableAsync();
                if (!isAvailable) {
                  Alert.alert(
                    "Erro",
                    "Nenhum cliente de e-mail configurado no dispositivo."
                  );
                  return;
                }
                await MailComposer.composeAsync({
                  recipients: ["lucasbastos@programmer.net"],
                  subject: "Contato | Gentask",
                  body: "(Dúvidas, sugestões, reports de erros...)",
                });
              } catch (error) {
                Alert.alert(
                  "Erro",
                  "Ocorreu um erro ao tentar abrir o cliente de e-mail."
                );
                console.warn(error);
              }
            }}
          >
            <MaterialIcons name="email" size={24} color={styles.icon.color} />
            <Text style={[styles.text, { paddingLeft: 3 }]}>Contate-nos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => toggleTheme()}
          >
            <MaterialIcons
              name={isDarkThemeActive ? "wb-sunny" : "mode-night"}
              size={24}
              color={styles.icon.color}
            />
            <Text style={[styles.text, { paddingLeft: 3 }]}>
              {isDarkThemeActive ? "Tema claro" : "Tema escuro"}
            </Text>
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
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              props.close();
              props.openTaskClearPopup();
            }}
          >
            <MaterialIcons
              name="cleaning-services"
              size={24}
              color={styles.icon.color}
            />
            <Text style={[styles.text, { paddingLeft: 3 }]}>
              Limpar tarefas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              props.close();
              props.openLogoutPopup();
            }}
          >
            <MaterialIcons name="logout" size={24} color={styles.icon.color} />
            <Text style={[styles.text, { paddingLeft: 3 }]}>Desconectar</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  );
}

export default SettingsPopup;
