import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

// Firestore
import { setDoc, doc, getDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, firestore } from "../firebaseConfig";

/**
 * Signs up a new user with email, password, and username.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's chosen password.
 * @param {string} username - The username to be stored.
 * @returns {Promise<{ success: boolean, errorMessage?: string }>} - Signup status.
 */
export const signUpUser = async (email, password, username) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Store additional user details in Firestore
    await setDoc(doc(firestore, "users", user.uid), {
      username,
      email,
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    const err =
      error instanceof FirebaseError
        ? error
        : new FirebaseError("unknown", "An unknown error occurred.");
    console.error("Sign-Up Error:", err.message);

    // Handle specific Firebase errors with user-friendly messages
    const errorMessages = {
      "auth/email-already-in-use":
        "This email address is already in use. Please try another one.",
      "auth/invalid-email":
        "The email address is invalid. Please enter a valid email.",
      "auth/weak-password":
        "The password is too weak. Please choose a stronger password.",
    };

    return {
      success: false,
      errorMessage:
        errorMessages[err.code] || "Sign-Up Error: Please try again.",
    };
  }
};

/**
 * Logs in a user with email and password.
 * Fetches additional user data from Firestore upon success.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<{ success: boolean, username?: string, errorMessage?: string }>} - Login status.
 */
export const loginUser = async (email, password) => {
  try {
    // Authenticate user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    if (!user) {
      return { success: false, errorMessage: "User authentication failed." };
    }

    // Retrieve user details from Firestore
    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    if (userDoc.exists()) {
      return { success: true, username: userDoc.data().username };
    } else {
      return { success: false, errorMessage: "User data not found." };
    }
  } catch (error) {
    console.error("Login Error:", error.message);

    // Handle specific Firebase authentication errors
    const errorMessages = {
      "auth/user-not-found": "No user found with this email. Please sign up.",
      "auth/invalid-credential": "Incorrect password. Please try again.",
      "auth/invalid-email":
        "The email address is invalid. Please enter a valid email.",
    };

    return {
      success: false,
      errorMessage:
        errorMessages[error.code] || "Login Error: Please try again.",
    };
  }
};
