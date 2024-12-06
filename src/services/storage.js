import * as SecureStore from "expo-secure-store";

export async function save(key, value) {
  const jsonValue = JSON.stringify(value);
  try {
    await SecureStore.setItemAsync(key, jsonValue);
  } catch (error) {
    console.log(`Error saving data: ${error}`);
  }
}

export async function getValueFor(key) {
  try {
    let result = await SecureStore.getItemAsync(key);
    if (result && result != "[]") {
      return JSON.parse(result);
    } else {
      return null;
    }
  } catch (error) {
    Alert.alert(`Error retrieving data ${error}`);
  }
}
