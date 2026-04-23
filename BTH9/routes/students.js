// routes/students.js
const express = require('express');
const router = express.Router();
const { students, currentId } = require('../data/students');

let studentsData = students;
let idCounter = currentId;

// Helper functions
const validateStudent = (student, isUpdate = false) => {
    const errors = [];

    if (!isUpdate || student.name !== undefined) {
        if (!student.name || student.name.trim().length < 2) {
            errors.push('Tên không được rỗng và phải có ít nhất 2 ký tự');
        }
    }

    if (!isUpdate || student.email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!student.email || !emailRegex.test(student.email)) {
            errors.push('Email không đúng định dạng');
        }
    }

    if (!isUpdate || student.age !== undefined) {
        if (student.age !== undefined && (student.age < 16 || student.age > 60)) {
            errors.push('Tuổi phải từ 16 đến 60');
        }
    }

    return errors;
};

const checkEmailExists = (email, excludeId = null) => {
    return studentsData.some(student =>
        student.email === email && student.id !== excludeId && !student.isDeleted
    );
};

// GET /students/stats - Thống kê tổng quan
router.get('/stats', (req, res) => {
    const total = studentsData.length;
    const activeStudents = studentsData.filter(s => !s.isDeleted);
    const active = activeStudents.length;
    const deleted = total - active;

    let averageAge = 0;
    if (active > 0) {
        const totalAge = activeStudents.reduce((sum, s) => sum + (s.age || 0), 0);
        averageAge = totalAge / active;
    }

    res.json({
        total,
        active,
        deleted,
        averageAge
    });
});

// GET /students/stats/class - Thống kê theo lớp
router.get('/stats/class', (req, res) => {
    const activeStudents = studentsData.filter(s => !s.isDeleted);
    const classCount = {};

    activeStudents.forEach(s => {
        const className = s.class || 'Unknown';
        if (!classCount[className]) {
            classCount[className] = 0;
        }
        classCount[className]++;
    });

    const result = Object.keys(classCount).map(className => ({
        class: className,
        count: classCount[className]
    }));

    res.json(result);
});

// GET /students - Danh sách sinh viên (tìm kiếm, lọc, sắp xếp, phân trang, không lấy data đã xóa)
router.get('/', (req, res) => {
    const { name, class: studentClass, sort, page = 1, limit = 10 } = req.query;

    let results = studentsData.filter(s => !s.isDeleted);

    if (name) {
        results = results.filter(s => s.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (studentClass) {
        results = results.filter(s => s.class === studentClass);
    }

    if (sort === 'age_desc') {
        results.sort((a, b) => (b.age || 0) - (a.age || 0));
    } else if (sort === 'age_asc') {
        results.sort((a, b) => (a.age || 0) - (b.age || 0));
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedStudents = results.slice(startIndex, endIndex);

    res.json({
        page: pageNum,
        limit: limitNum,
        total: results.length,
        data: paginatedStudents
    });
});

// GET /students/:id - Chi tiết sinh viên
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const student = studentsData.find(s => s.id === id && !s.isDeleted);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Không tìm thấy sinh viên'
        });
    }

    res.json({
        success: true,
        data: student
    });
});

// POST /students - Thêm sinh viên
router.post('/', (req, res) => {
    const { name, email, age, class: studentClass } = req.body || {};

    // Validate
    const errors = validateStudent({ name, email, age: age ? parseInt(age) : undefined });
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    // Check email exists
    if (checkEmailExists(email)) {
        return res.status(400).json({
            success: false,
            message: 'Email đã tồn tại'
        });
    }

    const newStudent = {
        id: idCounter++,
        name: name.trim(),
        email,
        age: age ? parseInt(age) : null,
        class: studentClass || null,
        isDeleted: false
    };

    studentsData.push(newStudent);

    res.status(201).json({
        success: true,
        data: newStudent,
        message: 'Thêm sinh viên thành công'
    });
});

// PUT /students/:id - Cập nhật sinh viên
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, email, age, class: studentClass } = req.body || {};
    
    const student = studentsData.find(s => s.id === id && !s.isDeleted);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Không tìm thấy sinh viên'
        });
    }

    // Validate
    const errors = validateStudent({ name, email, age: age !== undefined ? parseInt(age) : undefined }, true);
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    // Check email exists
    if (email && checkEmailExists(email, id)) {
        return res.status(400).json({
            success: false,
            message: 'Email đã tồn tại'
        });
    }

    // Update student
    if (name) student.name = name.trim();
    if (email) student.email = email;
    if (age !== undefined) student.age = parseInt(age);
    if (studentClass !== undefined) student.class = studentClass;

    res.json({
        success: true,
        data: student,
        message: 'Cập nhật sinh viên thành công'
    });
});

// DELETE /students/:id - Xóa sinh viên (Soft delete)
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const student = studentsData.find(s => s.id === id && !s.isDeleted);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Không tìm thấy sinh viên'
        });
    }

    // Soft delete: Đánh dấu isDeleted = true
    student.isDeleted = true;

    res.json({
        success: true,
        data: { id: student.id, isDeleted: true },
        message: 'Xóa sinh viên thành công'
    });
});

module.exports = router;