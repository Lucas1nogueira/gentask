import { Entypo } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import {
  BackHandler,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemeContext } from "../contexts/ThemeContext";

function TopBar(props) {
  const { styles } = useContext(ThemeContext);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isSearchbarActive, setSearchbarActive] = useState(false);
  const [searchText, onChangeSearchText] = useState("");

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isKeyboardVisible) {
          onChangeSearchText("");
          setSearchbarActive(false);
          return true;
        }
      }
    );
    return () => backHandler.remove();
  }, [isSearchbarActive, searchText]);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    if (!isKeyboardVisible && searchText.length == 0) {
      setSearchbarActive(false);
    }
  }, [isKeyboardVisible, searchText]);

  useEffect(() => {
    if (props.sortedTasks) {
      const foundTasks = Object.entries(props.sortedTasks)
        .filter(([taskId, task]) =>
          task.text.toLowerCase().includes(searchText.toLowerCase())
        )
        .reduce((accumulator, [taskId, task]) => {
          accumulator[taskId] = task;
          return accumulator;
        }, {});
      props.setFoundTasks(foundTasks);
    }
  }, [props.sortedTasks, searchText]);

  return (
    <View style={styles.topBar}>
      {!isSearchbarActive ? (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{ paddingRight: 7 }}
              onPress={props.openMenu}
            >
              <Entypo name="menu" size={24} color={styles.icon.color} />
            </TouchableOpacity>
            <Text style={styles.header}>Gentask</Text>
            {props.isTrashScreenActive && (
              <Text style={styles.text}> / Lixeira</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => setSearchbarActive(true)}>
            <Entypo
              name="magnifying-glass"
              size={24}
              color={styles.icon.color}
            />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.searchbar}>
          <Entypo
            name="magnifying-glass"
            size={18}
            color={styles.icon.color}
            style={{ paddingRight: 2 }}
          />
          <TextInput
            style={[styles.text, { width: "90%", height: 50 }]}
            value={searchText}
            onChangeText={onChangeSearchText}
            placeholder="Buscar tarefa..."
            placeholderTextColor={styles.icon.color}
            autoFocus={true}
          />
        </View>
      )}
    </View>
  );
}

export default TopBar;
