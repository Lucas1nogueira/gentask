import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import NetInfo from "@react-native-community/netinfo";
import { getCurrentUser } from "./auth";
import { storeDeletedOfflineTask, storeOfflineTask } from "../storage";

async function handleOfflineData(id, task, wasDeleted) {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    try {
      if (!wasDeleted) {
        storeOfflineTask(id, task);
      } else {
        storeDeletedOfflineTask(id, task);
      }
    } catch (error) {
      throw new Error(`Error handling offline task: ${error.message}`);
    }
  }
}

export async function getTask(id) {
  try {
    const user = getCurrentUser();
    const taskRef = doc(db, "users", user.uid, "tasks", id);
    const docSnapshot = await getDoc(taskRef);

    return docSnapshot.exists()
      ? { id: docSnapshot.id, ...docSnapshot.data() }
      : null;
  } catch (error) {
    throw new Error(`Error getting task: ${error.message}`);
  }
}

export async function getDeletedTask(id) {
  try {
    const user = getCurrentUser();
    const taskRef = doc(db, "users", user.uid, "deletedTasks", id);
    const docSnapshot = await getDoc(taskRef);

    return docSnapshot.exists()
      ? { id: docSnapshot.id, ...docSnapshot.data() }
      : null;
  } catch (error) {
    throw new Error(`Error getting deleted task: ${error.message}`);
  }
}

export async function addTask(id, task, disableHandleOffline) {
  try {
    if (!disableHandleOffline) {
      handleOfflineData(id, task, false);
    }

    const user = getCurrentUser();
    const taskRef = doc(db, "users", user.uid, "tasks", id);

    await setDoc(taskRef, task);
  } catch (error) {
    throw new Error(`Error adding task: ${error.message}`);
  }
}

export async function modifyTask(id, task, disableHandleOffline) {
  try {
    if (!disableHandleOffline) {
      handleOfflineData(id, task, false);
    }

    const user = getCurrentUser();
    const taskRef = doc(db, "users", user.uid, "tasks", id);

    await updateDoc(taskRef, task);
  } catch (error) {
    throw new Error(`Error updating task: ${error.message}`);
  }
}

export async function fetchTasks() {
  try {
    const user = getCurrentUser();
    const tasksRef = collection(db, "users", user.uid, "tasks");
    const querySnapshot = await getDocs(tasksRef);
    const tasks = {};

    querySnapshot.docs.forEach((taskDoc) => {
      tasks[taskDoc.id] = taskDoc.data();
    });

    return tasks;
  } catch (error) {
    throw new Error(`Error retrieving tasks: ${error.message}`);
  }
}

export async function deleteTask(id, task, disableHandleOffline) {
  try {
    if (!disableHandleOffline) {
      handleOfflineData(id, task, true);
    }

    const user = getCurrentUser();
    const taskRef = doc(db, "users", user.uid, "tasks", id);
    const deletedTaskRef = doc(db, "users", user.uid, "deletedTasks", id);
    const batch = writeBatch(db);

    const deletedTask = {
      ...task,
      updatedAt: Date.now(),
    };

    batch.set(deletedTaskRef, deletedTask);
    batch.delete(taskRef);

    await batch.commit();
  } catch (error) {
    throw new Error(`Error deleting task: ${error.message}`);
  }
}

export async function purgeTasks() {
  try {
    const user = getCurrentUser();
    const tasksRef = collection(db, "users", user.uid, "tasks");
    const querySnapshot = await getDocs(tasksRef);
    const batch = writeBatch(db);

    querySnapshot.forEach((taskDoc) => {
      const deletedTaskRef = doc(
        db,
        "users",
        user.uid,
        "deletedTasks",
        taskDoc.id
      );

      batch.set(deletedTaskRef, {
        ...taskDoc.data(),
        updatedAt: Date.now(),
      });

      batch.delete(taskDoc.ref);
    });

    await batch.commit();
  } catch (error) {
    throw new Error(`Error erasing tasks: ${error.message}`);
  }
}
