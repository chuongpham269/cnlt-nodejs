// routes/blocking.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Tạo file test.txt nếu chưa có
const testFile = path.join(__dirname, '../test.txt');
if (!fs.existsSync(testFile)) {
    fs.writeFileSync(testFile, 'Đây là nội dung test file\n'.repeat(100));
}

// API Sync - Blocking
router.get('/sync', (req, res) => {
    console.log('Sync API bắt đầu -', new Date().toISOString());

    // Blocking operation
    const data = fs.readFileSync(testFile, 'utf8');
    console.log('Sync API đọc file xong -', new Date().toISOString());

    res.json({
        success: true,
        message: 'Sync API hoàn thành',
        dataLength: data.length,
        type: 'blocking'
    });

    console.log('Sync API kết thúc -', new Date().toISOString());
});

// API Async - Non-blocking
router.get('/async', (req, res) => {
    console.log('Async API bắt đầu -', new Date().toISOString());

    // Non-blocking operation
    fs.readFile(testFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Lỗi đọc file:', err);
            return res.status(500).json({
                success: false,
                message: 'Lỗi đọc file'
            });
        }

        console.log('Async API đọc file xong -', new Date().toISOString());

        res.json({
            success: true,
            message: 'Async API hoàn thành',
            dataLength: data.length,
            type: 'non-blocking'
        });
    });

    console.log('Async API tiếp tục xử lý (non-blocking) -', new Date().toISOString());
});

module.exports = router;