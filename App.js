import { useRef, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Animated, Easing, Alert, BackHandler } from "react-native";
import * as SecureStore from "expo-secure-store";
import styles from "./styles";
import Menu from "./Menu";
import TopBar from "./TopBar";
import TasksArea from "./TasksArea";
import ViewPoup from "./ViewPopup";
import CreatePopup from "./CreatePopup";

async function save(key, value) {
  const jsonValue = JSON.stringify(value);
  await SecureStore.setItemAsync(key, jsonValue);
}

async function getValueFor(key) {
  try {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
      return JSON.parse(result);
    }
  } catch (error) {
    alert("Erro ao obter dados!");
  }
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const didFetch = useRef(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [menuAnimation, setMenuAnimation] = useState(new Animated.Value(0));
  const [viewPopup, setViewPopup] = useState(false);
  const [viewPopupAnimation, setViewPopupAnimation] = useState(
    new Animated.Value(0)
  );
  const [createPopup, setCreatePopup] = useState(false);
  const [createPopupAnimation, setCreatePopupAnimation] = useState(
    new Animated.Value(0)
  );
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        Alert.alert("Exit app", "Are you sure?", [
          { text: "Cancel", onPress: () => null },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    async function fetchData() {
      data = await getValueFor("tasks");
      if (data) setTasks(data);
      didFetch.current = true;
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (didFetch.current == true) {
      async function saveData() {
        await save("tasks", tasks);
      }
      saveData();
    }
  }, [tasks]);

  function animateOpening(property) {
    Animated.timing(property, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  function animateClosing(property, callbackFunction) {
    Animated.timing(property, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      callbackFunction();
    });
  }

  return (
    <View style={styles.container}>
      {openMenu && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: menuAnimation }]}
        >
          <Menu
            closeMenu={() => {
              animateClosing(menuAnimation, () => setOpenMenu(false));
            }}
          />
        </Animated.View>
      )}
      {viewPopup && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: viewPopupAnimation }]}
        >
          <ViewPoup
            closeViewPopup={() => {
              animateClosing(viewPopupAnimation, () => setViewPopup(false));
            }}
            taskToChange={tasks[selectedTaskIndex]}
            index={selectedTaskIndex}
            tasks={tasks}
            save={() => save("tasks", tasks)}
            setTasks={setTasks}
          />
        </Animated.View>
      )}
      {createPopup && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: createPopupAnimation }]}
        >
          <CreatePopup
            closeCreatePopup={() => {
              animateClosing(createPopupAnimation, () => setCreatePopup(false));
            }}
            isAnyTaskCreated={tasks != null}
            setTasks={setTasks}
          />
        </Animated.View>
      )}
      <TopBar
        openMenu={() => {
          setOpenMenu(true);
          animateOpening(menuAnimation);
        }}
      />
      <TasksArea
        save={save}
        getValueFor={getValueFor}
        delete={(index) => {
          const updatedTasks = [...tasks];
          updatedTasks.splice(index, 1);
          setTasks(updatedTasks);
        }}
        tasks={tasks}
        setTasks={setTasks}
        didFetch={didFetch}
        viewPopup={(index) => {
          setSelectedTaskIndex(index);
          setViewPopup(true);
          animateOpening(viewPopupAnimation);
        }}
        openCreatePopup={() => {
          setCreatePopup(true);
          animateOpening(createPopupAnimation);
        }}
      />
      <StatusBar style="light" translucent={false} />
    </View>
  );
}
