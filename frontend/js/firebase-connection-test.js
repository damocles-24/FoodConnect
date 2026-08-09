import {
  firebaseAuth,
  realtimeDatabase,
  signInAnonymously,
  onAuthStateChanged
} from "./firebase-config.js";

import {
  ref,
  set,
  get,
  remove,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-database.js";

/* =========================================================
   FIREBASE CONNECTION TEST
========================================================= */

const statusElement =
  document.getElementById("firebaseTestStatus");

const userIdElement =
  document.getElementById("firebaseTestUserId");

const writeResultElement =
  document.getElementById("firebaseWriteResult");

const readResultElement =
  document.getElementById("firebaseReadResult");

const cleanupResultElement =
  document.getElementById("firebaseCleanupResult");

let hasRunDatabaseTest = false;

function updateStatus(
  element,
  message,
  isError = false
) {
  if (!element) {
    return;
  }

  element.textContent = message;

  element.style.color =
    isError ? "#dc2626" : "#16a34a";
}

/* =========================================================
   DATABASE READ / WRITE TEST
========================================================= */

async function runDatabaseTest(user) {
  if (hasRunDatabaseTest) {
    return;
  }

  hasRunDatabaseTest = true;

  const testReference = ref(
    realtimeDatabase,
    `firebase_connection_test/${user.uid}`
  );

  const testData = {
    uid: user.uid,
    message: "FoodConnect Firebase test successful",
    test_status: "connected",
    created_at: serverTimestamp()
  };

  try {
    updateStatus(
      writeResultElement,
      "Writing temporary test data..."
    );

    await set(
      testReference,
      testData
    );

    updateStatus(
      writeResultElement,
      "Write test passed."
    );

    updateStatus(
      readResultElement,
      "Reading the temporary test data..."
    );

    const snapshot =
      await get(testReference);

    if (!snapshot.exists()) {
      throw new Error(
        "The test data could not be found after writing."
      );
    }

    const savedData =
      snapshot.val();

    updateStatus(
      readResultElement,
      `Read test passed: ${savedData.message}`
    );

    console.log(
      "Firebase database test data:",
      savedData
    );

    updateStatus(
      cleanupResultElement,
      "Removing temporary test data..."
    );

    await remove(testReference);

    updateStatus(
      cleanupResultElement,
      "Cleanup passed. Temporary data removed."
    );
  } catch (error) {
    console.error(
      "Firebase Realtime Database test failed:",
      error
    );

    updateStatus(
      writeResultElement,
      `Database test failed: ${error.message}`,
      true
    );

    updateStatus(
      readResultElement,
      "Read test was not completed.",
      true
    );

    updateStatus(
      cleanupResultElement,
      "Cleanup was not completed.",
      true
    );
  }
}

/* =========================================================
   AUTHENTICATION TEST
========================================================= */

onAuthStateChanged(
  firebaseAuth,
  (user) => {
    if (!user) {
      updateStatus(
        statusElement,
        "Connecting to Firebase Authentication..."
      );

      return;
    }

    updateStatus(
      statusElement,
      "Firebase Authentication connected successfully."
    );

    if (userIdElement) {
      userIdElement.textContent =
        user.uid;
    }

    console.log(
      "Firebase authenticated user:",
      {
        uid: user.uid,
        isAnonymous: user.isAnonymous
      }
    );

    runDatabaseTest(user);
  }
);

async function connectToFirebase() {
  try {
    updateStatus(
      statusElement,
      "Signing in anonymously..."
    );

    await signInAnonymously(
      firebaseAuth
    );
  } catch (error) {
    console.error(
      "Firebase Authentication test failed:",
      error
    );

    updateStatus(
      statusElement,
      `Authentication failed: ${error.message}`,
      true
    );
  }
}

connectToFirebase();