// controllers/teacherController.js
const pool = require('../config/db');

// 선생님 로그인
const teacherLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [teacher] = await pool.execute('SELECT * FROM teachers WHERE username = ?', [username]);

    if (teacher.length === 0) {
      return res.status(404).json({ msg: '사용자를 찾을 수 없습니다.' });
    }

    // 비밀번호 확인 (예시로 bcrypt 사용)
    const isPasswordValid = (password === teacher[0].password); // 실제 비밀번호 확인 로직은 bcrypt나 다른 방식으로 구현 필요

    if (!isPasswordValid) {
      return res.status(401).json({ msg: '잘못된 비밀번호' });
    }

    // JWT 토큰 생성
    const token = generateJwtToken(teacher[0].id);

    res.status(200).json({ msg: '로그인 성공', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 선생님 정보 조회
const getTeacherInfo = async (req, res) => {
  const teacherId = req.teacherId; // JWT로부터 추출된 선생님 ID

  try {
    const [teacher] = await pool.execute('SELECT * FROM teachers WHERE id = ?', [teacherId]);

    if (teacher.length === 0) {
      return res.status(404).json({ msg: '선생님 정보를 찾을 수 없습니다.' });
    }

    res.status(200).json(teacher[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 선생님이 담당 학생 목록 조회
const getStudentListByClass = async (req, res) => {
  const teacherId = req.teacherId; // 선생님 ID
  const classId = req.params.classId;

  try {
    const [students] = await pool.execute('SELECT * FROM students WHERE class_id = ? AND teacher_id = ?', [classId, teacherId]);

    if (students.length === 0) {
      return res.status(404).json({ msg: '학생이 없습니다.' });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 선생님이 학생의 학습 진도 및 성취율 조회
const getStudentProgress = async (req, res) => {
  const studentId = req.params.studentId;

  try {
    const [progress] = await pool.execute('SELECT * FROM learning_progress WHERE student_id = ?', [studentId]);

    if (progress.length === 0) {
      return res.status(404).json({ msg: '학습 진도가 없습니다.' });
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 선생님이 학생 정보 수정
const updateStudentProgress = async (req, res) => {
  const { studentId } = req.params;
  const { progress, achievementRate } = req.body;

  try {
    // 학생 진도 정보 수정
    await pool.execute('UPDATE learning_progress SET progress = ?, achievement_rate = ? WHERE student_id = ?',
      [progress, achievementRate, studentId]);

    res.status(200).json({ msg: '학생 학습 진도 수정 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

module.exports = { teacherLogin, getTeacherInfo, getStudentListByClass, getStudentProgress, updateStudentProgress };
