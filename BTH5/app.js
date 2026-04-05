// app.js
const express = require('express');
const connectDB = require('./config/db'); // Import hàm kết nối db
const postRoutes = require('./routes/postRoutes'); // Import bộ router
const app = express();

// 1. Thực thi cấu hình Database
connectDB();

// 2. Cấu hình Static Files (CSS, hình ảnh...)
app.use(express.static('public'));

// 3. Cấu hình Middleware lấy thông tin gửi từ Form & Cấu hình View Engine (EJS)
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// 4. Kích hoạt Routes
// Gắn mọi đường dẫn (/) vào bộ postRoutes đã định nghĩa phía trên
app.use('/', postRoutes);

// 5. Khởi động Server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
