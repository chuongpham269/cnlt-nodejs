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

    return errors;
};

const checkEmailExists = (email, excludeId = null) => {
    return studentsData.some(student =>
        student.email === email && student.id !== excludeId
    );
};

// GET /students - Danh sách sinh viên (có phân trang)
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedStudents = studentsData.slice(startIndex, endIndex);

    const total = studentsData.length;
    const totalPages = Math.ceil(total / limit);

    res.json({
        success: true,
        data: paginatedStudents,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    });
});

// GET /students/search - Tìm kiếm sinh viên
router.get('/search', (req, res) => {
    const name = req.query.name;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng cung cấp tên để tìm kiếm'
        });
    }

    const filteredStudents = studentsData.filter(student =>
        student.name.toLowerCase().includes(name.toLowerCase())
    );

    res.json({
        success: true,
        data: filteredStudents,
        count: filteredStudents.length
    });
});

// GET /students/:id - Chi tiết sinh viên
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const student = studentsData.find(s => s.id === id);

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
    const { name, email, age } = req.body;

    // Validate
    const errors = validateStudent({ name, email });
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
        age: age || null
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
    const { name, email, age } = req.body;
    const studentIndex = studentsData.findIndex(s => s.id === id);

    if (studentIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Không tìm thấy sinh viên'
        });
    }

    // Validate
    const errors = validateStudent({ name, email }, true);
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
    if (name) studentsData[studentIndex].name = name.trim();
    if (email) studentsData[studentIndex].email = email;
    if (age !== undefined) studentsData[studentIndex].age = age;

    res.json({
        success: true,
        data: studentsData[studentIndex],
        message: 'Cập nhật sinh viên thành công'
    });
});

// DELETE /students/:id - Xóa sinh viên
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const studentIndex = studentsData.findIndex(s => s.id === id);

    if (studentIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Không tìm thấy sinh viên'
        });
    }

    const deletedStudent = studentsData.splice(studentIndex, 1)[0];

    res.json({
        success: true,
        data: deletedStudent,
        message: 'Xóa sinh viên thành công'
    });
});

module.exports = router;