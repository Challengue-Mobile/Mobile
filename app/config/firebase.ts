import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCyV1Vuid3SpG6p7ODEReGPI0TGyRp_dYk",
  authDomain: "navmotu.firebaseapp.com",
  projectId: "navmotu",
  storageBucket: "navmotu.firebasestorage.app",
  messagingSenderId: "1062458738613",
  appId: "1:1062458738613:android:8a0aa83031005ddbce7bfc",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;