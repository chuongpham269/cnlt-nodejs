// controllers/postController.js
const BlogPost = require('../models/BlogPost');

// 1. Lấy danh sách bài viết (Trang chủ)
const getAllPosts = async (req, res) => {
    // Sắp xếp bài mới nhất lên trên
    const posts = await BlogPost.find({}).sort({ _id: -1 });
    res.render('index', { posts });
};

// 2. Hiển thị form tạo bài viết mới
const createPostPage = (req, res) => {
    res.render('create');
};

// 3. Xử lý logic lưu bài viết
const storePost = async (req, res) => {
    await BlogPost.create(req.body);
    res.redirect('/');
};

// 4. Lấy chi tiết một bài viết cụ thể
const getPostDetail = async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    res.render('detail', { post });
};

// 5. Hiển thị form sửa bài viết
const editPostPage = async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    res.render('edit', { post });
};

// 6. Xử lý logic cập nhật nội dung bài viết
const updatePost = async (req, res) => {
    await BlogPost.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body
    });
    res.redirect('/blogposts/' + req.params.id);
};

// 7. Xử lý logic xóa bài viết
const deletePost = async (req, res) => {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.redirect('/');
};

// Xuất tất cả các hàm ra để bên routes có thể dùng
module.exports = {
    getAllPosts,
    createPostPage,
    storePost,
    getPostDetail,
    editPostPage,
    updatePost,
    deletePost
};
