const express = require('express');
const mongoose = require('mongoose');
const BlogPost = require('./models/BlogPost');
const app = express();
app.use(express.static('public'));
// Cấu hình Middleware & View Engine
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Kết nối MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/blogDB')
    .then(() => console.log('Kết nối MongoDB thành công'))
    .catch((err) => console.error('Lỗi kết nối:', err));

// --- CÁC ROUTES ---

// 1. Trang chủ: Liệt kê bài viết
app.get('/', async (req, res) => {
    // Thêm .sort({ _id: -1 }) để xếp bài mới nhất lên đầu
    const posts = await BlogPost.find({}).sort({ _id: -1 });
    res.render('index', { posts });
});

app.get('/blogposts/delete/:id', async (req, res) => {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

// Route hiển thị trang sửa
app.get('/blogposts/edit/:id', async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    res.render('edit', { post });
});

// Route xử lý cập nhật dữ liệu
app.post('/blogposts/update/:id', async (req, res) => {
    await BlogPost.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body
    });
    res.redirect('/blogposts/' + req.params.id); // Về trang chi tiết sau khi sửa
});

// 2. Trang tạo mới: Hiển thị form
app.get('/blogposts/new', (req, res) => {
    res.render('create');
});

// 3. Xử lý lưu bài viết (POST)
app.post('/blogposts/store', async (req, res) => {
    await BlogPost.create(req.body);
    res.redirect('/');
});

// 4. Trang chi tiết bài viết
app.get('/blogposts/:id', async (req, res) => {
    const post = await BlogPost.findById(req.params.id);
    res.render('detail', { post });
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));