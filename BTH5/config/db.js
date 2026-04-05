// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/blogDB');
        console.log('Kết nối MongoDB thành công');
    } catch (err) {
        console.error('Lỗi kết nối:', err);
        process.exit(1); // Dừng chạy ứng dụng nếu lỗi
    }
};

module.exports = connectDB;
