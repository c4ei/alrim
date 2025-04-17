const express = require('express');
const router = express.Router();
const LearningAchievementController = require('../controllers/LearningAchievementController');

// 학생별 학습 성취도 조회
router.get('/students/:studentId/achievements', LearningAchievementController.getLearningAchievementsByStudent);

// 학습 성취도 생성
router.post('/achievements', LearningAchievementController.createLearningAchievement);

// 학습 성취도 수정
router.put('/achievements/:achievementId', LearningAchievementController.updateLearningAchievement);

// 학습 성취도 삭제
router.delete('/achievements/:achievementId', LearningAchievementController.deleteLearningAchievement);

module.exports = router;
