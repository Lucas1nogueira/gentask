import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addTask,
  deleteTask,
  getDeletedTask,
  getTask,
  modifyTask,
} from "./firebase/firestore";
import NetInfo from "@react-native-community/netinfo";

const TASKS_STORAGE_KEY = "@myTasks:tasks";
const OFFLINE_TASKS_STORAGE_KEY = "@myTasks:offlineTasks";
const DELETED_OFFLINE_TASKS_STORAGE_KEY = "@myTasks:deletedOfflineTasks";
const THEME_STORAGE_KEY = "@myTasks:darkMode";

export async function syncOfflineTasks() {
  try {
    const [offlineTasksRaw, deletedTasksRaw] = await Promise.all([
      AsyncStorage.getItem(OFFLINE_TASKS_STORAGE_KEY),
      AsyncStorage.getItem(DELETED_OFFLINE_TASKS_STORAGE_KEY),
    ]);
    const offlineTasks = offlineTasksRaw ? JSON.parse(offlineTasksRaw) : {};
    const deletedOfflineTasks = deletedTasksRaw
      ? JSON.parse(deletedTasksRaw)
      : {};

    for (const [id, task] of Object.entries(offlineTasks)) {
      try {
        const firestoreTask = await getTask(id);

        if (!firestoreTask) {
          const firestoreDeletedTask = await getDeletedTask(id);

          if (!firestoreDeletedTask) {
            await addTask(id, task, true);
          } else {
            const firestoreDate = firestoreDeletedTask.updatedAt;
            const localDate = task.updatedAt;

            if (localDate > firestoreDate) {
              await addTask(id, task, true);
            }
          }
        } else {
          const firestoreDate = firestoreTask.updatedAt;
          const localDate = task.updatedAt;

          if (localDate > firestoreDate) {
            await modifyTask(id, task, true);
          }
        }

        delete offlineTasks[id];
        await AsyncStorage.setItem(
          OFFLINE_TASKS_STORAGE_KEY,
          JSON.stringify(offlineTasks)
        );
      } catch (error) {
        console.error(`Error syncing task ${id}: ${error}`);
      }
    }

    for (const [id, task] of Object.entries(deletedOfflineTasks)) {
      try {
        const firestoreTask = await getTask(id);

        if (firestoreTask) {
          const firestoreDate = firestoreTask.updatedAt;
          const localDate = task.updatedAt;

          if (localDate > firestoreDate) {
            await deleteTask(id, task, true);
          }
        }

        delete deletedOfflineTasks[id];
        await AsyncStorage.setItem(
          DELETED_OFFLINE_TASKS_STORAGE_KEY,
          JSON.stringify(deletedOfflineTasks)
        );
      } catch (error) {
        console.error(`Error syncing deleted task ${id}: ${error}`);
      }
    }
  } catch (error) {
    console.error(`Global sync error: ${error}`);
  }
}

export async function storeOfflineTask(id, task) {
  try {
    const offlineTasks = await AsyncStorage.getItem(OFFLINE_TASKS_STORAGE_KEY);
    const offlineTasksObject = offlineTasks ? JSON.parse(offlineTasks) : {};
    offlineTasksObject[id] = task;
    await AsyncStorage.setItem(
      OFFLINE_TASKS_STORAGE_KEY,
      JSON.stringify(offlineTasksObject)
    );
  } catch (error) {
    console.error(`Error storing offline task ${id}: ${error}`);
  }
}

export async function storeDeletedOfflineTask(id, task) {
  try {
    task.updatedAt = Date.now();
    const deletedOfflineTasks = await AsyncStorage.getItem(
      DELETED_OFFLINE_TASKS_STORAGE_KEY
    );
    const deletedOfflineTasksObject = deletedOfflineTasks
      ? JSON.parse(deletedOfflineTasks)
      : {};
    deletedOfflineTasksObject[id] = task;
    await AsyncStorage.setItem(
      DELETED_OFFLINE_TASKS_STORAGE_KEY,
      JSON.stringify(deletedOfflineTasksObject)
    );
  } catch (error) {
    console.error(`Error storing offline deleted task ${id}: ${error}`);
  }
}

export async function storeTasks(tasks) {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error(`Error saving data: ${error}`);
  }
}

export async function getTasks() {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error retrieving data ${error}`);
  }
}

export async function eraseTasks() {
  const netState = await NetInfo.fetch();
  const tasks = await getTasks();

  try {
    if (!netState.isConnected && tasks && Object.keys(tasks).length > 0) {
      for (const [id, task] of Object.entries(tasks)) {
        try {
          await storeDeletedOfflineTask(id, task);
        } catch (error) {
          console.error(
            `Error preparing to store offline deleted task ${id}: ${error}`
          );
        }
      }
    }

    await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
  } catch (error) {
    console.error(`Error erasing data ${error}`);
  }
}

export async function saveTheme(theme) {
  try {
    const jsonValue = JSON.stringify(theme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error(`Error saving theme: ${error}`);
  }
}

export async function getTheme() {
  try {
    const jsonValue = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    } else {
      return false;
    }
  } catch (error) {
    console.error(`Error retrieving theme ${error}`);
  }
}
