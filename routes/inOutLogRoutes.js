const express = require('express');
const router = express.Router();
const inOutLogController = require('../controllers/inOutLogController');

// 등하원 관리 라우트
router.get('/drop_off_pick_up', inOutLogController.getInOutLogs);

module.exports = router;
