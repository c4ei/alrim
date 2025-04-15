// controllers/adminController.js
const pool = require('../config/db');

// 관리자 로그인
const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [admin] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);

    if (admin.length === 0) {
      return res.status(404).json({ msg: '사용자를 찾을 수 없습니다.' });
    }

    // 비밀번호 확인 (예시로 bcrypt 사용)
    const isPasswordValid = (password === admin[0].password); // 실제 비밀번호 확인 로직은 bcrypt나 다른 방식으로 구현 필요

    if (!isPasswordValid) {
      return res.status(401).json({ msg: '잘못된 비밀번호' });
    }

    // JWT 토큰 생성
    const token = generateJwtToken(admin[0].id);

    res.status(200).json({ msg: '로그인 성공', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 관리자 정보 조회
const getAdminInfo = async (req, res) => {
  const adminId = req.adminId; // JWT로부터 추출된 관리자 ID

  try {
    const [admin] = await pool.execute('SELECT * FROM admins WHERE id = ?', [adminId]);

    if (admin.length === 0) {
      return res.status(404).json({ msg: '관리자 정보를 찾을 수 없습니다.' });
    }

    res.status(200).json(admin[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 관리자가 학생 정보를 수정
const updateStudentInfo = async (req, res) => {
  const { studentId } = req.params;
  const { name, classId, birthDate, allergyInfo, medicationInfo } = req.body;

  try {
    const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);

    if (student.length === 0) {
      return res.status(404).json({ msg: '학생을 찾을 수 없습니다.' });
    }

    // 학생 정보 수정
    await pool.execute('UPDATE students SET name = ?, class_id = ?, birth_date = ?, allergy_info = ?, medication_info = ? WHERE id = ?',
      [name, classId, birthDate, allergyInfo, medicationInfo, studentId]);

    res.status(200).json({ msg: '학생 정보 수정 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 학생 삭제
const deleteStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
    const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);

    if (student.length === 0) {
      return res.status(404).json({ msg: '학생을 찾을 수 없습니다.' });
    }

    // 학생 삭제
    await pool.execute('DELETE FROM students WHERE id = ?', [studentId]);

    res.status(200).json({ msg: '학생 삭제 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 관리자 학생 목록 조회
const getAllStudents = async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT * FROM students');

    if (students.length === 0) {
      return res.status(404).json({ msg: '학생이 없습니다.' });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 관리자가 학급 관리
const manageClass = async (req, res) => {
  const { classId, className, teacherId } = req.body;

  try {
    // 학급 정보 수정 또는 생성
    const [existingClass] = await pool.execute('SELECT * FROM classes WHERE id = ?', [classId]);

    if (existingClass.length === 0) {
      // 학급이 없으면 새로운 학급 추가
      await pool.execute('INSERT INTO classes (id, name, teacher_id) VALUES (?, ?, ?)', [classId, className, teacherId]);
      res.status(201).json({ msg: '학급 추가 성공' });
    } else {
      // 학급 정보 수정
      await pool.execute('UPDATE classes SET name = ?, teacher_id = ? WHERE id = ?', [className, teacherId, classId]);
      res.status(200).json({ msg: '학급 수정 성공' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

module.exports = { adminLogin, getAdminInfo, updateStudentInfo, deleteStudent, getAllStudents, manageClass };
