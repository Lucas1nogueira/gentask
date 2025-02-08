import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getCurrentUser } from "./auth";

export async function addTask(task) {
  try {
    const user = getCurrentUser();
    const tasksRef = collection(db, "users", user.uid, "tasks");
    await addDoc(tasksRef, task);
  } catch (error) {
    throw new Error(`Error adding task: ${error.message}`);
  }
}

export async function updateTask(taskId, task) {
  try {
    const user = getCurrentUser();
    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    await updateDoc(taskRef, task);
  } catch (error) {
    throw new Error(`Error updating task: ${error.message}`);
  }
}

export async function getTasks() {
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

export async function deleteTask(taskId) {
  try {
    const user = getCurrentUser();
    const taskRef = doc(db, "users", user.uid, "tasks", taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    throw new Error(`Error deleting task: ${error.message}`);
  }
}

export async function eraseTasks() {
  try {
    const user = getCurrentUser();
    const tasksRef = collection(db, "users", user.uid, "tasks");
    const querySnapshot = await getDocs(tasksRef);
    const deletions = querySnapshot.docs.map((doc) =>
      deleteDoc(doc(db, "users", user.uid, "tasks", doc.id))
    );
    await Promise.all(deletions);
  } catch (error) {
    throw new Error(`Error erasing tasks: ${error.message}`);
  }
}
