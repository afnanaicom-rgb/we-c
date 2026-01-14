// ربط الوظائف بـ window لضمان عملها مع HTML attributes مثل onclick
window.toggleTheme = toggleTheme;
window.toggleSidebar = toggleSidebar;
window.toggleOptions = toggleOptions;
window.setMode = setMode;
window.triggerFilePicker = triggerFilePicker;
window.previewImages = previewImages;
window.removeFile = removeFile;
window.newChat = newChat;
window.handleSend = handleSend;
window.openOverlay = openOverlay;
window.closeOverlay = closeOverlay;

// --- الإعدادات والمتغيرات ---
lucide.createIcons();
const mainInput = document.getElementById('mainInput');
const sendBtn = document.getElementById('sendBtn');
const chatView = document.getElementById('chatView');
const homeContent = document.getElementById('homeContent');
const optionsMenu = document.getElementById('optionsMenu');
const modeBadge = document.getElementById('modeBadge');
const modeName = document.getElementById('modeName');
const modeIcon = document.getElementById('modeIcon');
const previewContainer = document.getElementById('previewContainer');

let currentMode = null;
let pressTimer;
let selectedFiles = [];

// --- إدارة واجهة الإدخال ---
mainInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight > 150 ? 150 : this.scrollHeight) + 'px';
    const hasContent = this.value.trim().length > 0 || selectedFiles.length > 0;
    sendBtn.style.background = hasContent ? 'white' : 'rgba(255,255,255,0.05)';
    const sendIcon = document.getElementById('sendIcon');
    if (sendIcon) sendIcon.style.color = hasContent ? 'black' : '#9ca3af';
});

// --- وظائف الواجهة (UI Functions) ---
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    const themeCircle = document.getElementById('themeCircle');
    const modeText = document.getElementById('modeText');
    if (themeCircle) themeCircle.style.transform = isLight ? 'translateX(24px)' : 'translateX(0)';
    if (modeText) modeText.innerText = isLight ? 'الوضع الفاتح' : 'الوضع الداكن';
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('translate-x-full');
}

function toggleOptions(e) {
    e.stopPropagation();
    optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
}

function setMode(name, icon) {
    currentMode = name;
    modeName.innerText = name;
    modeIcon.setAttribute('data-lucide', icon);
    modeBadge.style.display = 'flex';
    if (name === 'AI Agent') {
        modeBadge.classList.add('agent');
    } else {
        modeBadge.classList.remove('agent');
    }
    optionsMenu.style.display = 'none';
    lucide.createIcons();
}

// --- معالجة الملفات والصور ---
function triggerFilePicker() {
    document.getElementById('filePicker').click();
    optionsMenu.style.display = 'none';
}

function previewImages(event) {
    const files = event.target.files;
    if (files.length > 0) {
        setMode('المعرض', 'layout-grid');
        previewContainer.innerHTML = '';
        previewContainer.classList.remove('hidden');
        selectedFiles = Array.from(files);

        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = "relative w-16 h-16 flex-shrink-0";
                div.innerHTML = `
                    <img src="${e.target.result}" class="w-full h-full object-cover rounded-lg border border-white/10">
                    <button onclick="removeFile(${index})" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                        <i data-lucide="x" class="w-3 h-3"></i>
                    </button>
                `;
                previewContainer.appendChild(div);
                lucide.createIcons();
            };
            reader.readAsDataURL(file);
        });
        
        sendBtn.style.background = 'white';
        const sendIcon = document.getElementById('sendIcon');
        if (sendIcon) sendIcon.style.color = 'black';
    }
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    if (selectedFiles.length === 0) {
        previewContainer.classList.add('hidden');
        if (currentMode === 'المعرض') resetChat();
    } else {
        const dt = new DataTransfer();
        selectedFiles.forEach(f => dt.items.add(f));
        document.getElementById('filePicker').files = dt.files;
        previewImages({target: {files: dt.files}});
    }
}

