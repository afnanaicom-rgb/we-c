import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    GithubAuthProvider, 
    TwitterAuthProvider, 
    onAuthStateChanged, 
    signOut,
    setPersistence,
    browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyBnmqWRY6lV54meFvO89QeXwtd28w81FcY",
    authDomain: "rtx3090-28439.firebaseapp.com",
    databaseURL: "https://rtx3090-28439-default-rtdb.firebaseio.com",
    projectId: "rtx3090-28439",
    storageBucket: "rtx3090-28439.firebasestorage.app",
    messagingSenderId: "178612030690",
    appId: "1:178612030690:web:883189ced2ed3a78e3e2bb",
    measurementId: "G-PTKK9Y8HK5"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// إجبار المتصفح على استخدام نظام الجلسات المحلي الرسمي
setPersistence(auth, browserLocalPersistence);

---

### وظائف تسجيل الدخول المؤمنة

window.loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // إجبار جوجل على إظهار نافذة اختيار الحساب (يمنع الدخول التلقائي)
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
        await signInWithPopup(auth, provider);
    } catch (err) {
        window.showToast("فشل تسجيل الدخول: " + err.message);
    }
};

window.logout = () => {
    signOut(auth).then(() => {
        window.showToast("تم تسجيل الخروج بنجاح", "success");
    }).catch(err => window.showToast(err.message));
};

---

### مراقب الحالة الصارم (الحماية)



onAuthStateChanged(auth, (user) => {
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainApp');

    if (user) {
        // حالة وجود مستخدم حقيقي مسجل في قواعد بيانات Firebase
        console.log("تم التأكد من هوية المستخدم:", user.uid);
        
        if (loginPage) loginPage.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
        
        // تحديث بيانات الواجهة من حساب جوجل الحقيقي
        const userNameElem = document.getElementById('userName');
        const userEmailElem = document.getElementById('userEmail');
        const userAvatarElem = document.getElementById('userAvatar');

        if (userNameElem) userNameElem.innerText = user.displayName;
        if (userEmailElem) userEmailElem.innerText = user.email;
        if (userAvatarElem && user.photoURL) userAvatarElem.src = user.photoURL;
        
        window.showToast(`مرحباً، ${user.displayName}`, "success");
    } else {
        // إذا لم يكن هناك تسجيل دخول حقيقي، يتم طرد المستخدم لصفحة الدخول
        console.log("لا يوجد مستخدم نشط.");
        if (mainApp) mainApp.style.display = 'none';
        if (loginPage) loginPage.style.display = 'flex';
    }
});
