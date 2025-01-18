import { useEffect, useState } from "react";
import {
  BackHandler,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import styles from "../styles/styles";

function TopBar(props) {
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
    if (props.filteredTasks) {
      const foundTasks = Object.entries(props.filteredTasks)
        .filter(([taskId, task]) =>
          task.text.toLowerCase().includes(searchText.toLowerCase())
        )
        .reduce((accumulator, [taskId, task]) => {
          accumulator[taskId] = task;
          return accumulator;
        }, {});
      props.setFoundTasks(foundTasks);
    }
  }, [props.filteredTasks, searchText]);

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
              <Entypo name="menu" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.header}>MyTasks</Text>
          </View>
          <TouchableOpacity onPress={() => setSearchbarActive(true)}>
            <Entypo name="magnifying-glass" size={24} color="white" />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.searchbar}>
          <Entypo
            name="magnifying-glass"
            size={18}
            color="#c1c1c1"
            style={{ paddingRight: 2 }}
          />
          <TextInput
            style={[styles.text, { width: "90%", height: 50 }]}
            value={searchText}
            onChangeText={onChangeSearchText}
            placeholder="Buscar tarefa..."
            placeholderTextColor="#c1c1c1"
            autoFocus={true}
          />
        </View>
      )}
    </View>
  );
}

export default TopBar;
