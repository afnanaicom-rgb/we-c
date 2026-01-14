import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBnmqWRY6lV54meFvO89QeXwtd28w81FcY",
    authDomain: "rtx3090-28439.firebaseapp.com",
    databaseURL: "https://rtx3090-28439-default-rtdb.firebaseio.com",
    projectId: "rtx3090-28439",
    storageBucket: "rtx3090-28439.firebasestorage.app",
    messagingSenderId: "178612030690",
    appId: "1:178612030690:web:883189ced2ed3a78e3e2bb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Toast Helper
window.showToast = (message, type = 'error') => {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'error' ? 'alert-circle' : 'check-circle';
    toast.innerHTML = `
        <i data-lucide="${icon}" class="w-5 h-5 ${type === 'error' ? 'text-red-500' : 'text-green-500'}"></i>
        <span class="text-sm font-medium">${message}</span>
    `;
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

// Auth Functions
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

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
        
        // Update Sidebar Profile
        document.getElementById('userName').innerText = user.displayName || "مستخدم Afnan AI";
        document.getElementById('userEmail').innerText = user.email || user.providerData[0]?.email || "لا يوجد بريد إلكتروني";
        if (user.photoURL) {
            document.getElementById('userAvatar').src = user.photoURL;
        }
        
        showToast(`مرحباً بك، ${user.displayName || 'مستخدمنا العزيز'}`, "success");
    } else {
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('loginPage').style.display = 'flex';
    }
});