const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');

// 약 먹이는 시간 확인 라우트
router.get('/medication_time', medicationController.getMedicationTime);

module.exports = router;
