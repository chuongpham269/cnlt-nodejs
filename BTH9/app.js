// app.js
const express = require('express');
const session = require('express-session');
const studentRoutes = require('./routes/students');
const blockingRoutes = require('./routes/blocking');
const sessionRoutes = require('./routes/session');

const logger = require('./middleware/logger');
const requireLogin = require('./middleware/auth');

const app = express();
const PORT = 3000;

// Middleware logging (in METHOD và URL)
app.use(logger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình session
app.use(session({
    secret: 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set true nếu dùng HTTPS
        httpOnly: true,
        maxAge: 30 * 60 * 1000 // 30 phút
    }
}));

// Routes
// Bảo vệ API quản lý sinh viên bằng middleware requireLogin
app.use('/students', requireLogin, studentRoutes);

// Đặt routes blocking ở gốc để có thể truy cập /heavy-sync, /heavy-async
app.use('/', blockingRoutes);
app.use('/', sessionRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Chào mừng đến với API Quản lý Sinh viên',
        endpoints: {
            students: {
                list: 'GET /students?page=1&limit=2',
                stats: 'GET /students/stats',
                statsClass: 'GET /students/stats/class',
                detail: 'GET /students/:id',
                create: 'POST /students',
                update: 'PUT /students/:id',
                delete: 'DELETE /students/:id'
            },
            blocking: {
                sync: 'GET /heavy-sync',
                async: 'GET /heavy-async'
            },
            session: {
                login: 'POST /login',
                profile: 'GET /profile',
                logout: 'POST /logout'
            }
        }
    });
});

// Middleware xử lý lỗi chung
app.use((err, req, res, next) => {
    // Xử lý lỗi JSON không hợp lệ
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu body (JSON) không hợp lệ'
        });
    }

    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra trên server'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`API Students: http://localhost:${PORT}/students`);
    console.log(`Blocking test: http://localhost:${PORT}/heavy-sync`);
    console.log(`Non-blocking test: http://localhost:${PORT}/heavy-async`);
});