// app.js - التحكم الرئيسي والتزامن
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { addCoins, addDiamonds, buyItem, equipItem, unequipItem } from './of.js';

// متغيرات التطبيق
let currentUser = null;
let userData = {};

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    // استمع لتغير حالة المصادقة
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await initializeUserData(user);
            setupEventListeners();
        } else {
            window.location.href = "index.html";
        }
    });
});

// تهيئة بيانات المستخدم من Firestore
async function initializeUserData(user) {
    const userRef = doc(db, "users", user.uid);
    
    // التأكد من وجود بيانات للمستخدم
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
        // إنشاء بيانات افتراضية للمستخدم الجديد
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || `User_${user.uid.slice(0, 6)}`,
            photoURL: user.photoURL || 'default-avatar.png',
            coins: 100, // رصيد ابتدائي
            diamonds: 50, // رصيد ابتدائي
            level: 1,
            experience: 0,
            inventory: [],
            equippedFrame: "",
            equippedBadges: [],
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        });
    } else {
        // تحديث وقت آخر دخول
        await updateDoc(userRef, {
            lastLogin: new Date().toISOString()
        });
    }
    
    // الاستماع للتحديثات الحية
    onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            userData = docSnap.data();
            updateUI(userData);
            console.log("تم تحديث البيانات من السحابة:", userData);
        }
    });
}

// تحديث واجهة المستخدم
function updateUI(data) {
    // معلومات المستخدم
    document.getElementById('userName').textContent = data.displayName;
    document.getElementById('userId').textContent = data.uid.slice(0, 6);
    document.getElementById('coinsText').textContent = data.coins || 0;
    document.getElementById('diamondsText').textContent = data.diamonds || 0;
    document.getElementById('userLevel').textContent = data.level || 1;
    
    // الصورة الشخصية
    const avatar = document.getElementById('userAvatar');
    avatar.src = data.photoURL || 'default-avatar.png';
    
    // الإطار
    const frame = document.getElementById('userFrame');
    if (data.equippedFrame) {
        frame.src = data.equippedFrame;
        frame.style.display = 'block';
    } else {
        frame.style.display = 'none';
    }
    
    // الشارات
    const badgesDiv = document.getElementById('equippedBadges');
    badgesDiv.innerHTML = '';
    if (data.equippedBadges && data.equippedBadges.length > 0) {
        data.equippedBadges.forEach(badge => {
            const img = document.createElement('img');
            img.src = badge;
            img.className = 'badge-icon';
            img.title = 'شارة';
            badgesDiv.appendChild(img);
        });
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // نسخ المعرف
    document.getElementById('copyIdBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(currentUser.uid)
            .then(() => alert('تم نسخ المعرف بنجاح!'))
            .catch(() => alert('حدث خطأ في النسخ'));
    });
    
    // تسجيل الخروج
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            try {
                await signOut(auth);
            } catch (error) {
                console.error('خطأ في تسجيل الخروج:', error);
            }
        }
    });
    
    // أزرار التنقل
    document.getElementById('walletBtn').addEventListener('click', () => {
        alert(`المحفظة متزامنة مع السحابة!\nالثروة: ${userData.coins}\nالسحر: ${userData.diamonds}`);
    });
    
    document.getElementById('storeBtn').addEventListener('click', () => {
        openStore();
    });
    
    document.getElementById('inventoryBtn').addEventListener('click', () => {
        openInventory();
    });
    
    document.getElementById('badgesBtn').addEventListener('click', () => {
        alert('صفحة الشارات قيد التطوير...');
    });
    
    document.getElementById('friendsBtn').addEventListener('click', () => {
        alert('صفحة الأصدقاء قيد التطوير...');
    });
}

// فتح المتجر
function openStore() {
    const storeItems = [
        { id: 1, name: 'إطار ذهبي', type: 'frame', price: 100, image: 'https://cdn-icons-png.flaticon.com/512/1029/1029021.png' },
        { id: 2, name: 'إطار فضي', type: 'frame', price: 50, image: 'https://cdn-icons-png.flaticon.com/512/1029/1029022.png' },
        { id: 3, name: 'شارة البطل', type: 'badge', price: 200, image: 'https://cdn-icons-png.flaticon.com/512/1029/1029023.png' },
        { id: 4, name: 'شارة النخبة', type: 'badge', price: 150, image: 'https://cdn-icons-png.flaticon.com/512/1029/1029024.png' }
    ];
    
    let storeHTML = '<div class="confirm-content">';
    storeHTML += '<h3>🏪 المتجر</h3>';
    storeHTML += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0;">';
    
    storeItems.forEach(item => {
        storeHTML += `
            <div style="border: 1px solid #ddd; padding: 10px; border-radius: 10px; text-align: center;">
                <img src="${item.image}" width="50" style="margin-bottom: 5px;">
                <div style="font-weight: bold;">${item.name}</div>
                <div>السعر: ${item.price} 💰</div>
                <button onclick="buyItem(${item.id})" style="margin-top: 5px; padding: 5px 10px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    شراء
                </button>
            </div>
        `;
    });
    
    storeHTML += '</div><button onclick="closeStore()" class="confirm-btn no">إغلاق</button></div>';
    
    showModal(storeHTML);
}

// إظهار نافذة مخصصة
function showModal(content) {
    let modal = document.getElementById('customModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customModal';
        modal.className = 'confirm-modal';
        document.body.appendChild(modal);
    }
    modal.innerHTML = content;
    modal.style.display = 'flex';
}

// إغلاق المتجر
function closeStore() {
    const modal = document.getElementById('customModal');
    if (modal) modal.style.display = 'none';
}

// فتح الحقيبة
function openInventory() {
    let inventoryHTML = '<div class="confirm-content">';
    inventoryHTML += '<h3>🎒 حقيبتي</h3>';
    
    if (userData.inventory && userData.inventory.length > 0) {
        inventoryHTML += '<div style="max-height: 300px; overflow-y: auto; margin: 15px 0;">';
        userData.inventory.forEach((item, index) => {
            inventoryHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                    <div>العنصر ${index + 1}</div>
                    <button onclick="useItem('${item}')" style="padding: 5px 10px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        استخدام
                    </button>
                </div>
            `;
        });
        inventoryHTML += '</div>';
    } else {
        inventoryHTML += '<p style="color: #777; text-align: center;">الحقيبة فارغة</p>';
    }
    
    inventoryHTML += '<button onclick="closeStore()" class="confirm-btn no">إغلاق</button></div>';
    
    showModal(inventoryHTML);
}

// تعريف الدوال على النافذة للوصول من HTML
window.buyItem = async (itemId) => {
    const items = {
        1: { name: 'إطار ذهبي', price: 100, image: 'gold_frame.png', type: 'frame' },
        2: { name: 'إطار فضي', price: 50, image: 'silver_frame.png', type: 'frame' },
        3: { name: 'شارة البطل', price: 200, image: 'champion_badge.png', type: 'badge' },
        4: { name: 'شارة النخبة', price: 150, image: 'elite_badge.png', type: 'badge' }
    };
    
    const item = items[itemId];
    if (!item) return;
    
    try {
        await buyItem(item);
        alert(`تم شراء ${item.name} بنجاح!`);
        closeStore();
    } catch (error) {
        alert(error.message);
    }
};

window.useItem = async (item) => {
    try {
        await equipItem(item);
        alert('تم تفعيل العنصر بنجاح!');
        closeStore();
    } catch (error) {
        alert(error.message);
    }
};
