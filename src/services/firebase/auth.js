import { auth } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export async function signUp(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created successfully!");
  } catch (error) {
    console.error("Sign up error:", error.message);
    throw error;
  }
}

export async function signIn(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in successfully!");
  } catch (error) {
    console.error("Sign in error:", error.message);
    throw error;
  }
}

export async function logout() {
  try {
    await signOut(auth);
    console.log("User logged out successfully!");
  } catch (error) {
    console.error("Logout error:", error.message);
    throw error;
  }
}

export function getCurrentUser() {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("No user authenticated!");
  }

  return currentUser;
}
