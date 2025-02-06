import AsyncStorage from "@react-native-async-storage/async-storage";

export async function storeData(value) {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem("tasks", jsonValue);
  } catch (error) {
    console.log(`Error saving data: ${error}`);
  }
}

export async function getData() {
  try {
    const jsonValue = await AsyncStorage.getItem("tasks");
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    } else {
      return null;
    }
  } catch (error) {
    Alert.alert(`Error retrieving data ${error}`);
  }
}
