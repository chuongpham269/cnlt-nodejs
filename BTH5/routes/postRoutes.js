// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// --- ĐỊNH NGHĨA CÁC ĐƯỜNG DẪN ---

// Trang chủ: Hiển thị toàn bộ bài viết
router.get('/', postController.getAllPosts);

// Lưu bài viết mới (Cần đặt lệnh này lên trên các routes chứa tham số /:id để tránh hiểu lầm)
router.post('/blogposts/store', postController.storePost);

// Hiển thị form thêm bài mới
router.get('/blogposts/new', postController.createPostPage);

// Cập nhật dữ liệu
router.post('/blogposts/update/:id', postController.updatePost);

// Xoá bài viết
router.get('/blogposts/delete/:id', postController.deletePost);

// Hiển thị form sửa
router.get('/blogposts/edit/:id', postController.editPostPage);

// Xem chi tiết một bài viết
router.get('/blogposts/:id', postController.getPostDetail);

module.exports = router;
