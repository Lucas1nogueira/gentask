import AsyncStorage from "@react-native-async-storage/async-storage";

const TASKS_STORAGE_KEY = "@myTasks:tasks";
const THEME_STORAGE_KEY = "@myTasks:darkMode";

export async function storeData(value) {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error(`Error saving data: ${error}`);
  }
}

export async function getData() {
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

export async function eraseData() {
  try {
    await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error(`Error erasing data ${error}`);
    return false;
  }
}

export async function saveTheme(value) {
  try {
    const jsonValue = JSON.stringify(value);
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
