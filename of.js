// of.js - العمليات السريعة على Firestore
import { auth, db } from './firebase-config.js';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// إضافة عملات للمستخدم
export const addCoins = async (amount) => {
    if (!auth.currentUser) throw new Error('يجب تسجيل الدخول أولاً');
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
        coins: increment(amount)
    });
};

// إضافة ماس للمستخدم
export const addDiamonds = async (amount) => {
    if (!auth.currentUser) throw new Error('يجب تسجيل الدخول أولاً');
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
        diamonds: increment(amount)
    });
};

// شراء عنصر من المتجر
export const buyItem = async (item) => {
    if (!auth.currentUser) throw new Error('يجب تسجيل الدخول أولاً');
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    // التحقق من الرصيد الكافي
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/users/${auth.currentUser.uid}`);
    const data = await response.json();
    const userCoins = data.fields?.coins?.integerValue || 0;
    
    if (userCoins < item.price) {
        throw new Error('رصيدك غير كافي');
    }
    
    // خصم السعر وإضافة العنصر للحقيبة
    await updateDoc(userRef, {
        coins: increment(-item.price),
        inventory: arrayUnion(item.image)
    });
};

// تفعيل عنصر (إطار أو شارة)
export const equipItem = async (itemImage) => {
    if (!auth.currentUser) throw new Error('يجب تسجيل الدخول أولاً');
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    // تحديد نوع العنصر من اسم الصورة
    let updateData = {};
    
    if (itemImage.includes('frame')) {
        updateData.equippedFrame = itemImage;
    } else if (itemImage.includes('badge')) {
        // إضافة الشارة للمصفوفة
        updateData.equippedBadges = arrayUnion(itemImage);
    }
    
    await updateDoc(userRef, updateData);
};

// إلغاء تفعيل عنصر
export const unequipItem = async (itemImage, itemType) => {
    if (!auth.currentUser) throw new Error('يجب تسجيل الدخول أولاً');
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    let updateData = {};
    
    if (itemType === 'frame') {
        updateData.equippedFrame = "";
    } else if (itemType === 'badge') {
        updateData.equippedBadges = arrayRemove(itemImage);
    }
    
    await updateDoc(userRef, updateData);
};

// زيادة مستوى المستخدم
export const increaseLevel = async () => {
    if (!auth.currentUser) throw new Error('يجب تسجيل الدخول أولاً');
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
        level: increment(1),
        coins: increment(100), // مكافأة زيادة المستوى
        diamonds: increment(20)
    });
};

// تحديث اسم المستخدم
export const updateDisplayName = async (newName) => {
    if (!auth.currentUser) throw new Error('يجب تسجيل الدخول أولاً');
    
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
        displayName: newName
    });
};
