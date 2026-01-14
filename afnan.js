lucide.createIcons();
const mainInput = document.getElementById(\'mainInput\');
const sendBtn = document.getElementById(\'sendBtn\');
const chatView = document.getElementById(\'chatView\');
const homeContent = document.getElementById(\'homeContent\');
const optionsMenu = document.getElementById(\'optionsMenu\');
const modeBadge = document.getElementById(\'modeBadge\');
const modeName = document.getElementById(\'modeName\');
const modeIcon = document.getElementById(\'modeIcon\');
const previewContainer = document.getElementById(\'previewContainer\');

let currentMode = null;
let pressTimer;
let selectedFiles = [];

mainInput.addEventListener(\'input\', function() {
    this.style.height = \'auto\';
    this.style.height = (this.scrollHeight > 150 ? 150 : this.scrollHeight) + \'px\';
    const hasContent = this.value.trim().length > 0 || selectedFiles.length > 0;
    sendBtn.style.background = hasContent ? \'white\' : \'rgba(255,255,255,0.05)\';
    document.getElementById(\'sendIcon\').style.color = hasContent ? \'black\' : \'#9ca3af\';
});

function toggleTheme() {
    document.body.classList.toggle(\'light-mode\');
    const isLight = document.body.classList.contains(\'light-mode\');
    document.getElementById(\'themeCircle\').style.transform = isLight ? \'translateX(24px)\' : \'translateX(0)\';
    document.getElementById(\'modeText\').innerText = isLight ? \'الوضع الفاتح\' : \'الوضع الداكن\';
}

function toggleSidebar() {
    document.getElementById(\'sidebar\').classList.toggle(\'translate-x-full\');
}

function toggleOptions(e) {
    e.stopPropagation();
    optionsMenu.style.display = optionsMenu.style.display === \'block\' ? \'none\' : \'block\';
}

function setMode(name, icon) {
    currentMode = name;
    modeName.innerText = name;
    modeIcon.setAttribute(\'data-lucide\', icon);
    modeBadge.style.display = \'flex\';
    if (name === \'AI Agent\') {
        modeBadge.classList.add(\'agent\');
    } else {
        modeBadge.classList.remove(\'agent\');
    }
    optionsMenu.style.display = \'none\';
    lucide.createIcons();
}

function triggerFilePicker() {
    document.getElementById(\'filePicker\').click();
    optionsMenu.style.display = \'none\';
}

function previewImages(event) {
    const files = event.target.files;
    if (files.length > 0) {
        setMode(\'المعرض\', \'layout-grid\');
        previewContainer.innerHTML = \'\';
        previewContainer.classList.remove(\'hidden\');
        selectedFiles = Array.from(files);

        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement(\'div\');
                div.className = "relative w-16 h-16 flex-shrink-0\";
                div.innerHTML = `
                    <img src=\"${e.target.result}\" class=\"w-full h-full object-cover rounded-lg border border-white/10\">\
                    <button onclick=\"removeFile(${index})\" class=\"absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5\">\
                        <i data-lucide=\"x\" class=\"w-3 h-3\"></i>\
                    </button>\
                `;
                previewContainer.appendChild(div);
                lucide.createIcons();
            };
            reader.readAsDataURL(file);
        });
        
        sendBtn.style.background = \'white\';
        document.getElementById(\'sendIcon\').style.color = \'black\';
    }
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    if (selectedFiles.length === 0) {
        previewContainer.classList.add(\'hidden\');
        if (currentMode === \'المعرض\') resetChat();
    } else {
        const dt = new DataTransfer();
        selectedFiles.forEach(f => dt.items.add(f));
        document.getElementById(\'filePicker\').files = dt.files;
        previewImages({target: {files: dt.files}});\
    }
}

modeBadge.addEventListener(\'mousedown\', startPress);
modeBadge.addEventListener(\'touchstart\', startPress);
modeBadge.addEventListener(\'mouseup\', endPress);
modeBadge.addEventListener(\'touchend\', endPress);

function startPress() {
    pressTimer = window.setTimeout(() => {
        resetChat();
    }, 1000);
}

function endPress() {
    clearTimeout(pressTimer);
}

function newChat() {
    resetChat();
}

function resetChat() {
    currentMode = null;
    modeBadge.style.display = \'none\';
    modeBadge.classList.remove(\'agent\');
    selectedFiles = [];
    previewContainer.innerHTML = \'\';
    previewContainer.classList.add(\'hidden\');
    if (chatView) chatView.innerHTML = \'\';
    if (homeContent) homeContent.style.display = \'block\';
    mainInput.value = \'\';
    mainInput.style.height = \'auto\';
}

function openOverlay(src) {
    document.getElementById(\'overlayImg\').src = src;\
    document.getElementById(\'imageOverlay\').style.display = \'flex\';
}

function closeOverlay() {
    document.getElementById(\'imageOverlay\').style.display = \'none\';
}

function handleSend() {
    const text = mainInput.value.trim();
    if (!text && selectedFiles.length === 0) return;
    
    if (homeContent) homeContent.style.display = \'none\';
    
    let messageHtml = `<p class=\"text-[16px] leading-relaxed\">${text}</p>`;
    if (selectedFiles.length > 0) {
        messageHtml += `<div class=\"grid grid-cols-2 gap-2 mt-3\">`;
        selectedFiles.forEach(file => {
            const url = URL.createObjectURL(file);
            messageHtml += `<img src=\"${url}\" class=\"rounded-xl w-full aspect-square object-cover border border-white/10 cursor-pointer\" onclick=\"openOverlay(\'${url}\')\">`;
        });
        messageHtml += `</div>`;
    }

    createMessage(messageHtml, \'user\', true);
    
    mainInput.value = \'\';
    mainInput.style.height = \'auto\';
    selectedFiles = [];
    previewContainer.innerHTML = \'\';
    previewContainer.classList.add(\'hidden\');
    
    if (currentMode === \'AI Agent\') {
        setTimeout(() => createMessage(\'Agent response.\', \'agent\'), 800);
    } else if (currentMode === \'Chat\') {
        const loadingMessage = createMessage(\'<p class=\"text-[16px] leading-relaxed\">...</p>\', \'ai\');

        // IMPORTANT: Replace with a secure way to get your API key, like a Firebase Function.
        const MANUS_API_KEY = \'sk--O1DLvWeCoSmBqEzlQck5ghkQvuMn4DDoBIPY2UfEs4bGzaxWQoShJ-n7OpwdscGizLVpp1h-Zow9wostO94MeQgURU4\';
        
        fetch(\'https://manus.ai/api/v1/chat/completions\', {
            method: \'POST\',
            headers: {
                \'Content-Type\': \'application/json\',
                \'Authorization\': `Bearer ${MANUS_API_KEY}`
            },
            body: JSON.stringify({
                messages: [{ role: \'user\', content: text }],
                mode: \'chat\'
            })
        })
        .then(response => response.json())
        .then(data => {
            loadingMessage.remove();
            if (data.choices && data.choices[0] && data.choices[0].message) {
                createMessage(data.choices[0].message.content, \'ai\');
            } else {
                createMessage(\'Sorry, I could not get a response from the AI.\', \'ai\');
            }
        })
        .catch(error => {
            loadingMessage.remove();
            console.error(\'Error calling Manus AI:\', error);
            createMessage(\'An error occurred while contacting the AI.\', \'ai\');
        });

    } else {
        setTimeout(() => createMessage(`تم استلام طلبك في وضع ${currentMode || \'الدردشة العادية\'}. كيف يمكنني مساعدتك أكثر؟`, \'ai\'), 800);
    }
}

function createMessage(content, sender, isHtml = false) {
    const container = document.createElement(\'div\');
    container.className = "message-container";
    const msgDiv = document.createElement(\'div\');

    if (sender === \'user\') {
        msgDiv.className = "message-user\";
    } else if (sender === \'agent\') {
        msgDiv.className = "message-agent\";
    } else {
        msgDiv.className = "message-ai\";
    }

    if (isHtml) {
        msgDiv.innerHTML = content;
    } else {
        msgDiv.innerHTML = `<p class=\"text-[16px] leading-relaxed\">${content}</p>`;
    }
    
    if (sender === \'ai\' || sender === \'agent\') {
        const actions = document.createElement(\'div\');
        actions.className = "flex items-center gap-4 mt-2 opacity-50 hover:opacity-100 transition justify-end\";
        actions.innerHTML = `
            <button class=\"p-1 hover:text-blue-500\"><i data-lucide=\"thumbs-up\" class=\"w-4 h-4\"></i></button>\
            <button class=\"p-1 hover:text-red-500\"><i data-lucide=\"thumbs-down\" class=\"w-4 h-4\"></i></button>\
        `;
        msgDiv.appendChild(actions);
    }

    container.appendChild(msgDiv);
    if (chatView) {
        chatView.appendChild(container);
        lucide.createIcons();
        document.getElementById(\'mainContent\').scrollTo({ top: document.getElementById(\'mainContent\').scrollHeight, behavior: \'smooth\' });
    }
    return container;
}

window.onclick = () => {
    if(optionsMenu) optionsMenu.style.display = \'none\';
};
