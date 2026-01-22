// firebase-config.js

// 1. استيراد المكتبات من الـ CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 2. إعدادات مشروعك (مأخوذة من الكود السابق الخاص بك)
const firebaseConfig = {
    apiKey: "AIzaSyBnmqWRY6lV54meFvO89QeXwtd28w81FcY",
    authDomain: "rtx3090-28439.firebaseapp.com",
    projectId: "rtx3090-28439",
    storageBucket: "rtx3090-28439.firebasestorage.app",
    messagingSenderId: "178612030690",
    appId: "1:178612030690:web:883189ced2ed3a78e3e2bb",
    databaseURL: "https://rtx3090-28439-default-rtdb.firebaseio.com/"
};

// 3. تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// 4. تهيئة الخدمات وتصديرها لتستخدمها في الملفات الأخرى
export const auth = getAuth(app);       // للمصادقة
export const db = getFirestore(app);    // لقاعدة البيانات (بيانات المستخدمين)
export const rtdb = getDatabase(app);   // للريال تايم (الشات)
export default app;

