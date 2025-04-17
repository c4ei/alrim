const db = require('../config/db');

exports.getLearningAchievementsByStudent = async (req, res) => {
  const studentId = req.params.studentId;

  db.query('SELECT * FROM learning_achievements WHERE student_id = ?', [studentId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to get learning achievements' });
    }
    res.status(200).json(results);
  });
};

exports.createLearningAchievement = async (req, res) => {
  const { studentId, subject, achievementLevel, date } = req.body;

  db.query('INSERT INTO learning_achievements (student_id, subject, achievement_level, date) VALUES (?, ?, ?, ?)',
    [studentId, subject, achievementLevel, date], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to create learning achievement' });
      }
      res.status(201).json({ message: 'Learning achievement created successfully', achievementId: result.insertId });
    });
};

exports.updateLearningAchievement = async (req, res) => {
  const { achievementId } = req.params;
  const { subject, achievementLevel, date } = req.body;

  db.query('UPDATE learning_achievements SET subject = ?, achievement_level = ?, date = ? WHERE achievement_id = ?',
    [subject, achievementLevel, date, achievementId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update learning achievement' });
      }
      res.status(200).json({ message: 'Learning achievement updated successfully' });
    });
};

exports.deleteLearningAchievement = async (req, res) => {
  const { achievementId } = req.params;

  db.query('DELETE FROM learning_achievements WHERE achievement_id = ?', [achievementId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to delete learning achievement' });
    }
    res.status(200).json({ message: 'Learning achievement deleted successfully' });
  });
};