// --- إدارة المحادثة ---
function handleSend() {
    const text = mainInput.value.trim();
    if (!text && selectedFiles.length === 0) return;
    
    // إخفاء المحتوى الترحيبي عند بدء المحادثة
    if (homeContent) homeContent.style.display = 'none';
    
    let messageHtml = `<p class="text-[16px] leading-relaxed">${text}</p>`;
    if (selectedFiles.length > 0) {
        messageHtml += `<div class="grid grid-cols-2 gap-2 mt-3">`;
        selectedFiles.forEach(file => {
            const url = URL.createObjectURL(file);
            messageHtml += `<img src="${url}" class="rounded-xl w-full aspect-square object-cover border border-white/10 cursor-pointer" onclick="openOverlay('${url}')">`;
        });
        messageHtml += `</div>`;
    }

    createMessage(messageHtml, 'user', true);
    
    // إعادة ضبط حقل الإدخال
    mainInput.value = '';
    mainInput.style.height = 'auto';
    selectedFiles = [];
    previewContainer.innerHTML = '';
    previewContainer.classList.add('hidden');
    
    // منطق الردود
    if (currentMode === 'AI Agent') {
        setTimeout(() => createMessage('جاري معالجة طلبك عبر الوكيل الذكي...', 'agent'), 800);
    } else if (currentMode === 'Chat' || !currentMode) {
        // رسالة انتظار
        const loadingDiv = createMessage('جاري التفكير...', 'ai');

        // ملاحظة: يفضل نقل الـ API Key لخادم خلفي، ولكن برمجياً هنا:
        const MANUS_API_KEY = 'sk--O1DLvWeCoSmBqEzlQck5ghkQvuMn4DDoBIPY2UfEs4bGzaxWQoShJ-n7OpwdscGizLVpp1h-Zow9wostO94MeQgURU4';
        
        fetch('https://manus.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MANUS_API_KEY}`
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: text }],
                mode: 'chat'
            })
        })
        .then(response => response.json())
        .then(data => {
            loadingDiv.remove();
            if (data.choices && data.choices[0]) {
                createMessage(data.choices[0].message.content, 'ai');
            }
        })
        .catch(error => {
            loadingDiv.remove();
            showToast("فشل الاتصال بـ Manus AI", "error");
        });
    }
}

function createMessage(content, sender, isHtml = false) {
    const container = document.createElement('div');
    container.className = "message-container w-full flex flex-col mb-4";
    
    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? "message-user align-self-end ml-auto bg-blue-600 text-white p-3 rounded-2xl max-w-[80%]" : 
                       sender === 'agent' ? "message-agent bg-purple-600 text-white p-3 rounded-2xl max-w-[80%]" : 
                       "message-ai bg-white/10 text-white p-3 rounded-2xl max-w-[80%]";

    if (isHtml) {
        msgDiv.innerHTML = content;
    } else {
        msgDiv.innerHTML = `<p class="text-[16px] leading-relaxed">${content}</p>`;
    }

    container.appendChild(msgDiv);
    chatView.appendChild(container);
    
    // تمرير تلقائي للأسفل
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.scrollTo({ top: mainContent.scrollHeight, behavior: 'smooth' });
    }
    lucide.createIcons();
    return container;
}

function resetChat() {
    currentMode = null;
    if (modeBadge) modeBadge.style.display = 'none';
    selectedFiles = [];
    if (previewContainer) previewContainer.innerHTML = '';
    if (chatView) chatView.innerHTML = '';
    if (homeContent) homeContent.style.display = 'block';
}

function newChat() {
    resetChat();
    if (window.innerWidth < 1024) toggleSidebar(); // إغلاق القائمة في الموبايل
}

function openOverlay(src) {
    document.getElementById('overlayImg').src = src;
    document.getElementById('imageOverlay').style.display = 'flex';
}

function closeOverlay() {
    document.getElementById('imageOverlay').style.display = 'none';
}

// إغلاق القوائم عند الضغط في أي مكان
window.addEventListener('click', () => {
    if(optionsMenu) optionsMenu.style.display = 'none';
});
