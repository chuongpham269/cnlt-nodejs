// routes/session.js
const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/auth');

// POST /login - Đăng nhập
router.post('/login', (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng cung cấp username và password'
        });
    }

    // Kiểm tra tài khoản
    if (username === 'admin' && password === '123456') {
        // Lưu thông tin vào session
        req.session.user = {
            username: username,
            loginTime: new Date().toISOString()
        };

        return res.json({
            success: true,
            message: 'Đăng nhập thành công',
            user: req.session.user
        });
    }

    res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không đúng'
    });
});

// GET /profile - Xem thông tin profile
router.get('/profile', requireLogin, (req, res) => {
    res.json({
        success: true,
        user: req.session.user,
        message: 'Đây là thông tin profile của bạn'
    });
});

// POST /logout - Đăng xuất
router.post('/logout', (req, res) => {
    const username = req.session.user?.username;

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi đăng xuất'
            });
        }
        res.clearCookie('connect.sid');

        res.json({
            success: true,
            message: `Đăng xuất thành công${username ? ', tạm biệt ' + username : ''}`
        });
    });
});

module.exports = router;