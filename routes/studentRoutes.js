// routes/studentRoutes.js

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');  // 학생 컨트롤러 임포트

// 학생 등록
router.post('/students', studentController.registerStudent);

// 특정 학급의 학생 목록 조회
router.get('/students/class/:classId', studentController.getStudentsByClass);

// 특정 학생 조회
router.get('/students/:studentId', studentController.getStudentById);

// 학생 정보 수정
router.put('/students/:studentId', studentController.updateStudent);

// 학생 삭제
router.delete('/students/:studentId', studentController.deleteStudent);

// 이메일로 학생 정보 조회
router.get('/students/email/:email', studentController.getStudentByEmail);

module.exports = router;
