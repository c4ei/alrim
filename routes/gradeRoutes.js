const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');

router.get('/', gradeController.getAllGrades);
router.post('/', gradeController.createGrade);
router.get('/:id', gradeController.getGradeById);
router.get('/student/:student_id', gradeController.getGradeByStudentId);
router.put('/:id', gradeController.updateGrade);
router.delete('/:id', gradeController.deleteGrade);

module.exports = router;
