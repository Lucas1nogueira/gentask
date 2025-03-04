import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addTask,
  moveTaskToTrash,
  getTrashedTask,
  getTask,
  modifyTask,
  getPermanentlyDeletedTask,
  permanentlyDeleteTask,
  modifyTrashedTask,
  restorePermanentlyDeletedTask,
  addTrashedTask,
  moveTaskDirectlyToPermanentlyDeletedTasks,
  restoreTrashedTask,
  fullRestoreTask,
  addPermanentlyDeletedTask,
} from "./firebase/firestore";
import NetInfo from "@react-native-community/netinfo";

const TASKS_STORAGE_KEY = "@gentask:tasks";
const OFFLINE_TASKS_STORAGE_KEY = "@gentask:offlineTasks";

const TRASHED_TASKS_STORAGE_KEY = "@gentask:trashedTasks";
const OFFLINE_TRASHED_TASKS_STORAGE_KEY = "@gentask:offlineTrashedTasks";

const OFFLINE_PERMANENTLY_DELETED_TASKS_STORAGE_KEY =
  "@gentask:offlinePermanentlyDeletedTasks";

const THEME_STORAGE_KEY = "@gentask:darkMode";
const FIRST_USE_STORAGE_KEY = "@gentask:firstUse";

export async function syncOfflineTasks() {
  try {
    const [
      offlineTasksRaw,
      offlineTrashedTasksRaw,
      permanentlyDeletedTasksRaw,
    ] = await Promise.all([
      AsyncStorage.getItem(OFFLINE_TASKS_STORAGE_KEY),
      AsyncStorage.getItem(OFFLINE_TRASHED_TASKS_STORAGE_KEY),
      AsyncStorage.getItem(OFFLINE_PERMANENTLY_DELETED_TASKS_STORAGE_KEY),
    ]);
    const offlineTasks = offlineTasksRaw ? JSON.parse(offlineTasksRaw) : {};
    const offlineTrashedTasks = offlineTrashedTasksRaw
      ? JSON.parse(offlineTrashedTasksRaw)
      : {};
    const offlinePermanentlyDeletedTasks = permanentlyDeletedTasksRaw
      ? JSON.parse(permanentlyDeletedTasksRaw)
      : {};

    for (const [id, task] of Object.entries(offlineTasks)) {
      try {
        const firestoreTask = await getTask(id);

        if (!firestoreTask) {
          const firestoreTrashedTask = await getTrashedTask(id);

          if (!firestoreTrashedTask) {
            const firestorePermanentlyDeletedTask =
              await getPermanentlyDeletedTask(id);

            if (!firestorePermanentlyDeletedTask) {
              await addTask(id, task, true);
            } else {
              const firestoreDate = firestorePermanentlyDeletedTask.updatedAt;
              const localDate = task.updatedAt;

              if (localDate > firestoreDate) {
                await fullRestoreTask(id, task, true);
              }
            }
          } else {
            const firestoreDate = firestoreTrashedTask.updatedAt;
            const localDate = task.updatedAt;

            if (localDate > firestoreDate) {
              await restoreTrashedTask(id, task, true);
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

    for (const [id, task] of Object.entries(offlineTrashedTasks)) {
      try {
        const firestoreTask = await getTask(id);

        if (!firestoreTask) {
          const firestoreTrashedTask = await getTrashedTask(id);

          if (!firestoreTrashedTask) {
            const firestorePermanentlyDeletedTask =
              await getPermanentlyDeletedTask(id);

            if (!firestorePermanentlyDeletedTask) {
              await addTrashedTask(id, task, true);
            } else {
              const firestoreDate = firestorePermanentlyDeletedTask.updatedAt;
              const localDate = task.updatedAt;

              if (localDate > firestoreDate) {
                await restorePermanentlyDeletedTask(id, task, true);
              }
            }
          } else {
            const firestoreDate = firestoreTrashedTask.updatedAt;
            const localDate = task.updatedAt;

            if (localDate > firestoreDate) {
              await modifyTrashedTask(id, task, true);
            }
          }
        } else {
          const firestoreDate = firestoreTask.updatedAt;
          const localDate = task.updatedAt;

          if (localDate > firestoreDate) {
            await moveTaskToTrash(id, task, true);
          }
        }

        delete offlineTrashedTasks[id];
        await AsyncStorage.setItem(
          OFFLINE_TRASHED_TASKS_STORAGE_KEY,
          JSON.stringify(offlineTrashedTasks)
        );
      } catch (error) {
        console.error(`Error syncing trashed task ${id}: ${error}`);
      }
    }

    for (const [id, task] of Object.entries(offlinePermanentlyDeletedTasks)) {
      try {
        const firestoreTask = await getTask(id);

        if (!firestoreTask) {
          const firestoreTrashedTask = await getTrashedTask(id);

          if (!firestoreTrashedTask) {
            const firestorePermanentlyDeletedTask =
              await getPermanentlyDeletedTask(id);

            if (!firestorePermanentlyDeletedTask) {
              addPermanentlyDeletedTask(id, task);
            }
          } else {
            const firestoreDate = firestoreTrashedTask.updatedAt;
            const localDate = task.updatedAt;

            if (localDate > firestoreDate) {
              await permanentlyDeleteTask(id, task, true);
            }
          }
        } else {
          const firestoreDate = firestoreTask.updatedAt;
          const localDate = task.updatedAt;

          if (localDate > firestoreDate) {
            await moveTaskDirectlyToPermanentlyDeletedTasks(id, task, true);
          }
        }

        delete offlinePermanentlyDeletedTasks[id];
        await AsyncStorage.setItem(
          OFFLINE_PERMANENTLY_DELETED_TASKS_STORAGE_KEY,
          JSON.stringify(offlinePermanentlyDeletedTasks)
        );
      } catch (error) {
        console.error(`Error syncing permanently deleted task ${id}: ${error}`);
      }
    }
  } catch (error) {
    console.error(`Global sync error: ${error}`);
  }
}

export async function storeOfflineTask(id, task) {
  try {
    task.updatedAt = Date.now();
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

export async function storeOfflineTrashedTask(id, task) {
  try {
    task.updatedAt = Date.now();
    const offlineTrashedTasks = await AsyncStorage.getItem(
      OFFLINE_TRASHED_TASKS_STORAGE_KEY
    );
    const offlineTrashedTasksObject = offlineTrashedTasks
      ? JSON.parse(offlineTrashedTasks)
      : {};
    offlineTrashedTasksObject[id] = task;
    await AsyncStorage.setItem(
      OFFLINE_TRASHED_TASKS_STORAGE_KEY,
      JSON.stringify(offlineTrashedTasksObject)
    );
  } catch (error) {
    console.error(`Error storing offline trashed task ${id}: ${error}`);
  }
}

export async function storeOfflinePermanentlyDeletedTask(id, task) {
  try {
    task.updatedAt = Date.now();
    const deletedOfflineTasks = await AsyncStorage.getItem(
      OFFLINE_PERMANENTLY_DELETED_TASKS_STORAGE_KEY
    );
    const deletedOfflineTasksObject = deletedOfflineTasks
      ? JSON.parse(deletedOfflineTasks)
      : {};
    deletedOfflineTasksObject[id] = task;
    await AsyncStorage.setItem(
      OFFLINE_PERMANENTLY_DELETED_TASKS_STORAGE_KEY,
      JSON.stringify(deletedOfflineTasksObject)
    );
  } catch (error) {
    console.error(
      `Error storing offline permanently deleted task ${id}: ${error}`
    );
  }
}

export async function storeTasks(tasks) {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error(`Error saving tasks: ${error}`);
  }
}

export async function storeTask(id, task) {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    let tasks = jsonValue ? JSON.parse(jsonValue) : {};
    tasks[id] = task;
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error(`Error saving task: ${error}`);
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
    console.error(`Error retrieving tasks: ${error}`);
  }
}

export async function eraseTasks() {
  try {
    const netState = await NetInfo.fetch();
    const tasks = await getTasks();

    if (!netState.isConnected && tasks && Object.keys(tasks).length > 0) {
      for (const [id, task] of Object.entries(tasks)) {
        try {
          await storeOfflineTrashedTask(id, task);
          await storeTrashedTask(id, task);
        } catch (error) {
          console.error(
            `Error preparing to store offline trashed task ${id}: ${error}`
          );
        }
      }
    }

    await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
  } catch (error) {
    console.error(`Error erasing tasks: ${error}`);
  }
}

export async function storeTrashedTasks(tasks) {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TRASHED_TASKS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error(`Error saving trashed tasks: ${error}`);
  }
}

export async function storeTrashedTask(id, task) {
  try {
    const jsonValue = await AsyncStorage.getItem(TRASHED_TASKS_STORAGE_KEY);
    let trashedTasks = jsonValue ? JSON.parse(jsonValue) : {};
    trashedTasks[id] = task;
    await AsyncStorage.setItem(
      TRASHED_TASKS_STORAGE_KEY,
      JSON.stringify(trashedTasks)
    );
  } catch (error) {
    console.error(`Error saving trashed task: ${error}`);
  }
}

export async function getTrashedTasks() {
  try {
    const jsonValue = await AsyncStorage.getItem(TRASHED_TASKS_STORAGE_KEY);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error retrieving trashed tasks ${error}`);
  }
}

export async function eraseTrashedTasks() {
  try {
    const netState = await NetInfo.fetch();
    const trashedTasks = await getTrashedTasks();

    if (
      !netState.isConnected &&
      trashedTasks &&
      Object.keys(trashedTasks).length > 0
    ) {
      for (const [id, task] of Object.entries(trashedTasks)) {
        try {
          await storeOfflinePermanentlyDeletedTask(id, task);
        } catch (error) {
          console.error(
            `Error preparing to store offline permanently deleted task ${id}: ${error}`
          );
        }
      }
    }

    await AsyncStorage.removeItem(TRASHED_TASKS_STORAGE_KEY);
  } catch (error) {
    console.error(`Error erasing trashed tasks: ${error}`);
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

export async function handleFirstUse() {
  try {
    const jsonValue = JSON.stringify(false);
    await AsyncStorage.setItem(FIRST_USE_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error(`Error handling first use: ${error}`);
  }
}

export async function getFirstUse() {
  try {
    const jsonValue = await AsyncStorage.getItem(FIRST_USE_STORAGE_KEY);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    } else {
      return true;
    }
  } catch (error) {
    console.error(`Error retrieving first use ${error}`);
  }
}
