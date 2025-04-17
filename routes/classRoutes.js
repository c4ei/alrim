const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');  // 클래스 컨트롤러

// 학급 목록 조회
const { isLogin } = require('../util/co_util');

// 학급 목록 조회
router.get('/classes', classController.getClasses);

// 학급 생성
router.post('/classes', isLogin, classController.createClass);

// 학급 정보 수정
router.put('/classes/:classId', isLogin, classController.updateClass);

// 학급 삭제
router.delete('/:classId', classController.deleteClass);

module.exports = router;
