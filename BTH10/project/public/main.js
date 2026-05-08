const socket = io();

// Get DOM Elements
const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const userList = document.getElementById('user-list');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWithTitle = document.getElementById('chat-with-title');
const currentUserDisplay = document.getElementById('current-user-display');
const logoutBtn = document.getElementById('logout-btn');

let myUsername = localStorage.getItem('username') || '';

// Tự động đăng nhập nếu có username trong localStorage
if (myUsername) {
    socket.emit('join', myUsername);
    loginContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    currentUserDisplay.innerHTML = `Đang đăng nhập: <b>${myUsername}</b>`;
    logoutBtn.style.display = 'inline-block';
}

let currentReceiver = 'all'; // Default là chat chung cho mọi người

let isLoginMode = true;

const formTitle = document.getElementById('form-title');
const toggleFormBtn = document.getElementById('toggle-form-btn');

toggleFormBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        formTitle.textContent = 'Đăng Nhập';
        joinBtn.textContent = 'Đăng Nhập';
        toggleFormBtn.textContent = 'Chưa có tài khoản? Đăng ký ngay';
    } else {
        formTitle.textContent = 'Đăng Ký';
        joinBtn.textContent = 'Đăng Ký';
        toggleFormBtn.textContent = 'Đã có tài khoản? Đăng nhập ngay';
    }
});

// --- 1. XỬ LÝ NHẬP TÊN THAM GIA ---
joinBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = document.getElementById('password-input').value.trim();
    if (!username || !password) return alert('Vui lòng nhập đủ thông tin!');

    const apiUrl = isLoginMode ? '/api/login' : '/api/register';

    // Gọi API kiểm tra db
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
        if (!isLoginMode) {
            alert('Đăng ký thành công! Hãy đăng nhập lại.');
            toggleFormBtn.click(); // Chuyển về màn hình đăng nhập
        } else {
            myUsername = data.username;
            localStorage.setItem('username', myUsername);
            socket.emit('join', myUsername);
            loginContainer.classList.add('hidden');
            chatContainer.classList.remove('hidden');
            currentUserDisplay.innerHTML = `Đang đăng nhập: <b>${myUsername}</b>`;
            logoutBtn.style.display = 'inline-block';
        }
    } else {
        alert(data.message); // Báo lỗi nếu sai pass hoặc trùng tên
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('username');
    location.reload(); // Refresh trang để ngắt kết nối socket và về màn hình đăng nhập
});

// --- 2. XỬ LÝ GỬI TIN NHẮN ---
const sendMessage = () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('sendMessage', {
            receiver: currentReceiver,
            message: message
        });
        messageInput.value = ''; // Xóa trắng ô input
    }
};

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// --- TÍNH NĂNG EMOJI ---
const emojiBtn = document.getElementById('emoji-btn');
const emojiMenu = document.getElementById('emoji-menu');

emojiBtn.addEventListener('click', () => {
    emojiMenu.classList.toggle('hidden');
});

window.sendEmoji = (emoji) => {
    messageInput.value += emoji;
    messageInput.focus();
    emojiMenu.classList.add('hidden');
};

// --- TÍNH NĂNG GỬI FILE/ẢNH ---
const attachBtn = document.getElementById('attach-btn');
const fileInput = document.getElementById('file-input');

attachBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            socket.emit('sendMessage', {
                receiver: currentReceiver,
                message: data.originalName,
                type: 'file',
                fileUrl: data.fileUrl
            });
        } else {
            alert('Lỗi tải file: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi tải file!');
    }
    fileInput.value = ''; // Reset input
});

