const express = require('express');
const app = express();

// Cấu hình template engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Phục vụ file tĩnh
app.use(express.static('public'));

// Dữ liệu mẫu - Câu lạc bộ sinh viên
const clubs = [
    { 
        id: 1, 
        name: 'CLB Tin Học', 
        description: 'Câu lạc bộ dành cho sinh viên đam mê công nghệ thông tin, lập trình và phát triển phần mềm.',
        members: 45,
        category: 'Học thuật',
        founded: '2018',
        hot: true,
        image: '/images/clb-tinhoc.jpg',
        activities: ['Lập trình web', 'Giải thuật', 'Hackathon', 'Workshop công nghệ']
    },
    { 
        id: 2, 
        name: 'CLB Tiếng Anh', 
        description: 'Nơi sinh viên rèn luyện kỹ năng tiếng Anh giao tiếp, luyện thi IELTS và TOEIC.',
        members: 60,
        category: 'Ngoại ngữ',
        founded: '2019',
        hot: false,
        image: '/images/clb-tienganh.jpg',
        activities: ['English Speaking Club', 'IELTS Practice', 'Movie Night', 'Debate']
    },
    { 
        id: 3, 
        name: 'CLB Bóng Đá', 
        description: 'Sân chơi thể thao dành cho sinh viên yêu thích bóng đá, tổ chức giải đấu hàng năm.',
        members: 35,
        category: 'Thể thao',
        founded: '2017',
        hot: true,
        image: '/images/clb-bongda.jpg',
        activities: ['Giao lưu bóng đá', 'Giải vô địch sinh viên', 'Tập luyện hàng tuần']
    },
    { 
        id: 4, 
        name: 'CLB Âm Nhạc', 
        description: 'Tập hợp những sinh viên có niềm đam mê ca hát, chơi nhạc cụ và biểu diễn nghệ thuật.',
        members: 50,
        category: 'Nghệ thuật',
        founded: '2020',
        hot: false,
        image: '/images/clb-amnhac.jpg',
        activities: ['Đêm nhạc Acoustic', 'Dạy nhạc cụ', 'Biểu diễn văn nghệ']
    },
    { 
        id: 5, 
        name: 'CLB Tình Nguyện', 
        description: 'Hoạt động vì cộng đồng, tổ chức các chương trình thiện nguyện, tiếp sức mùa thi.',
        members: 80,
        category: 'Tình nguyện',
        founded: '2016',
        hot: true,
        image: '/images/clb-tinhnguyen.jpg',
        activities: ['Mùa hè xanh', 'Hiến máu nhân đạo', 'Phát quà cho trẻ em nghèo']
    }
];

// Route trang chủ
app.get('/', (req, res) => {
    // Lấy 3 CLB nổi bật nhất để hiển thị
    const featuredClubs = clubs.filter(club => club.hot).slice(0, 3);
    res.render('index', { 
        title: 'Trang chủ - CLB Sinh viên',
        featuredClubs: featuredClubs
    });
});

// Route trang danh sách
app.get('/list', (req, res) => {
    res.render('list', { 
        title: 'Danh sách câu lạc bộ',
        clubs: clubs
    });
});

// Route trang chi tiết động
app.get('/detail/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const club = clubs.find(c => c.id === id);
    
    if (!club) {
        return res.send('Không tìm thấy câu lạc bộ!');
    }
    
    res.render('detail', { 
        title: club.name,
        club: club
    });
});

// Route trang liên hệ
app.get('/contact', (req, res) => {
    res.render('contact', { 
        title: 'Liên hệ'
    });
});

// Khởi động server
app.listen(3000, () => {
    console.log('🚀 Server running at http://localhost:3000');
});