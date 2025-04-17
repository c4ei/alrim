//controllers/classController.js
const pool = require('../config/db');

// 학급 생성
const { isLogin } = require('../util/co_util');

const createClass = async (req, res) => {
  const { className, teacherId } = req.body;

  try {
    const [existingClass] = await pool.execute('SELECT * FROM classes WHERE class_name = ?', [className]);

    if (existingClass.length > 0) {
      return res.status(400).json({ msg: '이미 존재하는 학급입니다.' });
    }

    const [existingTeacher] = await pool.execute('SELECT * FROM users WHERE user_id = ? AND role = "teacher"', [teacherId]);

    if (existingTeacher.length === 0) {
      return res.status(400).json({ msg: '존재하지 않는 선생님입니다.' });
    }

    await pool.execute('INSERT INTO classes (class_name, teacher_id) VALUES (?, ?)', [className, teacherId]);
    res.status(201).json({ msg: '학급 생성 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 학급 목록 조회
const getClasses = async (req, res) => {
  try {
    const [classes] = await pool.execute('SELECT * FROM classes');
    res.status(200).json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 특정 학급 조회
const getClassById = async (req, res) => {
  const { classId } = req.params;

  try {
    const [classDetails] = await pool.execute('SELECT * FROM classes WHERE id = ?', [classId]);

    if (classDetails.length === 0) {
      return res.status(404).json({ msg: '학급을 찾을 수 없습니다.' });
    }

    res.status(200).json(classDetails[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 학급 수정
const updateClass = async (req, res) => {
  const { classId } = req.params;
  const { className, teacherId } = req.body;

  try {
    const [existingClass] = await pool.execute('SELECT * FROM classes WHERE id = ?', [classId]);

    if (existingClass.length === 0) {
      return res.status(404).json({ msg: '학급을 찾을 수 없습니다.' });
    }

    await pool.execute('UPDATE classes SET class_name = ?, teacher_id = ? WHERE id = ?', [className, teacherId, classId]);
    res.status(200).json({ msg: '학급 수정 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 학급 삭제
const deleteClass = async (req, res) => {
  const { classId } = req.params;

  try {
    const [existingClass] = await pool.execute('SELECT * FROM classes WHERE id = ?', [classId]);

    if (existingClass.length === 0) {
      return res.status(404).json({ msg: '학급을 찾을 수 없습니다.' });
    }

    await pool.execute('DELETE FROM classes WHERE id = ?', [classId]);
    res.status(200).json({ msg: '학급 삭제 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

module.exports = { createClass, getClasses, getClassById, updateClass, deleteClass };