// --- 3. CẬP NHẬT DANH SÁCH USER ONLINE & CHỌN CHAT RIÊNG ---
socket.on('updateUserList', (users) => {
    userList.innerHTML = '';

    // Nút "Mọi người" (Chat chung)
    const allLi = document.createElement('li');
    allLi.textContent = '🌐 Mọi người (Chat Chung)';
    allLi.className = currentReceiver === 'all' ? 'active' : '';
    allLi.onclick = () => selectReceiver('all', allLi);
    userList.appendChild(allLi);

    // Render danh sách online (loại bỏ chính mình)
    users.forEach(userObj => {
        const { username, isOnline, lastActive } = userObj;
        if (username !== myUsername) {
            const li = document.createElement('li');
            const statusIcon = isOnline ? '🟢' : '⚪';

            let statusText = '';
            if (isOnline) {
                statusText = 'Đang hoạt động';
            } else if (lastActive) {
                const diffMs = new Date() - new Date(lastActive);
                const diffMins = Math.floor(diffMs / 60000);
                if (diffMins < 60) {
                    statusText = `Hoạt động ${diffMins === 0 ? 1 : diffMins} phút trước`;
                } else {
                    const diffHours = Math.floor(diffMins / 60);
                    statusText = `Hoạt động ${diffHours} giờ trước`;
                }
            } else {
                statusText = 'Chưa từng hoạt động';
            }

            li.className = currentReceiver === username ? 'active' : '';
            li.onclick = () => selectReceiver(username, li);
            
            li.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 3px;">${statusIcon} ${username}</div>
                <div style="font-size: 0.8em; color: ${isOnline ? '#75b798' : '#adb5bd'}; margin-left: 24px;">${statusText}</div>
            `;

            userList.appendChild(li);
        }
    });
});

function selectReceiver(receiver, element) {
    currentReceiver = receiver;
    chatWithTitle.textContent = receiver === 'all' ? 'Chat Chung' : `Chat riêng với: ${receiver}`;

    // Highlight CSS user đang được chọn
    document.querySelectorAll('#user-list li').forEach(li => li.classList.remove('active'));
    element.classList.add('active');

    renderMessages(); // Hiển thị đúng tin nhắn của tab này
}

// --- 4. LƯU VÀ XỬ LÝ NHẬN TIN NHẮN REALTIME ---
let chatHistory = [];

function renderMessages() {
    messagesDiv.innerHTML = ''; // Xóa sạch tin nhắn cũ

    // Lọc tin nhắn theo người đang được chọn chat
    const filteredMessages = chatHistory.filter(msg => {
        if (currentReceiver === 'all') {
            return msg.receiver === 'all';
        } else {
            return (msg.sender === myUsername && msg.receiver === currentReceiver) ||
                (msg.sender === currentReceiver && msg.receiver === myUsername);
        }
    });

    // Vẽ lại các tin nhắn đã lọc
    filteredMessages.forEach(data => {
        const { sender, receiver, message, time, type, fileUrl } = data;
        const timeString = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const div = document.createElement('div');
        const isMe = sender === myUsername;
        div.className = `message ${isMe ? 'me' : 'other'}`;

        const displaySender = isMe ? 'Bạn' : sender;

        let contentHtml = `<div class="text">${message}</div>`;
        let extraStyle = '';
        let metaStyle = '';

        if (type === 'file') {
            const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png)$/i);
            if (isImage) {
                 contentHtml = `<div class="text"><img src="${fileUrl}" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-top: 5px;" alt="Hình ảnh"></div>`;
                 extraStyle = 'background: transparent; box-shadow: none; padding-left: 0; padding-right: 0;';
                 if (isMe) metaStyle = 'color: #6c757d;'; // Giữ màu chữ thời gian dễ đọc khi nền trong suốt
            } else {
                 contentHtml = `<div class="text">📎 <a href="${fileUrl}" target="_blank" style="color: inherit;">${message}</a></div>`;
            }
        }

        if (extraStyle) div.style.cssText = extraStyle;

        div.innerHTML = `
            <div class="meta" style="${metaStyle}">
                <span><b>${displaySender}</b></span>
                <span>${timeString}</span>
            </div>
            ${contentHtml}
        `;
        messagesDiv.appendChild(div);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

socket.on('receiveMessage', (data) => {
    chatHistory.push(data); // Lưu vào lịch sử chung
    renderMessages(); // Cập nhật lại giao diện
});

// Lấy lịch sử tin nhắn từ Database lúc mới đăng nhập
socket.on('loadHistory', (history) => {
    chatHistory = history;
    renderMessages();
});

// Tin nhắn hệ thống (Ai đó vào/ra phòng)
socket.on('serverMessage', (msg) => {
    const div = document.createElement('div');
    div.className = 'message system';
    div.textContent = msg;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
