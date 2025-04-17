// routes/inOutLogRoutes.js
const express = require('express');
const router = express.Router();
const inOutLogController = require('../controllers/inOutLogController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new in/out log
router.post('/', inOutLogController.createInOutLog);

// Get all in/out logs for a specific student
router.get('/:student_id', inOutLogController.getInOutLogsByStudent);

module.exports = router;
