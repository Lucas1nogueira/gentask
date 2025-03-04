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
import {
  storeOfflineTrashedTask,
  storeOfflineTask,
  storeOfflinePermanentlyDeletedTask,
} from "../storage";

async function handleOfflineData(id, task, wasTrashed) {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    try {
      if (!wasTrashed) {
        await storeOfflineTask(id, task);
      } else {
        await storeOfflineTrashedTask(id, task);
      }
    } catch (error) {
      throw new Error(`Error handling offline task: ${error.message}`);
    }
  }
}

async function handleOfflineTrashedData(id, task, wasPermanentlyDeleted) {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    try {
      if (!wasPermanentlyDeleted) {
        await storeOfflineTrashedTask(id, task);
      } else {
        await storeOfflinePermanentlyDeletedTask(id, task);
      }
    } catch (error) {
      throw new Error(`Error handling offline trashed task: ${error.message}`);
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

export async function getTrashedTask(id) {
  try {
    const user = getCurrentUser();
    const taskRef = doc(db, "users", user.uid, "trashedTasks", id);
    const docSnapshot = await getDoc(taskRef);

    return docSnapshot.exists()
      ? { id: docSnapshot.id, ...docSnapshot.data() }
      : null;
  } catch (error) {
    throw new Error(`Error getting trashed task: ${error.message}`);
  }
}

export async function addTask(id, task, disableHandleOffline) {
  try {
    if (!disableHandleOffline) {
      await handleOfflineData(id, task, false);
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
      await handleOfflineData(id, task, false);
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

export async function moveTaskToTrash(id, task, disableHandleOffline) {
  try {
    if (!disableHandleOffline) {
      await handleOfflineData(id, task, true);
    }

    const user = getCurrentUser();
    const taskRef = doc(db, "users", user.uid, "tasks", id);
    const trashedTaskRef = doc(db, "users", user.uid, "trashedTasks", id);
    const batch = writeBatch(db);

    const trashedTask = {
      ...task,
      updatedAt: Date.now(),
    };

    batch.set(trashedTaskRef, trashedTask);
    batch.delete(taskRef);

    await batch.commit();
  } catch (error) {
    throw new Error(`Error moving task to trash: ${error.message}`);
  }
}

export async function purgeTasks() {
  try {
    const user = getCurrentUser();
    const tasksRef = collection(db, "users", user.uid, "tasks");
    const querySnapshot = await getDocs(tasksRef);
    const batch = writeBatch(db);

    querySnapshot.forEach((taskDoc) => {
      const trashedTaskRef = doc(
        db,
        "users",
        user.uid,
        "trashedTasks",
        taskDoc.id
      );

      batch.set(trashedTaskRef, {
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

export async function getPermanentlyDeletedTask(id) {
  try {
    const user = getCurrentUser();
    const taskRef = doc(db, "users", user.uid, "permanentlyDeletedTasks", id);
    const docSnapshot = await getDoc(taskRef);

    return docSnapshot.exists()
      ? { id: docSnapshot.id, ...docSnapshot.data() }
      : null;
  } catch (error) {
    throw new Error(`Error getting permanently deleted task: ${error.message}`);
  }
}

export async function fullRestoreTask(id, task, disableHandleOffline) {
  try {
    if (!disableHandleOffline) {
      await handleOfflineData(id, task, false);
    }

    const user = getCurrentUser();
    const permanentlyDeletedTaskRef = doc(
      db,
      "users",
      user.uid,
      "permanentlyDeletedTasks",
      id
    );
    const taskRef = doc(db, "users", user.uid, "tasks", id);
    const batch = writeBatch(db);

    const fullRestoredTask = {
      ...task,
      updatedAt: Date.now(),
    };

    batch.set(taskRef, fullRestoredTask);
    batch.delete(permanentlyDeletedTaskRef);

    await batch.commit();
  } catch (error) {
    throw new Error(`Error full restoring task: ${error.message}`);
  }
}

export async function restoreTrashedTask(id, task, disableHandleOffline) {
  try {
    if (!disableHandleOffline) {
      await handleOfflineData(id, task, false);
    }

    const user = getCurrentUser();
    const trashedTaskRef = doc(db, "users", user.uid, "trashedTasks", id);
    const taskRef = doc(db, "users", user.uid, "tasks", id);
    const batch = writeBatch(db);

    const restoredTask = {
      ...task,
      updatedAt: Date.now(),
    };

    batch.set(taskRef, restoredTask);
    batch.delete(trashedTaskRef);

    await batch.commit();
  } catch (error) {
    throw new Error(`Error restoring trashed task: ${error.message}`);
  }
}

export async function restorePermanentlyDeletedTask(
  id,
  task,
  disableHandleOffline
) {
  try {
    if (!disableHandleOffline) {
      await handleOfflineTrashedData(id, task, false);
    }

    const user = getCurrentUser();
    const permanentlyDeletedTaskRef = doc(
      db,
      "users",
      user.uid,
      "permanentlyDeletedTasks",
      id
    );
    const trashedTaskRef = doc(db, "users", user.uid, "trashedTasks", id);
    const batch = writeBatch(db);

    const trashedTask = {
      ...task,
      updatedAt: Date.now(),
    };

    batch.set(trashedTaskRef, trashedTask);
    batch.delete(permanentlyDeletedTaskRef);

    await batch.commit();
  } catch (error) {
    throw new Error(
      `Error restoring permanently deleted task: ${error.message}`
    );
  }
}

export async function addTrashedTask(id, task, disableHandleOffline) {
  try {
    if (!disableHandleOffline) {
      await handleOfflineTrashedData(id, task, false);
    }

    const user = getCurrentUser();
    const trashedTasksRef = doc(db, "users", user.uid, "trashedTasks", id);

    await setDoc(trashedTasksRef, task);
  } catch (error) {
    throw new Error(`Error adding trashed task: ${error.message}`);
  }
}

export async function modifyTrashedTask(id, task, disableHandleOffline) {
  try {
    if (!disableHandleOffline) {
      await handleOfflineTrashedData(id, task, false);
    }

    const user = getCurrentUser();
    const trashedTasksRef = doc(db, "users", user.uid, "trashedTasks", id);

    await updateDoc(trashedTasksRef, task);
  } catch (error) {
    throw new Error(`Error updating trashed task: ${error.message}`);
  }
}

export async function fetchTrashedTasks() {
  try {
    const user = getCurrentUser();
    const tasksRef = collection(db, "users", user.uid, "trashedTasks");
    const querySnapshot = await getDocs(tasksRef);
    const tasks = {};

    querySnapshot.docs.forEach((taskDoc) => {
      tasks[taskDoc.id] = taskDoc.data();
    });

    return tasks;
  } catch (error) {
    throw new Error(`Error retrieving trashed tasks: ${error.message}`);
  }
}

export async function moveTaskDirectlyToPermanentlyDeletedTasks(
  id,
  task,
  disableHandleOffline
) {
  try {
    if (!disableHandleOffline) {
      await handleOfflineTrashedData(id, task, true);
    }

    const user = getCurrentUser();
    const taskRef = doc(db, "users", user.uid, "tasks", id);
    const permanentlyDeletedTaskRef = doc(
      db,
      "users",
      user.uid,
      "permanentlyDeletedTasks",
      id
    );
    const batch = writeBatch(db);

    const permanentlyDeletedTask = {
      ...task,
      updatedAt: Date.now(),
    };

    batch.set(permanentlyDeletedTaskRef, permanentlyDeletedTask);
    batch.delete(taskRef);

    await batch.commit();
  } catch (error) {
    throw new Error(
      `Error moving task directly to permanently deleted tasks: ${error.message}`
    );
  }
}

export async function addPermanentlyDeletedTask(id, task) {
  try {
    const user = getCurrentUser();
    const permanentlyDeletedTasksRef = doc(
      db,
      "users",
      user.uid,
      "permanentlyDeletedTasks",
      id
    );

    await setDoc(permanentlyDeletedTasksRef, task);
  } catch (error) {
    throw new Error(`Error adding permanently deleted task: ${error.message}`);
  }
}

export async function permanentlyDeleteTask(id, task, disableHandleOffline) {
  try {
    if (!disableHandleOffline) {
      await handleOfflineTrashedData(id, task, true);
    }

    const user = getCurrentUser();
    const trashedTaskRef = doc(db, "users", user.uid, "trashedTasks", id);
    const permanentlyDeletedTaskRef = doc(
      db,
      "users",
      user.uid,
      "permanentlyDeletedTasks",
      id
    );
    const batch = writeBatch(db);

    const permanentlyDeletedTask = {
      ...task,
      updatedAt: Date.now(),
    };

    batch.set(permanentlyDeletedTaskRef, permanentlyDeletedTask);
    batch.delete(trashedTaskRef);

    await batch.commit();
  } catch (error) {
    throw new Error(`Error permanently deleting task: ${error.message}`);
  }
}

export async function purgeTrashedTasks() {
  try {
    const user = getCurrentUser();
    const trashedTasksRef = collection(db, "users", user.uid, "trashedTasks");
    const querySnapshot = await getDocs(trashedTasksRef);
    const batch = writeBatch(db);

    querySnapshot.forEach((taskDoc) => {
      const permanentlyDeletedTaskRef = doc(
        db,
        "users",
        user.uid,
        "permanentlyDeletedTasks",
        taskDoc.id
      );

      batch.set(permanentlyDeletedTaskRef, {
        ...taskDoc.data(),
        updatedAt: Date.now(),
      });

      batch.delete(taskDoc.ref);
    });

    await batch.commit();
  } catch (error) {
    throw new Error(`Error erasing trashed tasks: ${error.message}`);
  }
}

export async function getAIConfig() {
  try {
    const aiConfig = doc(db, "ai", "config");
    const docSnapshot = await getDoc(aiConfig);

    return docSnapshot.exists()
      ? { id: docSnapshot.id, ...docSnapshot.data() }
      : null;
  } catch (error) {
    throw new Error(`Error getting AI config: ${error.message}`);
  }
}
