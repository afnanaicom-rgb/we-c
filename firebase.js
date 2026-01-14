// استيراد المكتبات من CDN (الإصدار 10.7.1 لضمان التوافق)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// إعدادات Firebase المحدثة الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyBnmqWRY6lV54meFvO89QeXwtd28w81FcY",
    authDomain: "rtx3090-28439.firebaseapp.com",
    databaseURL: "https://rtx3090-28439-default-rtdb.firebaseio.com",
    projectId: "rtx3090-28439",
    storageBucket: "rtx3090-28439.firebasestorage.app",
    messagingSenderId: "178612030690",
    appId: "1:178612030690:web:883189ced2ed3a78e3e2bb",
    measurementId: "G-PTKK9Y8HK5" // تم إضافة هذا المعرف
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app); // تهيئة الإحصائيات

---

// مساعد التنبيهات (Toast Helper)
window.showToast = (message, type = 'error') => {
    const container = document.getElementById('toastContainer');
    if (!container) return; // التأكد من وجود الحاوية
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'error' ? 'alert-circle' : 'check-circle';
    
    toast.innerHTML = `
        <i data-lucide="${icon}" class="w-5 h-5 ${type === 'error' ? 'text-red-500' : 'text-green-500'}"></i>
        <span class="text-sm font-medium">${message}</span>
    `;
    
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons(); // التأكد من وجود مكتبة Lucide
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

// وظائف تسجيل الدخول (Auth Functions)
window.loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(err => showToast(err.message));
};

window.loginWithGithub = () => {
    const provider = new GithubAuthProvider();
    signInWithPopup(auth, provider).catch(err => showToast(err.message));
};

window.loginWithX = () => {
    const provider = new TwitterAuthProvider();
    signInWithPopup(auth, provider).catch(err => showToast(err.message));
};

window.logout = () => {
    signOut(auth).then(() => {
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('loginPage').style.display = 'flex';
        showToast("تم تسجيل الخروج بنجاح", "success");
    }).catch(err => showToast(err.message));
};

// مراقب حالة المستخدم (Auth State Observer)
onAuthStateChanged(auth, (user) => {
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainApp');

    if (user) {
        if (loginPage) loginPage.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
        
        // تحديث الملف الشخصي في القائمة الجانبية
        const userNameElem = document.getElementById('userName');
        const userEmailElem = document.getElementById('userEmail');
        const userAvatarElem = document.getElementById('userAvatar');

        if (userNameElem) userNameElem.innerText = user.displayName || "مستخدم Afnan AI";
        if (userEmailElem) userEmailElem.innerText = user.email || user.providerData[0]?.email || "لا يوجد بريد إلكتروني";
        if (userAvatarElem && user.photoURL) {
            userAvatarElem.src = user.photoURL;
        }
        
        showToast(`مرحباً بك، ${user.displayName || 'مستخدمنا العزيز'}`, "success");
    } else {
        if (mainApp) mainApp.style.display = 'none';
        if (loginPage) loginPage.style.display = 'flex';
    }
});
