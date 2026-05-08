const User = require('./models/User');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Kết nối MongoDB (Hãy chắc chắn MongoDB service đang chạy trên WSL)
mongoose.connect('mongodb://127.0.0.1:27017/chat_app')
    .then(() => {
        console.log('Kết nối MongoDB thành công');
    })
    .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Phục vụ các file tĩnh (HTML, CSS, JS)
app.use(express.static('public'));
app.use(express.json());

// Cấu hình Multer cho upload file
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// API Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Tải file thất bại.' });
    }
    const fileUrl = '/uploads/' + req.file.filename;
    res.json({ success: true, fileUrl, originalName: req.file.originalname });
});


// API ĐĂNG KÝ
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = new User({ username, password });
        await newUser.save();
        res.json({ success: true });
        broadcastUserList(); // Update user list when new user registers
    } catch (err) {
        res.json({ success: false, message: 'Tên đăng nhập đã tồn tại!' });
    }
});

// API ĐĂNG NHẬP
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) res.json({ success: true, username: user.username });
    else res.json({ success: false, message: 'Sai mật khẩu hoặc tài khoản!' });
});

// Object lưu trữ danh sách user online (Định dạng: { socketId: username })
const users = {};

async function broadcastUserList() {
    const allUsers = await User.find({}, 'username lastActive');
    const onlineUsernames = Object.values(users);

    const userList = allUsers.map(u => ({
        username: u.username,
        isOnline: onlineUsernames.includes(u.username),
        lastActive: u.lastActive
    }));

    io.emit('updateUserList', userList);
}

io.on('connection', (socket) => {
    // 1. Nhận sự kiện user tham gia
    socket.on('join', async (username) => {
        users[socket.id] = username;
        broadcastUserList();
        // Thông báo cho những người khác là có user mới vào
        socket.broadcast.emit('serverMessage', `${username} đã tham gia phòng chat.`);

        // Lấy lịch sử tin nhắn từ DB (Chat chung và chat riêng của user này)
        try {
            const history = await Message.find({
                $or: [
                    { receiver: 'all' },
                    { sender: username },
                    { receiver: username }
                ]
            }).sort({ time: 1 }); // Cũ nhất xếp trước
            socket.emit('loadHistory', history);
        } catch (err) {
            console.error("Lỗi lấy lịch sử tin nhắn:", err);
        }
    });

    // 2. Nhận sự kiện gửi tin nhắn
    socket.on('sendMessage', async (data) => {
        const { receiver, message, type = 'text', fileUrl = '' } = data;
        const sender = users[socket.id];
        const time = new Date();

        // Lưu vào MongoDB
        const newMessage = new Message({ sender, receiver, message, type, fileUrl, time });
        await newMessage.save();

        const messageData = { sender, receiver, message, type, fileUrl, time };

        if (receiver === 'all') {
            // Phát cho tất cả nếu là chat chung
            io.emit('receiveMessage', messageData);
        } else {
            // Chat riêng: Tìm socket.id của người nhận
            const receiverSocketId = Object.keys(users).find(key => users[key] === receiver);
            if (receiverSocketId) {
                // Gửi cho người nhận
                io.to(receiverSocketId).emit('receiveMessage', messageData);
            }
            // Luôn gửi trả lại cho chính người gửi để hiển thị, dù người nhận có offline
            socket.emit('receiveMessage', messageData);
        }
    });

    // 3. Tự động xử lý khi user ngắt kết nối/thoát trang
    socket.on('disconnect', async () => {
        const username = users[socket.id];
        if (username) {
            delete users[socket.id]; // Xóa khỏi danh sách online
            try {
                await User.findOneAndUpdate({ username }, { lastActive: new Date() });
            } catch (err) {
                console.error("Lỗi cập nhật lastActive:", err);
            }
            broadcastUserList(); // Cập nhật lại UI cho mọi người
            io.emit('serverMessage', `${username} đã thoát.`);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});