// data/students.js
const students = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        age: 20
    },
    {
        id: 2,
        name: "Trần Thị B",
        email: "tranthib@example.com",
        age: 21
    },
    {
        id: 3,
        name: "Lê Văn C",
        email: "levanc@example.com",
        age: 22
    }
];

let currentId = 4;

module.exports = { students, currentId };