import { useRef, useState, useEffect, useContext } from "react";
import { View, Animated, BackHandler, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { eraseData, getData, storeData } from "../services/storage";
import { ThemeContext } from "../contexts/ThemeContext";
import Menu from "../components/Menu";
import TopBar from "../components/TopBar";
import FilteringBar from "../components/FilteringBar";
import TaskContainer from "../components/TaskContainer";
import CategoryPickerPopup from "../components/CategoryPickerPopup";
import SortPickerPopup from "../components/SortPickerPopup";
import TaskViewPopup from "../components/TaskViewPopup";
import TaskCreationPopup from "../components/TaskCreationPopup";
import TaskAnalysisPopup from "../components/TaskAnalysisPopup";
import MessagePopup from "../components/MessagePopup";
import MinimalPopup from "../components/MinimalPopup";
import SettingsPopup from "../components/SettingsPopup";
import {
  animateOpening,
  animateClosing,
  animateSlideIn,
  animateSlideOut,
} from "../utils/animationUtils";

function HomeScreen() {
  const { styles } = useContext(ThemeContext);
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

  const [openMenu, setOpenMenu] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(0));
  const [menuLeftAnimation] = useState(new Animated.Value(0));
  const [minimalPopupMessage, setMinimalPopupMessage] = useState("");

  const [popups, setPopups] = useState({
    categoryPicker: false,
    sortPicker: false,
    taskAnalysis: false,
    taskView: false,
    taskCreation: false,
    taskRemoval: false,
    taskDiscard: false,
    taskClear: false,
    exit: false,
    loading: false,
    success: false,
    noText: false,
    error: false,
    settings: false,
  });

  const [popupAnimations] = useState({
    categoryPicker: new Animated.Value(0),
    sortPicker: new Animated.Value(0),
    taskAnalysis: new Animated.Value(0),
    taskView: new Animated.Value(0),
    taskCreation: new Animated.Value(0),
    taskRemoval: new Animated.Value(0),
    taskDiscard: new Animated.Value(0),
    taskClear: new Animated.Value(0),
    exit: new Animated.Value(0),
    loading: new Animated.Value(0),
    loadingRight: new Animated.Value(0),
    success: new Animated.Value(0),
    successRight: new Animated.Value(0),
    noText: new Animated.Value(0),
    noTextRight: new Animated.Value(0),
    error: new Animated.Value(0),
    settings: new Animated.Value(0),
  });

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
    getData().then((data) => {
      if (data) setTasks(data);
      didFetch.current = true;
      setTasksLoad(true);
    });
  }, []);

  useEffect(() => {
    if (didFetch.current) {
      storeData(tasks);
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
            openSettingsPopup={() => {
              setPopups((prevState) => ({
                ...prevState,
                settings: true,
              }));
              animateOpening(popupAnimations["settings"]);
            }}
          />
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
            isAnyTaskCreated={tasks != null}
            setTasks={setTasks}
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
            title={"Deletar tarefa"}
            description={"Isso apagará a tarefa selecionada. Tem certeza?"}
            actionName={"Deletar"}
            action={() => {
              const updatedTasks = { ...tasks };
              delete updatedTasks[selectedTaskId];
              setTasks(updatedTasks);
              setSelectedTaskId(null);
              setMinimalPopupMessage("Tarefa removida!");
              setPopups((prevState) => ({
                ...prevState,
                success: true,
              }));
              animateOpening(popupAnimations["success"]);
              animateSlideIn(popupAnimations["successRight"]);
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
              eraseData().then((wasDataErased) => {
                animateClosing(popupAnimations["loading"], () =>
                  setPopups((prevState) => ({
                    ...prevState,
                    loading: false,
                  }))
                );
                animateSlideOut(popupAnimations["loadingRight"]);
                if (wasDataErased) {
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
                } else {
                  Alert.alert(
                    "Erro",
                    "Ocorreu um erro ao limpar tarefas. Por favor, contate o desenvolvedor!"
                  );
                }
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
            title={"Sair do MyTasks"}
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
          color={styles.minimalPopupNoText.backgroundColor}
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
      {/* Ainda não usado */}
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
            title={"Erro"}
            description={"Ocorreu um erro!"}
            actionName={"OK"}
            action={() => null}
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
          />
        </Animated.View>
      )}
      <TopBar
        openMenu={() => {
          setOpenMenu(true);
          animateOpening(menuAnimation);
          animateSlideIn(menuLeftAnimation);
        }}
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
          if (updatedTasks[taskId]) {
            updatedTasks[taskId].isCompleted =
              !updatedTasks[taskId].isCompleted;
            setTasks(updatedTasks);
          }
        }}
        isTaskAnalysisButtonActive={tasks && Object.keys(tasks).length !== 0}
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
      <StatusBar
        style={styles.statusBar.style}
        backgroundColor={styles.statusBar.backgroundColor}
        translucent={false}
      />
    </View>
  );
}

export default HomeScreen;
