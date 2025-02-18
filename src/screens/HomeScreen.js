import { useRef, useState, useEffect, useContext } from "react";
import {
  View,
  Animated,
  BackHandler,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import NetInfo from "@react-native-community/netinfo";
import {
  eraseTasks,
  getTasks,
  storeTasks,
  syncOfflineTasks,
} from "../services/storage";
import { logout } from "../services/firebase/auth";
import {
  deleteTask,
  fetchTasks,
  modifyTask,
  purgeTasks,
} from "../services/firebase/firestore";
import { getTaskSuggestion } from "../services/aiService";
import { ThemeContext } from "../contexts/ThemeContext";
import { AuthConfirmMessagesContext } from "../contexts/AuthConfirmMessagesContext";
import Menu from "../components/Menu";
import TopBar from "../components/TopBar";
import FilteringBar from "../components/FilteringBar";
import TaskContainer from "../components/TaskContainer";
import CategoryPickerPopup from "../components/CategoryPickerPopup";
import SortPickerPopup from "../components/SortPickerPopup";
import TaskViewPopup from "../components/TaskViewPopup";
import TaskCreationPopup from "../components/TaskCreationPopup";
import TaskAnalysisPopup from "../components/TaskAnalysisPopup";
import TaskSuggestionPopup from "../components/TaskSuggestionPopup";
import ChatbotPopup from "../components/ChatbotPopup";
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

function HomeScreen() {
  const { styles } = useContext(ThemeContext);
  const {
    authConfirmMessage,
    setAuthConfirmMessage,
    authConfirmPopups,
    setAuthConfirmPopups,
    authConfirmPopupAnimations,
  } = useContext(AuthConfirmMessagesContext);

  const didFetch = useRef(false);

  const [tasks, setTasks] = useState(null);
  const [didTasksLoad, setTasksLoad] = useState(false);
  const [sortedTasks, setSortedTasks] = useState(null);
  const [foundTasks, setFoundTasks] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState({
    name: "Tudo",
    color: "grey",
  });
  const [selectedSort, setSelectedSort] = useState("created_asc");
  const [pendingTasksFirst, setPendingTasksFirst] = useState(false);
  const [completedTasksFirst, setCompletedTasksFirst] = useState(false);
  const [urgentTasksFirst, setUrgentTasksFirst] = useState(true);

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskAnalysisMode, setTaskAnalysisMode] = useState(null);

  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuAnimation = useRef(new Animated.Value(-MENU_DRAWER_WIDTH)).current;

  const [didTaskSuggestionPopupJustOpen, setTaskSuggestionPopupJustOpen] =
    useState(false);
  const [didUserAcceptTaskSuggestion, setUserAcceptTaskSuggestion] =
    useState(false);
  const [taskSuggestionText, setTaskSuggestionText] = useState("");
  const [minimalPopupMessage, setMinimalPopupMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [popups, setPopups] = useState({
    categoryPicker: false,
    sortPicker: false,
    chatbot: false,
    taskAnalysis: false,
    taskView: false,
    taskCreation: false,
    taskRemoval: false,
    taskDiscard: false,
    taskClear: false,
    taskSuggestion: false,
    exit: false,
    loading: false,
    success: false,
    noText: false,
    error: false,
    settings: false,
    logout: false,
  });

  const [popupAnimations] = useState({
    categoryPicker: new Animated.Value(0),
    sortPicker: new Animated.Value(0),
    chatbot: new Animated.Value(0),
    taskAnalysis: new Animated.Value(0),
    taskView: new Animated.Value(0),
    taskCreation: new Animated.Value(0),
    taskRemoval: new Animated.Value(0),
    taskDiscard: new Animated.Value(0),
    taskClear: new Animated.Value(0),
    taskSuggestion: new Animated.Value(0),
    taskSuggestionRight: new Animated.Value(0),
    exit: new Animated.Value(0),
    loading: new Animated.Value(0),
    loadingRight: new Animated.Value(0),
    success: new Animated.Value(0),
    successRight: new Animated.Value(0),
    noText: new Animated.Value(0),
    noTextRight: new Animated.Value(0),
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
      if (isConnected) {
        await syncOfflineTasks();
      }
      fetchTasks()
        .then(async (data) => {
          if (isConnected) {
            await eraseTasks();
            if (data) {
              setTasks(data);
            }
          }
        })
        .catch(() => {
          setErrorMessage("Não foi possível carregar as tarefas da nuvem!");
          setPopups((prevState) => ({
            ...prevState,
            error: true,
          }));
          animateOpening(popupAnimations["error"]);
        })
        .finally(async () => {
          const localData = await getTasks();
          if (localData) setTasks(localData);
          didFetch.current = true;
          setTasksLoad(true);
        });
    });
  }, []);

  useEffect(() => {
    if (didFetch.current) {
      storeTasks(tasks);
    }
  }, [tasks]);

  useEffect(() => {
    if (popups.taskSuggestion && didTaskSuggestionPopupJustOpen) {
      setTaskSuggestionPopupJustOpen(false);
    } else if (popups.taskSuggestion) {
      animateClosing(popupAnimations["taskSuggestion"], () =>
        setPopups((prevState) => ({
          ...prevState,
          taskSuggestion: false,
        }))
      );
      animateSlideOut(popupAnimations["taskSuggestionRight"]);
    }
  }, [popups, isMenuOpen]);

  useEffect(() => {
    if (didTasksLoad && Object.keys(tasks).length !== 0) {
      getTaskSuggestion(tasks).then((suggestion) => {
        if (suggestion) {
          setTaskSuggestionText(suggestion);
          setPopups((prevState) => ({
            ...prevState,
            taskSuggestion: true,
          }));
          animateOpening(popupAnimations["taskSuggestion"]);
          animateSlideIn(popupAnimations["taskSuggestionRight"]);
          setTaskSuggestionPopupJustOpen(true);
        }
      });
    }
  }, [didTasksLoad]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <TopBar
        openMenu={openMenu}
        sortedTasks={sortedTasks}
        setFoundTasks={setFoundTasks}
      />
      <FilteringBar
        tasks={tasks}
        setSortedTasks={setSortedTasks}
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
      <TaskContainer
        foundTasks={foundTasks}
        setTasks={setTasks}
        didTasksLoad={didTasksLoad}
        emptyMessage={
          !tasks || Object.keys(tasks).length === 0
            ? "Nenhuma tarefa cadastrada!"
            : foundTasks &&
              Object.keys(foundTasks).length === 0 &&
              "Nenhuma tarefa encontrada!"
        }
        openCreatePopup={() => {
          setPopups((prevState) => ({
            ...prevState,
            taskCreation: true,
          }));
          animateOpening(popupAnimations["taskCreation"]);
        }}
        taskViewPopup={(taskId) => {
          setSelectedTaskId(taskId);
          setPopups((prevState) => ({
            ...prevState,
            taskView: true,
          }));
          animateOpening(popupAnimations["taskView"]);
        }}
        delete={(taskId) => {
          setSelectedTaskId(taskId);
          setPopups((prevState) => ({
            ...prevState,
            taskRemoval: true,
          }));
          animateOpening(popupAnimations["taskRemoval"]);
        }}
        checkCompleted={(taskId) => {
          const updatedTasks = { ...tasks };
          const updatedTask = updatedTasks[taskId];
          if (updatedTask) {
            updatedTask.isCompleted = !updatedTask.isCompleted;
            updatedTask.updatedAt = Date.now();
            updatedTasks[taskId] = updatedTask;
            setTasks(updatedTasks);
            modifyTask(taskId, updatedTask).catch(() => {
              setErrorMessage(
                "Não foi possível atualizar a tarefa na nuvem!\nA tarefa foi modificada localmente."
              );
              setPopups((prevState) => ({
                ...prevState,
                error: true,
              }));
              animateOpening(popupAnimations["error"]);
            });
          }
        }}
        isTaskAnalysisButtonActive={tasks && Object.keys(tasks).length !== 0}
        openChatbot={() => {
          setPopups((prevState) => ({
            ...prevState,
            chatbot: true,
          }));
          animateOpening(popupAnimations["chatbot"]);
        }}
        openWeeklyTaskAnalysis={() => {
          setTaskAnalysisMode("weekly");
          setPopups((prevState) => ({
            ...prevState,
            taskAnalysis: true,
          }));
          animateOpening(popupAnimations["taskAnalysis"]);
        }}
        openMonthlyTaskAnalysis={() => {
          setTaskAnalysisMode("monthly");
          setPopups((prevState) => ({
            ...prevState,
            taskAnalysis: true,
          }));
          animateOpening(popupAnimations["taskAnalysis"]);
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
      {popups.chatbot && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: popupAnimations.chatbot }]}
        >
          <ChatbotPopup
            close={() => {
              animateClosing(popupAnimations["chatbot"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  chatbot: false,
                }))
              );
            }}
            data={tasks}
          />
        </Animated.View>
      )}
      {popups.taskAnalysis && (
        <Animated.View
          style={[
            styles.fullscreenArea,
            { opacity: popupAnimations.taskAnalysis },
          ]}
        >
          <TaskAnalysisPopup
            close={() => {
              animateClosing(popupAnimations["taskAnalysis"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  taskAnalysis: false,
                }))
              );
            }}
            tasks={tasks}
            taskAnalysisMode={taskAnalysisMode}
          />
        </Animated.View>
      )}
      {popups.taskView && (
        <Animated.View
          style={[styles.fullscreenArea, { opacity: popupAnimations.taskView }]}
        >
          <TaskViewPopup
            close={() => {
              animateClosing(popupAnimations["taskView"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  taskView: false,
                }))
              );
            }}
            openDiscardPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                taskDiscard: true,
              }));
              animateOpening(popupAnimations["taskDiscard"]);
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
              setMinimalPopupMessage("Tarefa atualizada!");
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
            setErrorMessage={setErrorMessage}
            openErrorPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                error: true,
              }));
              animateOpening(popupAnimations["error"]);
            }}
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            selectedTask={tasks[selectedTaskId]}
            setTasks={setTasks}
          />
        </Animated.View>
      )}
      {popups.taskCreation && (
        <Animated.View
          style={[
            styles.fullscreenArea,
            { opacity: popupAnimations.taskCreation },
          ]}
        >
          <TaskCreationPopup
            close={() => {
              animateClosing(popupAnimations["taskCreation"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  taskCreation: false,
                }))
              );
            }}
            openDiscardPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                taskDiscard: true,
              }));
              animateOpening(popupAnimations["taskDiscard"]);
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
              setMinimalPopupMessage("Tarefa adicionada!");
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
            setErrorMessage={setErrorMessage}
            openErrorPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                error: true,
              }));
              animateOpening(popupAnimations["error"]);
            }}
            isAnyTaskCreated={tasks != null}
            setTasks={setTasks}
            taskSuggestion={
              didUserAcceptTaskSuggestion ? taskSuggestionText : null
            }
          />
        </Animated.View>
      )}
      {popups.taskRemoval && (
        <Animated.View
          style={[
            styles.fullscreenArea,
            { opacity: popupAnimations.taskRemoval },
          ]}
        >
          <MessagePopup
            close={() => {
              animateClosing(popupAnimations["taskRemoval"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  taskRemoval: false,
                }))
              );
            }}
            iconName={"trash"}
            title={"Deletar tarefa"}
            description={"Isso apagará a tarefa selecionada. Tem certeza?"}
            actionName={"Deletar"}
            action={() => {
              const updatedTasks = { ...tasks };
              const deletedTask = updatedTasks[selectedTaskId];
              delete updatedTasks[selectedTaskId];
              setTasks(updatedTasks);
              setSelectedTaskId(null);
              setMinimalPopupMessage("Tarefa removida!");
              setTimeout(
                () => {
                  setPopups((prevState) => ({
                    ...prevState,
                    success: true,
                  }));
                  animateOpening(popupAnimations["success"]);
                  animateSlideIn(popupAnimations["successRight"]);
                },
                popups.taskRemoval ? 500 : 0
              );
              deleteTask(selectedTaskId, deletedTask).catch(() => {
                setErrorMessage(
                  "Não foi possível atualizar a tarefa na nuvem!\nA tarefa foi modificada localmente."
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
      {popups.taskDiscard && (
        <Animated.View
          style={[
            styles.fullscreenArea,
            { opacity: popupAnimations.taskDiscard },
          ]}
        >
          <MessagePopup
            close={() => {
              animateClosing(popupAnimations["taskDiscard"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  taskDiscard: false,
                }))
              );
            }}
            iconName={"close"}
            title={"Descartar tarefa"}
            description={"Todo o conteúdo inserido será perdido. Tem certeza?"}
            actionName={"Sim"}
            action={() => {
              animateClosing(popupAnimations["taskView"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  taskView: false,
                }))
              );
              animateClosing(popupAnimations["taskCreation"], () =>
                setPopups((prevState) => ({
                  ...prevState,
                  taskCreation: false,
                }))
              );
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
            iconName={"fire"}
            title={"Limpar tarefas"}
            description={
              "Isso apagará todas as tarefas cadastradas. Tem certeza?"
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
                  setTasks(null);
                  setSortedTasks(null);
                  setFoundTasks(null);
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
      {popups.taskSuggestion && (
        <TaskSuggestionPopup
          opacityAnimation={popupAnimations.taskSuggestion}
          rightAnimation={popupAnimations.taskSuggestionRight}
          close={() => {
            animateClosing(popupAnimations["taskSuggestion"], () =>
              setPopups((prevState) => ({
                ...prevState,
                taskSuggestion: false,
              }))
            );
            animateSlideOut(popupAnimations["taskSuggestionRight"]);
          }}
          action={() => {
            setUserAcceptTaskSuggestion(true);
            setPopups((prevState) => ({
              ...prevState,
              taskCreation: true,
            }));
            animateOpening(popupAnimations["taskCreation"]);
          }}
          suggestion={taskSuggestionText}
        />
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
          message={"Por favor, insira algum texto!"}
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
      {authConfirmPopups.signIn && (
        <MinimalPopup
          opacityAnimation={authConfirmPopupAnimations.signIn}
          rightAnimation={authConfirmPopupAnimations.signInRight}
          color={styles.minimalPopupSuccess.backgroundColor}
          close={() => {
            animateClosing(authConfirmPopupAnimations["signIn"], () => {
              setAuthConfirmPopups((prevState) => ({
                ...prevState,
                signIn: false,
              }));
            });
            animateSlideOut(authConfirmPopupAnimations["signInRight"]);
          }}
          message={authConfirmMessage}
        />
      )}
      {authConfirmPopups.signUp && (
        <MinimalPopup
          opacityAnimation={authConfirmPopupAnimations.signUp}
          rightAnimation={authConfirmPopupAnimations.signUpRight}
          color={styles.minimalPopupSuccess.backgroundColor}
          close={() => {
            animateClosing(authConfirmPopupAnimations["signUp"], () => {
              setAuthConfirmPopups((prevState) => ({
                ...prevState,
                signUp: false,
              }));
            });
            animateSlideOut(authConfirmPopupAnimations["signUpRight"]);
          }}
          message={authConfirmMessage}
        />
      )}
      <StatusBar
        style={styles.statusBar.style}
        backgroundColor={styles.statusBar.backgroundColor}
        translucent={false}
      />
    </View>
  );
}

export default HomeScreen;
