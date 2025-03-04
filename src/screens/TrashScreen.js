import { useRef, useState, useEffect, useContext } from "react";
import {
  View,
  Animated,
  BackHandler,
  PanResponder,
  TouchableWithoutFeedback,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import NetInfo from "@react-native-community/netinfo";
import {
  eraseTasks,
  eraseTrashedTasks,
  getTrashedTasks,
  storeTask,
  storeTrashedTasks,
} from "../services/storage";
import { logout } from "../services/firebase/auth";
import {
  fetchTrashedTasks,
  permanentlyDeleteTask,
  purgeTasks,
  purgeTrashedTasks,
  restoreTrashedTask,
} from "../services/firebase/firestore";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthConfirmMessagesContext } from "../contexts/AuthConfirmMessagesContext";
import Menu from "../components/Menu";
import TopBar from "../components/TopBar";
import FilteringBar from "../components/FilteringBar";
import TrashedTaskContainer from "../components/TrashedTaskContainer";
import CategoryPickerPopup from "../components/CategoryPickerPopup";
import SortPickerPopup from "../components/SortPickerPopup";
import MessagePopup from "../components/MessagePopup";
import MinimalPopup from "../components/MinimalPopup";
import SettingsPopup from "../components/SettingsPopup";
import {
  animateOpening,
  animateClosing,
  animateSlideIn,
  animateSlideOut,
} from "../utils/animationUtils";
import "../styles/global.css";

const MENU_DRAWER_WIDTH = 280;

