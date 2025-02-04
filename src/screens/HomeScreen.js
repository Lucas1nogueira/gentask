import { useRef, useState, useEffect } from "react";
import { View, Animated, BackHandler } from "react-native";
import { StatusBar } from "expo-status-bar";
import Menu from "../components/Menu";
import TopBar from "../components/TopBar";
import FilteringBar from "../components/FilteringBar";
import TasksContainer from "../components/TasksContainer";
import CategoryPickerPopup from "../components/CategoryPickerPopup";
import SortPickerPopup from "../components/SortPickerPopup";
import TaskViewPopup from "../components/TaskViewPopup";
import CreateTaskPopup from "../components/CreateTaskPopup";
import MessagePopup from "../components/MessagePopup";
import MinimalPopup from "../components/MinimalPopup";
import SettingsPopup from "../components/SettingsPopup";
import { getValueFor, save } from "../services/storage";
import {
  animateOpening,
  animateClosing,
  animateSlideIn,
  animateSlideOut,
} from "../utils/animationUtils";
import styles from "../styles/styles";

function HomeScreen() {
  const didFetch = useRef(false);

  const [tasks, setTasks] = useState(null);
  const [didTasksLoad, setTasksLoad] = useState(false);
  const [sortedTasks, setSortedTasks] = useState(null);
  const [foundTasks, setFoundTasks] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState({
    name: "Tudo",
    color: "white",
  });
  const [selectedSort, setSelectedSort] = useState("created_asc");
  const [pendingTasksFirst, setPendingTasksFirst] = useState(false);
  const [completedTasksFirst, setCompletedTasksFirst] = useState(false);
  const [urgentTasksFirst, setUrgentTasksFirst] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [openMenu, setOpenMenu] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(0));
  const [menuLeftAnimation] = useState(new Animated.Value(0));
  const [minimalPopupMessage, setMinimalPopupMessage] = useState("");

  const [popups, setPopups] = useState({
    categoryPicker: false,
    sortPicker: false,
    view: false,
    create: false,
    exit: false,
    delete: false,
    discard: false,
    loading: false,
    success: false,
    noText: false,
    error: false,
    settings: false,
  });

  const [popupAnimations] = useState({
    categoryPicker: new Animated.Value(0),
    sortPicker: new Animated.Value(0),
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
    getValueFor("tasks").then((data) => {
      if (data) setTasks(data);
      didFetch.current = true;
      setTasksLoad(true);
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
            defaultOption={{ name: "Tudo", color: "white" }}
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
            title={"Deletar tarefa"}
            description={"Isso apagará a tarefa selecionada. Tem certeza?"}
            actionName={"Deletar"}
            actionButtonColor={"#470c0c"}
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
            title={"Descartar tarefa"}
            description={"Todo o conteúdo inserido será perdido. Tem certeza?"}
            actionName={"Sim"}
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
            actionButtonColor={"#470c0c"}
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
      <TasksContainer
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
            create: true,
          }));
          animateOpening(popupAnimations["create"]);
        }}
        taskViewPopup={(taskId) => {
          setSelectedTaskId(taskId);
          setPopups((prevState) => ({
            ...prevState,
            view: true,
          }));
          animateOpening(popupAnimations["view"]);
        }}
        delete={(taskId) => {
          setSelectedTaskId(taskId);
          setPopups((prevState) => ({
            ...prevState,
            delete: true,
          }));
          animateOpening(popupAnimations["delete"]);
        }}
        checkCompleted={(taskId) => {
          const updatedTasks = { ...tasks };
          if (updatedTasks[taskId]) {
            updatedTasks[taskId].isCompleted =
              !updatedTasks[taskId].isCompleted;
            setTasks(updatedTasks);
          }
        }}
      />
      <StatusBar style="light" translucent={false} />
    </View>
  );
}

export default HomeScreen;
