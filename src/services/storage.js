import AsyncStorage from "@react-native-async-storage/async-storage";

const TASKS_STORAGE_KEY = "@myTasks:tasks";
const THEME_STORAGE_KEY = "@myTasks:darkMode";

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
  try {
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