function TrashScreen(props) {
  const { styles } = useContext(ThemeContext);
  const {
    setAuthConfirmMessage,
    setAuthConfirmPopups,
    authConfirmPopupAnimations,
  } = useContext(AuthConfirmMessagesContext);

  const didFetch = useRef(false);

  const [trashedTasks, setTrashedTasks] = useState(null);
  const [didTrashedTasksLoad, setTrashedTasksLoad] = useState(false);
  const [sortedTrashedTasks, setSortedTrashedTasks] = useState(null);
  const [foundTrashedTasks, setFoundTrashedTasks] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState({
    name: "Tudo",
    color: "grey",
  });
  const [selectedSort, setSelectedSort] = useState("created_desc");
  const [pendingTasksFirst, setPendingTasksFirst] = useState(false);
  const [completedTasksFirst, setCompletedTasksFirst] = useState(false);
  const [urgentTasksFirst, setUrgentTasksFirst] = useState(true);

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-MENU_DRAWER_WIDTH)).current;

  const [minimalPopupMessage, setMinimalPopupMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [popups, setPopups] = useState({
    categoryPicker: false,
    sortPicker: false,
    trashedTaskRemoval: false,
    trashedTaskClear: false,
    taskClear: false,
    exit: false,
    loading: false,
    success: false,
    error: false,
    settings: false,
    logout: false,
  });

  const [popupAnimations] = useState({
    categoryPicker: new Animated.Value(0),
    sortPicker: new Animated.Value(0),
    trashedTaskRemoval: new Animated.Value(0),
    trashedTaskClear: new Animated.Value(0),
    taskClear: new Animated.Value(0),
    exit: new Animated.Value(0),
    loading: new Animated.Value(0),
    loadingRight: new Animated.Value(0),
    success: new Animated.Value(0),
    successRight: new Animated.Value(0),
    error: new Animated.Value(0),
    settings: new Animated.Value(0),
    logout: new Animated.Value(0),
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      return (
        evt.nativeEvent.pageX < 30 &&
        !isMenuOpen &&
        !Object.values(popups).some((v) => v)
      );
    },

    onPanResponderMove: (_, gesture) => {
      const newX = gesture.dx - MENU_DRAWER_WIDTH;
      if (newX <= 0 && newX >= -MENU_DRAWER_WIDTH) {
        menuAnimation.setValue(newX);
      }
    },

    onPanResponderRelease: (_, gesture) => {
      const shouldOpen =
        gesture.dx > MENU_DRAWER_WIDTH * 0.3 || gesture.vx > 0.3;
      const shouldClose =
        gesture.dx < -MENU_DRAWER_WIDTH / 0.3 || gesture.vx < -0.3;

      if (shouldOpen) {
        openMenu();
      } else if (shouldClose) {
        closeMenu();
      } else {
        Animated.spring(menuAnimation, {
          toValue: isMenuOpen ? 0 : -MENU_DRAWER_WIDTH,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const openMenu = () => {
    if (!isMenuOpen) {
      setMenuOpen(true);
      Animated.spring(menuAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 30,
        friction: 10,
        overshootClamping: true,
      }).start();
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    Animated.spring(menuAnimation, {
      toValue: -MENU_DRAWER_WIDTH,
      useNativeDriver: true,
      tension: 30,
      friction: 10,
      overshootClamping: true,
    }).start();
  };

  const menuOverlayOpacity = menuAnimation.interpolate({
    inputRange: [-MENU_DRAWER_WIDTH, 0],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  async function checkConnection() {
    const netState = await NetInfo.fetch();
    return netState.isConnected;
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!isMenuOpen) {
          setPopups((prevState) => ({
            ...prevState,
            exit: true,
          }));
          animateOpening(popupAnimations["exit"]);
        } else {
          closeMenu();
        }
        return true;
      }
    );
    return () => backHandler.remove();
  }, [isMenuOpen]);

  useEffect(() => {
    checkConnection().then(async (isConnected) => {
      fetchTrashedTasks()
        .then(async (data) => {
          if (isConnected) {
            await eraseTrashedTasks();
            if (data) {
              setTrashedTasks(data);
            }
          } else {
            const localData = await getTrashedTasks();
            if (localData) setTrashedTasks(localData);
          }
        })
        .catch(() => {
          setErrorMessage(
            "Não foi possível carregar as tarefas na lixeira da nuvem!"
          );
          setPopups((prevState) => ({
            ...prevState,
            error: true,
          }));
          animateOpening(popupAnimations["error"]);
        })
        .finally(async () => {
          didFetch.current = true;
          setTrashedTasksLoad(true);
        });
    });
  }, []);

  useEffect(() => {
    if (didFetch.current) {
      storeTrashedTasks(trashedTasks);
    }
  }, [trashedTasks]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <TopBar
        isTrashScreenActive={true}
        openMenu={openMenu}
        sortedTasks={sortedTrashedTasks}
        setFoundTasks={setFoundTrashedTasks}
      />
      <FilteringBar
        tasks={trashedTasks}
        setSortedTasks={setSortedTrashedTasks}
        selectedCategory={selectedCategory}
        selectedSort={selectedSort}
        pendingTasksFirst={pendingTasksFirst}
        completedTasksFirst={completedTasksFirst}
        urgentTasksFirst={urgentTasksFirst}
        openCategoryPickerPopup={() => {
          setPopups((prevState) => ({
            ...prevState,
            categoryPicker: true,
          }));
          animateOpening(popupAnimations["categoryPicker"]);
        }}
        openSortPickerPopup={() => {
          setPopups((prevState) => ({
            ...prevState,
            sortPicker: true,
          }));
          animateOpening(popupAnimations["sortPicker"]);
        }}
      />
      <TrashedTaskContainer
        foundTrashedTasks={foundTrashedTasks}
        didTrashedTasksLoad={didTrashedTasksLoad}
        emptyMessage={
          !trashedTasks || Object.keys(trashedTasks).length === 0
            ? "A lixeira está vazia!"
            : foundTrashedTasks &&
              Object.keys(foundTrashedTasks).length === 0 &&
              "Nenhuma tarefa encontrada!"
        }
        openTrashedTaskClearPopup={() => {
          setPopups((prevState) => ({
            ...prevState,
            trashedTaskClear: true,
          }));
          animateOpening(popupAnimations["trashedTaskClear"]);
        }}
        delete={(taskId) => {
          setSelectedTaskId(taskId);
          setPopups((prevState) => ({
            ...prevState,
            trashedTaskRemoval: true,
          }));
          animateOpening(popupAnimations["trashedTaskRemoval"]);
        }}
        restore={(taskId) => {
          const updatedTrashedTasks = { ...trashedTasks };
          const restoredTask = updatedTrashedTasks[taskId];
          delete updatedTrashedTasks[taskId];
          storeTask(taskId, restoredTask);
          setTrashedTasks(updatedTrashedTasks);
          setSelectedTaskId(null);
          setMinimalPopupMessage("Tarefa restaurada!");
          setTimeout(
            () => {
              setPopups((prevState) => ({
                ...prevState,
                success: true,
              }));
              animateOpening(popupAnimations["success"]);
              animateSlideIn(popupAnimations["successRight"]);
            },
            popups.trashedTaskRemoval ? 500 : 0
          );
          restoreTrashedTask(taskId, restoredTask).catch(() => {
            setErrorMessage(
              "Não foi possível restaurar a tarefa na nuvem!\nA tarefa foi restaurada localmente."
            );
            setPopups((prevState) => ({
              ...prevState,
              error: true,
            }));
            animateOpening(popupAnimations["error"]);
          });
        }}
      />
      <Menu
        animation={menuAnimation}
        close={closeMenu}
        openSettingsPopup={() => {
          setPopups((prevState) => ({
            ...prevState,
            settings: true,
          }));
          animateOpening(popupAnimations["settings"]);
        }}
        setTrashScreenActive={props.setTrashScreenActive}
      />
      {isMenuOpen && (
        <Animated.View
          style={[
            styles.fullscreenArea,
            {
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.3)",
              opacity: menuOverlayOpacity,
              zIndex: 1,
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </Animated.View>
      )}
      {popups.categoryPicker && (
        <Animated.View
          style={[
            styles.fullscreenArea,
            { opacity: popupAnimations.categoryPicker },
          ]}
        >
          <CategoryPickerPopup
            close={() => {
              animateClosing(popupAnimations["categoryPicker"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  categoryPicker: false,
                }))
              );
            }}
            setSelectedCategory={setSelectedCategory}
            defaultOption={{ name: "Tudo", color: "grey" }}
          />
        </Animated.View>
      )}
      {popups.sortPicker && (
        <Animated.View
          style={[
            styles.fullscreenArea,
            { opacity: popupAnimations.sortPicker },
          ]}
        >
          <SortPickerPopup
            close={() => {
              animateClosing(popupAnimations["sortPicker"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  sortPicker: false,
                }))
              );
            }}
            selectedSort={selectedSort}
            pendingTasksFirst={pendingTasksFirst}
            completedTasksFirst={completedTasksFirst}
            urgentTasksFirst={urgentTasksFirst}
            setSelectedSort={setSelectedSort}
            setPendingTasksFirst={setPendingTasksFirst}
            setCompletedTasksFirst={setCompletedTasksFirst}
            setUrgentTasksFirst={setUrgentTasksFirst}
          />
        </Animated.View>
      )}
      {popups.trashedTaskRemoval && (
        <Animated.View
          style={[
            styles.fullscreenArea,
            { opacity: popupAnimations.trashedTaskRemoval },
          ]}
        >
          <MessagePopup
            close={() => {
              animateClosing(popupAnimations["trashedTaskRemoval"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  trashedTaskRemoval: false,
                }))
              );
            }}
            iconName={"trash"}
            title={"Deletar tarefa permanentemente"}
            description={
              "Isso apagará completamente a tarefa selecionada. Tem certeza?"
            }
            actionName={"Deletar"}
            action={() => {
              const updatedTrashedTasks = { ...trashedTasks };
              const deletedTask = updatedTrashedTasks[selectedTaskId];
              delete updatedTrashedTasks[selectedTaskId];
              setTrashedTasks(updatedTrashedTasks);
              setSelectedTaskId(null);
              setMinimalPopupMessage("Tarefa apagada!");
              setTimeout(
                () => {
                  setPopups((prevState) => ({
                    ...prevState,
                    success: true,
                  }));
                  animateOpening(popupAnimations["success"]);
                  animateSlideIn(popupAnimations["successRight"]);
                },
                popups.trashedTaskRemoval ? 500 : 0
              );
              permanentlyDeleteTask(selectedTaskId, deletedTask).catch(() => {
                setErrorMessage(
                  "Não foi possível deletar a tarefa na nuvem!\nA tarefa foi deletada localmente."
                );
                setPopups((prevState) => ({
                  ...prevState,
                  error: true,
                }));
                animateOpening(popupAnimations["error"]);
              });
            }}
          />
        </Animated.View>
      )}
      {popups.trashedTaskClear && (
        <Animated.View
          style={[
            styles.fullscreenArea,
            { opacity: popupAnimations.trashedTaskClear },
          ]}
        >
          <MessagePopup
            close={() => {
              animateClosing(popupAnimations["trashedTaskClear"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  trashedTaskClear: false,
                }))
              );
            }}
            iconName={"fire"}
            title={"Esvaziar lixeira"}
            description={
              "Isso apagará permanentemente as tarefas da lixeira. Tem certeza?"
            }
            actionName={"Esvaziar"}
            action={() => {
              setPopups((prevState) => ({
                ...prevState,
                loading: true,
              }));
              animateOpening(popupAnimations["loading"]);
              animateSlideIn(popupAnimations["loadingRight"]);
              eraseTrashedTasks()
                .then(() => {
                  animateClosing(popupAnimations["loading"], () =>
                    setPopups((prevState) => ({
                      ...prevState,
                      loading: false,
                    }))
                  );
                  animateSlideOut(popupAnimations["loadingRight"]);
                  setTrashedTasks(null);
                  setSortedTrashedTasks(null);
                  setFoundTrashedTasks(null);
                  setSelectedTaskId(null);
                  setMinimalPopupMessage("Lixeira esvaziada!");
                  setPopups((prevState) => ({
                    ...prevState,
                    success: true,
                  }));
                  animateOpening(popupAnimations["success"]);
                  animateSlideIn(popupAnimations["successRight"]);
                  purgeTrashedTasks().catch(() => {
                    setErrorMessage(
                      "Não foi possível esvaziar a lixeira na nuvem!\nPor favor, contate o desenvolvedor."
                    );
                    setPopups((prevState) => ({
                      ...prevState,
                      error: true,
                    }));
                    animateOpening(popupAnimations["error"]);
                  });
                })
                .catch(() => {
                  setErrorMessage(
                    "Não foi possível esvaziar a lixeira no dispositivo!\nPor favor, contate o desenvolvedor."
                  );
                  setPopups((prevState) => ({
                    ...prevState,
                    error: true,
                  }));
                  animateOpening(popupAnimations["error"]);
                });
            }}
          />
        </Animated.View>
      )}
      {popups.taskClear && (
        <Animated.View
          style={[
            styles.fullscreenArea,
            { opacity: popupAnimations.taskClear },
          ]}
        >
          <MessagePopup
            close={() => {
              animateClosing(popupAnimations["taskClear"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  taskClear: false,
                }))
              );
            }}
            iconName={"trash"}
            title={"Limpar tarefas"}
            description={
              "Isso moverá todas as tarefas para a lixeira. Tem certeza?"
            }
            actionName={"Limpar"}
            action={() => {
              setPopups((prevState) => ({
                ...prevState,
                loading: true,
              }));
              animateOpening(popupAnimations["loading"]);
              animateSlideIn(popupAnimations["loadingRight"]);
              eraseTasks()
                .then(() => {
                  animateClosing(popupAnimations["loading"], () =>
                    setPopups((prevState) => ({
                      ...prevState,
                      loading: false,
                    }))
                  );
                  animateSlideOut(popupAnimations["loadingRight"]);
                  setSelectedTaskId(null);
                  setMinimalPopupMessage("Tarefas apagadas!");
                  setPopups((prevState) => ({
                    ...prevState,
                    success: true,
                  }));
                  animateOpening(popupAnimations["success"]);
                  animateSlideIn(popupAnimations["successRight"]);
                  purgeTasks().catch(() => {
                    setErrorMessage(
                      "Não foi possível limpar as tarefas na nuvem!\nPor favor, contate o desenvolvedor."
                    );
                    setPopups((prevState) => ({
                      ...prevState,
                      error: true,
                    }));
                    animateOpening(popupAnimations["error"]);
                  });
                })
                .catch(() => {
                  setErrorMessage(
                    "Não foi possível limpar as tarefas no dispositivo!\nPor favor, contate o desenvolvedor."
                  );
                  setPopups((prevState) => ({
                    ...prevState,
                    error: true,
                  }));
                  animateOpening(popupAnimations["error"]);
                });
            }}
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
            iconName={"question"}
            title={"Sair do Gentask"}
            description={"Isso fechará o app. Tem certeza?"}
            actionName={"Sair"}
            action={() => BackHandler.exitApp()}
          />
        </Animated.View>
      )}
      {popups.loading && (
        <MinimalPopup
          loading={true}
          customTop={40}
          opacityAnimation={popupAnimations.loading}
          rightAnimation={popupAnimations.loadingRight}
          message={"Salvando tarefa..."}
        />
      )}
      {popups.success && (
        <MinimalPopup
          customTop={40}
          opacityAnimation={popupAnimations.success}
          rightAnimation={popupAnimations.successRight}
          color={styles.minimalPopupSuccess.backgroundColor}
          close={() => {
            animateClosing(popupAnimations["success"], () =>
              setPopups((prevState) => ({
                ...prevState,
                success: false,
              }))
            );
            animateSlideOut(popupAnimations["successRight"]);
          }}
          message={minimalPopupMessage}
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
            iconName={"info"}
            title={"Erro"}
            description={errorMessage}
            actionName={"OK"}
            action={() => null}
            error={true}
          />
        </Animated.View>
      )}
      {popups.settings && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: popupAnimations.settings }]}
        >
          <SettingsPopup
            close={() => {
              animateClosing(popupAnimations["settings"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  settings: false,
                }))
              );
            }}
            openTaskClearPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                taskClear: true,
              }));
              animateOpening(popupAnimations["taskClear"]);
            }}
            openLogoutPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                logout: true,
              }));
              animateOpening(popupAnimations["logout"]);
            }}
          />
        </Animated.View>
      )}
      {popups.logout && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: popupAnimations.logout }]}
        >
          <MessagePopup
            close={() => {
              animateClosing(popupAnimations["logout"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  logout: false,
                }))
              );
            }}
            iconName={"logout"}
            title={"Fazer logout"}
            description={"Você será desconectado. Tem certeza?"}
            actionName={"Logout"}
            action={() => {
              logout()
                .then(() => {
                  props.setTrashScreenActive(false);
                  setAuthConfirmMessage("Deslogado com sucesso!");
                  setAuthConfirmPopups((prevState) => ({
                    ...prevState,
                    logout: true,
                  }));
                  animateOpening(authConfirmPopupAnimations["logout"]);
                  animateSlideIn(authConfirmPopupAnimations["logoutRight"]);
                })
                .catch((error) => {
                  setErrorMessage(
                    `Não foi possível fazer logout!\n${error.message}`
                  );
                  setPopups((prevState) => ({
                    ...prevState,
                    error: true,
                  }));
                  animateOpening(popupAnimations["error"]);
                });
            }}
          />
        </Animated.View>
      )}
      <StatusBar
        style={styles.statusBar.style}
        backgroundColor={styles.statusBar.backgroundColor}
        translucent={false}
      />
    </View>
  );
}

export default TrashScreen;
