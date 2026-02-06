import { auth, db, rtdb } from './firebase-config.js';
import { doc, onSnapshot, updateDoc, increment, getDoc, getDocs, collection, setDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let userData = {};
let storeData = { itemsById: {} };
const svgaParser = new SVGAParser();

auth.onAuthStateChanged(async (user) => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                userData = { uid: user.uid, ...snap.data() };
                updateUI();
            }
        });
        loadStoreData();
        loadBanner();
        loadRooms();
    } else {
        window.location.href = 'login.html';
    }
});

async function loadStoreData() {
    const snap = await getDocs(collection(db, "store"));
    snap.forEach(d => {
        storeData.itemsById[d.id] = { id: d.id, ...d.data() };
    });
}

function updateUI() {
    // تحديث البيانات في الشريط الجانبي
    document.getElementById('sideName').innerText = userData.displayName || 'مستخدم';
    document.getElementById('sideEmail').innerText = userData.email || '';
    document.getElementById('sideAvatar').src = userData.photoURL || 'https://via.placeholder.com/150';
    document.getElementById('sideCustomId').innerText = `ID: ${userData.customId || userData.uid.substring(0, 6)}`;
    document.getElementById('walletAmount').innerText = (userData.balance || 0).toLocaleString();
    
    // تحديث الإطار في الشريط الجانبي
    const frameContainer = document.getElementById('sideSvgaFrame');
    const staticFrame = document.getElementById('sideFrame');
    frameContainer.innerHTML = '';
    staticFrame.classList.add('hidden');

    if (userData.activeFrame) {
        const item = storeData.itemsById[userData.activeFrame];
        if (item) {
            if (item.itemType === 'svga') {
                playSvga(item.fileUrl, frameContainer);
            } else {
                staticFrame.src = item.image;
                staticFrame.classList.remove('hidden');
            }
        }
    }
}

function playSvga(url, container) {
    if (!container) return;
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const player = new SVGA.Player(canvas);
    svgaParser.load(url, (videoItem) => {
        player.setVideoItem(videoItem);
        player.startAnimation();
    });
}

window.copyEmail = () => {
    navigator.clipboard.writeText(userData.email);
    alert('تم نسخ البريد الإلكتروني');
};

window.confirmLogout = () => {
    if (confirm('هل تريد تسجيل الخروج؟')) signOut(auth);
};

window.toggleSidebar = (show) => {
    const s = document.getElementById('sidebar'), o = document.getElementById('sidebarOverlay');
    s.classList.toggle('open', show);
    o.classList.toggle('hidden', !show);
    if(show) setTimeout(() => o.classList.add('visible'), 10);
    else o.classList.remove('visible');
};

window.switchView = (v) => {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('view-' + v).classList.remove('hidden');
    document.getElementById('pageTitle').innerText = v === 'home' ? 'الرئيسية' : v === 'wallet' ? 'المحفظة' : v === 'store' ? 'المتجر' : 'حقيبتي';
    if(v === 'bag') loadBagItems();
    toggleSidebar(false);
};

window.recharge = async (a) => {
    await updateDoc(doc(db, "users", userData.uid), { balance: increment(a) });
    alert('تم الشحن بنجاح!');
};

window.openEditProfile = () => {
    document.getElementById('editNameInp').value = userData.displayName;
    document.getElementById('editPhotoInp').value = userData.photoURL;
    document.getElementById('editModal').classList.remove('hidden');
    toggleSidebar(false);
};

window.closeEditModal = () => document.getElementById('editModal').classList.add('hidden');

window.saveProfileChanges = async () => {
    await updateDoc(doc(db, "users", userData.uid), {
        displayName: document.getElementById('editNameInp').value,
        photoURL: document.getElementById('editPhotoInp').value
    });
    closeEditModal();
};

async function loadBanner() {
    const bDoc = await getDoc(doc(db, "appData", "banner"));
    const container = document.getElementById('bannerWrapper');
    if (bDoc.exists()) {
        const b = bDoc.data();
        container.innerHTML = `<div class="swiper-slide"><img src="${b.image}" class="w-full h-full object-cover"></div>`;
    }
}

async function loadRooms() {
    const rSnap = await getDocs(collection(db, "rooms")), grid = document.getElementById('roomsGrid');
    grid.innerHTML = '';
    rSnap.docs.forEach(d => {
        const r = d.data();
        grid.innerHTML += `
            <div onclick="window.location.href='room.html?id=${d.id}'" class="glass-card p-4 rounded-3xl flex items-center gap-4 cursor-pointer hover:bg-white transition">
                <div class="w-12 h-12 rounded-full ${r.color || 'bg-blue-500'} flex items-center justify-center text-xl">${r.icon || '💬'}</div>
                <div class="flex-1">
                    <h4 class="font-bold text-gray-900">${r.name}</h4>
                    <p class="text-xs text-gray-500">${r.description || ''}</p>
                </div>
                <i data-lucide="chevron-left" class="w-4 h-4 text-gray-400"></i>
            </div>`;
    });
    lucide.createIcons();
}

window.openMyRoom = () => {
    window.location.href = `room.html?id=${userData.uid}&type=private`;
};

