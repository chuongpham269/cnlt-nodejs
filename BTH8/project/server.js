// File: project/server.js (Bản chót - Express + Multer)
const express = require("express");
const multer = require("multer");
const app = express();

const fs = require("fs");

// --- 1. Tạo cỗ máy lưu trữ của Multer ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Hàm này trỏ folder mà file sẽ được ném vào (thư mục uploads)
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        // Hàm này băm tên file lại = thời điểm tải + tên nguyên gốc để chống bị trùng lật đè file
        cb(null, Date.now() + "-" + file.originalname)
    }
});

// --- 2. Bộ lọc (Middleware chặn file lại) ---
// array("many-files", 17): Đọc form mảng tải từ UI lên, chặn lại với tên thẻ input là many-files, chỉ được up max 17 file
const uploadManyFiles = multer({ storage: storage }).array("many-files", 17);

// --- 3. Trang chủ hiển thị Giao diện ---
app.get("/", (req, res) => {
    const htmlData = fs.readFileSync("./views/master.html", "utf8");
    res.send(htmlData);
});

// --- 4. Route tiến hành Xử lý Upload ---
app.post("/upload", (req, res) => {
    // Gọi hàm upload để can thiệp giữa server và client
    uploadManyFiles(req, res, (err) => {
        if (err) return res.send("Lỗi upload dồi anh bạn: " + err);
        // Trả trang đích sau khi kết thúc!
        res.send("Upload NHIEU file thanh cong vao thu muc uploads. Kiem tra nhe!");
    });
});

app.listen(8017, () => {
    console.log("Server Express chay tai http://localhost:8017");
});
