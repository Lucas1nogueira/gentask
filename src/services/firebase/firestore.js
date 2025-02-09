import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { getCurrentUser } from "./auth";

export async function addTask(id, task) {
  try {
    const user = getCurrentUser();
    const tasksRef = doc(db, "users", user.uid, "tasks", id);
    await setDoc(tasksRef, task);
  } catch (error) {
    throw new Error(`Error adding task: ${error.message}`);
  }
}

export async function modifyTask(id, task) {
  try {
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
    querySnapshot.docs.forEach((doc) => {
      tasks[doc.id] = doc.data();
    });
    return tasks;
  } catch (error) {
    throw new Error(`Error retrieving tasks: ${error.message}`);
  }
}

export async function deleteTask(id) {
  try {
    const user = getCurrentUser();
    const taskRef = doc(db, "users", user.uid, "tasks", id);
    await deleteDoc(taskRef);
  } catch (error) {
    throw new Error(`Error deleting task: ${error.message}`);
  }
}

export async function purgeTasks() {
  try {
    const user = getCurrentUser();
    const tasksRef = collection(db, "users", user.uid, "tasks");
    const querySnapshot = await getDocs(tasksRef);
    const deletions = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletions);
  } catch (error) {
    throw new Error(`Error erasing tasks: ${error.message}`);
  }
}
