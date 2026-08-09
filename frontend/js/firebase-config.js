import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-database.js";

import {
  getAuth,
  signInWithCustomToken,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

/* =========================================================
   FIREBASE CONFIGURATION
========================================================= */

const firebaseConfig = {
  apiKey:
    "AIzaSyAUUxICI4qtj5XLY5mWDhtxPWtBLzK2Wq8",

  authDomain:
    "foodconnect-94d23.firebaseapp.com",

  databaseURL:
    "https://foodconnect-94d23-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
    "foodconnect-94d23",

  storageBucket:
    "foodconnect-94d23.firebasestorage.app",

  messagingSenderId:
    "61518539735",

  appId:
    "1:61518539735:web:1de91f46968cda0219f992",

  measurementId:
    "G-MZHEBHQHHH"
};

/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const firebaseApp =
  initializeApp(firebaseConfig);

const realtimeDatabase =
  getDatabase(firebaseApp);

const firebaseAuth =
  getAuth(firebaseApp);

async function authenticateFirebaseRider() {
  const response = await fetch(
    "/FoodConnect/api/get_firebase_rider_token.php",
    {
      method: "POST",
      credentials: "include",
      cache: "no-store"
    }
  );

  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error(
      "The Firebase authentication server returned an invalid response."
    );
  }

  if (
    !response.ok ||
    !data.success
  ) {
    throw new Error(
      data.message ||
      "Unable to authenticate the delivery rider with Firebase."
    );
  }

  const customToken =
    String(
      data.firebase?.token || ""
    ).trim();

  if (!customToken) {
    throw new Error(
      "Firebase authentication token is missing."
    );
  }

  const userCredential =
    await signInWithCustomToken(
      firebaseAuth,
      customToken
    );

  const firebaseUser =
    userCredential.user;

  if (!firebaseUser) {
    throw new Error(
      "Firebase rider authentication failed."
    );
  }

  return {
    user:
      firebaseUser,

    rider:
      data.rider || null
  };
}

async function authenticateFirebaseCustomerTracking(
  orderId
) {
  const safeOrderId =
    Number(orderId);

  if (
    !Number.isInteger(safeOrderId) ||
    safeOrderId <= 0
  ) {
    throw new Error(
      "A valid delivery order is required."
    );
  }

  const response = await fetch(
    "/FoodConnect/api/get_firebase_customer_tracking_token.php",
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({
        order_id:
          safeOrderId
      })
    }
  );

  let data;

  try {
    data =
      await response.json();
  } catch (error) {
    throw new Error(
      "The customer tracking server returned an invalid response."
    );
  }

  if (
    !response.ok ||
    !data.success
  ) {
    throw new Error(
      data.message ||
      "Unable to authorize live delivery tracking."
    );
  }

  const customToken =
    String(
      data.firebase?.token || ""
    ).trim();

  if (!customToken) {
    throw new Error(
      "Firebase customer tracking token is missing."
    );
  }

  const userCredential =
    await signInWithCustomToken(
      firebaseAuth,
      customToken
    );

  const firebaseUser =
    userCredential.user;

  if (!firebaseUser) {
    throw new Error(
      "Firebase customer tracking authentication failed."
    );
  }

  return {
    user:
      firebaseUser,

    tracking:
      data.tracking || null
  };
}

/* =========================================================
   SHARED EXPORTS
========================================================= */

export {
  firebaseApp,
  realtimeDatabase,
  firebaseAuth,
  signInWithCustomToken,
  onAuthStateChanged,
  authenticateFirebaseRider,
  authenticateFirebaseCustomerTracking
};