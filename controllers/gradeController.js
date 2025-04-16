const pool = require('../config/db');

exports.getAllGrades = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM grades');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
};

exports.createGrade = async (req, res) => {
  try {
    const { student_id, title, score, exam_date } = req.body;
    const [result] = await pool.query('INSERT INTO grades (student_id, title, score, exam_date) VALUES (?, ?, ?, ?)', [student_id, title, score, exam_date]);
    res.status(201).json({ id: result.insertId, message: '성적 생성 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
};

exports.getGradeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM grades WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '성적을 찾을 수 없습니다' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, title, score, exam_date } = req.body;
    const [result] = await pool.query('UPDATE grades SET student_id = ?, title = ?, score = ?, exam_date = ? WHERE id = ?', [student_id, title, score, exam_date, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '성적을 찾을 수 없습니다' });
    }
    res.json({ message: '성적 업데이트 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM grades WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '성적을 찾을 수 없습니다' });
    }
    res.json({ message: '성적 삭제 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
};
