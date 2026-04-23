// app.js
const express = require('express');
const session = require('express-session');
const studentRoutes = require('./routes/students');
const blockingRoutes = require('./routes/blocking');
const sessionRoutes = require('./routes/session');

const app = express();
const PORT = 3000;

// Middleware
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
app.use('/students', studentRoutes);
app.use('/api', blockingRoutes);
app.use('/', sessionRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Chào mừng đến với API Quản lý Sinh viên',
        endpoints: {
            students: {
                list: 'GET /students?page=1&limit=2',
                search: 'GET /students/search?name=...',
                detail: 'GET /students/:id',
                create: 'POST /students',
                update: 'PUT /students/:id',
                delete: 'DELETE /students/:id'
            },
            blocking: {
                sync: 'GET /api/sync',
                async: 'GET /api/async'
            },
            session: {
                login: 'POST /login',
                profile: 'GET /profile',
                logout: 'GET /logout'
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
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
    console.log(`Blocking test: http://localhost:${PORT}/api/sync`);
    console.log(`Non-blocking test: http://localhost:${PORT}/api/async`);
});