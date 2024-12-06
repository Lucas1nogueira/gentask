import { useRef, useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Animated, BackHandler } from "react-native";
import styles from "./styles/styles";
import Menu from "./components/Menu";
import TopBar from "./components/TopBar";
import TasksArea from "./components/TasksArea";
import TaskViewPopup from "./components/TaskViewPopup";
import CreateTaskPopup from "./components/CreateTaskPopup";
import MessagePopup from "./components/MessagePopup";
import MinimalPopup from "./components/MinimalPopup";
import { getValueFor, save } from "./services/storage";
import {
  animateOpening,
  animateClosing,
  animateSlideIn,
  animateSlideOut,
} from "./utils/animationUtils";

export default function App() {
  const [tasks, setTasks] = useState(null);
  const didFetch = useRef(false);

  const [openMenu, setOpenMenu] = useState(false);
  const [menuAnimation, setMenuAnimation] = useState(new Animated.Value(0));
  const [menuLeftAnimation, setMenuLeftAnimation] = useState(
    new Animated.Value(0)
  );

  const [popups, setPopups] = useState({
    view: false,
    create: false,
    exit: false,
    delete: false,
    discard: false,
    loading: false,
    success: false,
    noText: false,
    error: false,
  });

  const [popupAnimations, setPopupAnimations] = useState({
    view: new Animated.Value(0),
    create: new Animated.Value(0),
    exit: new Animated.Value(0),
    delete: new Animated.Value(0),
    discard: new Animated.Value(0),
    loading: new Animated.Value(0),
    loadingRight: new Animated.Value(0),
    success: new Animated.Value(0),
    successRight: new Animated.Value(0),
    noText: new Animated.Value(0),
    noTextRight: new Animated.Value(0),
    error: new Animated.Value(0),
  });

  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setPopups((prevState) => ({
          ...prevState,
          exit: true,
        }));
        animateOpening(popupAnimations["exit"]);
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    getValueFor("tasks").then((data) => {
      if (data) setTasks(data);
      didFetch.current = true;
    });
  }, []);

  useEffect(() => {
    if (didFetch.current) {
      save("tasks", tasks);
    }
  }, [tasks]);

  return (
    <View style={styles.container}>
      {openMenu && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: menuAnimation }]}
        >
          <Menu
            animation={menuLeftAnimation}
            close={() => {
              animateClosing(menuAnimation, () => setOpenMenu(false));
              animateSlideOut(menuLeftAnimation);
            }}
          />
        </Animated.View>
      )}
      {popups.view && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: popupAnimations.view }]}
        >
          <TaskViewPopup
            close={() => {
              animateClosing(popupAnimations["view"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  view: false,
                }))
              );
            }}
            openDiscardPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                discard: true,
              }));
              animateOpening(popupAnimations["discard"]);
            }}
            openLoadingPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                loading: true,
              }));
              animateOpening(popupAnimations["loading"]);
              animateSlideIn(popupAnimations["loadingRight"]);
            }}
            closeLoadingPopup={() => {
              animateClosing(popupAnimations["loading"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  loading: false,
                }))
              );
              animateSlideOut(popupAnimations["loadingRight"]);
            }}
            openSuccessPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                success: true,
              }));
              animateOpening(popupAnimations["success"]);
              animateSlideIn(popupAnimations["successRight"]);
            }}
            openNoTextPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                noText: true,
              }));
              animateOpening(popupAnimations["noText"]);
              animateSlideIn(popupAnimations["noTextRight"]);
            }}
            taskToChange={tasks[selectedTaskIndex].text}
            index={selectedTaskIndex}
            tasks={tasks}
            save={() => save("tasks", tasks)}
            setTasks={setTasks}
          />
        </Animated.View>
      )}
      {popups.create && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: popupAnimations.create }]}
        >
          <CreateTaskPopup
            close={() => {
              animateClosing(popupAnimations["create"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  create: false,
                }))
              );
            }}
            openDiscardPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                discard: true,
              }));
              animateOpening(popupAnimations["discard"]);
            }}
            openLoadingPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                loading: true,
              }));
              animateOpening(popupAnimations["loading"]);
              animateSlideIn(popupAnimations["loadingRight"]);
            }}
            closeLoadingPopup={() => {
              animateClosing(popupAnimations["loading"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  loading: false,
                }))
              );
              animateSlideOut(popupAnimations["loadingRight"]);
            }}
            openSuccessPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                success: true,
              }));
              animateOpening(popupAnimations["success"]);
              animateSlideIn(popupAnimations["successRight"]);
            }}
            openNoTextPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                noText: true,
              }));
              animateOpening(popupAnimations["noText"]);
              animateSlideIn(popupAnimations["noTextRight"]);
            }}
            isAnyTaskCreated={tasks != null}
            setTasks={setTasks}
          />
        </Animated.View>
      )}
      {popups.exit && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: popupAnimations.exit }]}
        >
          <MessagePopup
            close={() => {
              animateClosing(popupAnimations["exit"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  exit: false,
                }))
              );
            }}
            title={"Exit app"}
            description={"This will close MyTasks. Are you sure?"}
            actionName={"Exit"}
            actionButtonColor={"#470c0c"}
            action={() => BackHandler.exitApp()}
          />
        </Animated.View>
      )}
      {popups.delete && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: popupAnimations.delete }]}
        >
          <MessagePopup
            close={() => {
              animateClosing(popupAnimations["delete"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  delete: false,
                }))
              );
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
      {popups.discard && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: popupAnimations.discard }]}
        >
          <MessagePopup
            close={() => {
              animateClosing(popupAnimations["discard"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  discard: false,
                }))
              );
            }}
            title={"Discard task"}
            description={"All written text will be lost. Are you sure?"}
            actionName={"Discard"}
            actionButtonColor={"#470c0c"}
            action={() => {
              animateClosing(popupAnimations["view"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  view: false,
                }))
              );
              animateClosing(popupAnimations["create"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  create: false,
                }))
              );
            }}
          />
        </Animated.View>
      )}
      {popups.loading && (
        <MinimalPopup
          loading={true}
          customTop={40}
          opacityAnimation={popupAnimations.loading}
          rightAnimation={popupAnimations.loadingRight}
          color="#555"
          message={"Saving your task..."}
        />
      )}
      {popups.success && (
        <MinimalPopup
          customTop={40}
          opacityAnimation={popupAnimations.success}
          rightAnimation={popupAnimations.successRight}
          color="#5adb23"
          close={() => {
            animateClosing(popupAnimations["success"], () =>
              setPopups((prevState) => ({
                ...prevState,
                success: false,
              }))
            );
            animateSlideOut(popupAnimations["successRight"]);
          }}
          message={"Task added!"}
        />
      )}
      {popups.noText && (
        <MinimalPopup
          opacityAnimation={popupAnimations.noText}
          rightAnimation={popupAnimations.noTextRight}
          color="#bc0000"
          close={() => {
            animateClosing(popupAnimations["noText"], () =>
              setPopups((prevState) => ({
                ...prevState,
                noText: false,
              }))
            );
            animateSlideOut(popupAnimations["noTextRight"]);
          }}
          message={"Please, insert any text!"}
        />
      )}
      {popups.error && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: popupAnimations.error }]}
        >
          <MessagePopup
            close={() => {
              animateClosing(popupAnimations["error"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  error: false,
                }))
              );
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
          setPopups((prevState) => ({
            ...prevState,
            delete: true,
          }));
          animateOpening(popupAnimations["delete"]);
        }}
        tasks={tasks}
        setTasks={setTasks}
        didFetch={didFetch}
        taskViewPopup={(index) => {
          setSelectedTaskIndex(index);
          setPopups((prevState) => ({
            ...prevState,
            view: true,
          }));
          animateOpening(popupAnimations["view"]);
        }}
        openCreatePopup={() => {
          setPopups((prevState) => ({
            ...prevState,
            create: true,
          }));
          animateOpening(popupAnimations["create"]);
        }}
      />
      <StatusBar style="light" translucent={false} />
    </View>
  );
}
