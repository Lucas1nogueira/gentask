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
import MessagePopup from "./MessagePopup";
import MinimalPopup from "./MinimalPopup";

async function save(key, value) {
  const jsonValue = JSON.stringify(value);
  await SecureStore.setItemAsync(key, jsonValue);
}

async function getValueFor(key) {
  try {
    let result = await SecureStore.getItemAsync(key);
    if (result && result != "[]") {
      return JSON.parse(result);
    } else {
      return null;
    }
  } catch (error) {
    Alert.alert("Erro ao obter dados!");
  }
}

export default function App() {
  const [tasks, setTasks] = useState(null);
  const didFetch = useRef(false);

  const [openMenu, setOpenMenu] = useState(false);
  const [menuAnimation, setMenuAnimation] = useState(new Animated.Value(0));
  const [menuLeftAnimation, setMenuLeftAnimation] = useState(
    new Animated.Value(0)
  );

  const [viewPopup, setViewPopup] = useState(false);
  const [viewPopupAnimation, setViewPopupAnimation] = useState(
    new Animated.Value(0)
  );

  const [createPopup, setCreatePopup] = useState(false);
  const [createPopupAnimation, setCreatePopupAnimation] = useState(
    new Animated.Value(0)
  );

  const [exitPopup, setExitPopup] = useState(false);
  const [exitPopupAnimation, setExitPopupAnimation] = useState(
    new Animated.Value(0)
  );

  const [deletePopup, setDeletePopup] = useState(false);
  const [deletePopupAnimation, setDeletePopupAnimation] = useState(
    new Animated.Value(0)
  );

  const [discardPopup, setDiscardPopup] = useState(false);
  const [discardPopupAnimation, setDiscardPopupAnimation] = useState(
    new Animated.Value(0)
  );

  const [noTextPopup, setNoTextPopup] = useState(false);
  const [noTextPopupAnimation, setNoTextPopupAnimation] = useState(
    new Animated.Value(0)
  );
  const [noTextPopupRightAnimation, setNoTextPopupRightAnimation] = useState(
    new Animated.Value(0)
  );

  const [errorPopup, setErrorPopup] = useState(false);
  const [errorPopupAnimation, setErrorPopupAnimation] = useState(
    new Animated.Value(0)
  );

  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setExitPopup(true);
        animateOpening(exitPopupAnimation);
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

  function animateSlideIn(property) {
    Animated.timing(property, {
      toValue: 1,
      duration: 400,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  function animateSlideOut(property) {
    Animated.timing(property, {
      toValue: 0,
      duration: 400,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  return (
    <View style={styles.container}>
      {openMenu && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: menuAnimation }]}
        >
          <Menu
            animation={menuLeftAnimation}
            closeMenu={() => {
              animateClosing(menuAnimation, () => setOpenMenu(false));
              animateSlideOut(menuLeftAnimation);
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
            openDiscardPopup={() => {
              setDiscardPopup(true);
              animateOpening(discardPopupAnimation);
            }}
            openNoTextPopup={() => {
              setNoTextPopup(true);
              animateOpening(noTextPopupAnimation);
              animateSlideIn(noTextPopupRightAnimation);
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
            openDiscardPopup={() => {
              setDiscardPopup(true);
              animateOpening(discardPopupAnimation);
            }}
            openNoTextPopup={() => {
              setNoTextPopup(true);
              animateOpening(noTextPopupAnimation);
              animateSlideIn(noTextPopupRightAnimation);
            }}
            isAnyTaskCreated={tasks != null}
            setTasks={setTasks}
          />
        </Animated.View>
      )}
      {exitPopup && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: exitPopupAnimation }]}
        >
          <MessagePopup
            close={() => {
              animateClosing(exitPopupAnimation, () => setExitPopup(false));
            }}
            title={"Exit app"}
            description={"This will close MyTasks. Are you sure?"}
            actionName={"Exit"}
            actionButtonColor={"#470c0c"}
            action={() => BackHandler.exitApp()}
          />
        </Animated.View>
      )}
      {deletePopup && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: deletePopupAnimation }]}
        >
          <MessagePopup
            close={() => {
              animateClosing(deletePopupAnimation, () => setDeletePopup(false));
            }}
            title={"Delete task"}
            description={"This will erase the selected task. Are you sure?"}
            actionName={"Delete"}
            actionButtonColor={"#470c0c"}
            action={() => {
              const updatedTasks = [...tasks];
              updatedTasks.splice(selectedTaskIndex, 1);
              setTasks(updatedTasks);
              setSelectedTaskIndex(0);
            }}
          />
        </Animated.View>
      )}
      {discardPopup && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: discardPopupAnimation }]}
        >
          <MessagePopup
            close={() => {
              animateClosing(discardPopupAnimation, () =>
                setDiscardPopup(false)
              );
            }}
            title={"Discard task"}
            description={"All written text will be lost. Are you sure?"}
            actionName={"Discard"}
            actionButtonColor={"#470c0c"}
            action={() => {
              animateClosing(viewPopupAnimation, () => setViewPopup(false));
              animateClosing(createPopupAnimation, () => setCreatePopup(false));
            }}
          />
        </Animated.View>
      )}
      {noTextPopup && (
        <MinimalPopup
          opacityAnimation={noTextPopupAnimation}
          rightAnimation={noTextPopupRightAnimation}
          color="#bc0000"
          close={() => {
            animateClosing(noTextPopupAnimation, () => setNoTextPopup(false));
            animateSlideOut(noTextPopupRightAnimation);
          }}
          message={"Please, insert any text!"}
        />
      )}
      {errorPopup && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: errorPopupAnimation }]}
        >
          <MessagePopup
            close={() => {
              animateClosing(errorPopupAnimation, () => setErrorPopup(false));
            }}
            title={"Error"}
            description={"An error happened."}
            actionName={"OK"}
            actionButtonColor={"#470c0c"}
            action={() => null}
          />
        </Animated.View>
      )}
      <TopBar
        openMenu={() => {
          setOpenMenu(true);
          animateOpening(menuAnimation);
          animateSlideIn(menuLeftAnimation);
        }}
      />
      <TasksArea
        save={save}
        getValueFor={getValueFor}
        delete={(index) => {
          setSelectedTaskIndex(index);
          setDeletePopup(true);
          animateOpening(deletePopupAnimation);
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
