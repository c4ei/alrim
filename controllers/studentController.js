﻿// controllers/studentController.js
const pool = require('../config/db');

// 학생 등록
const registerStudent = async (req, res) => {
  const { name, classId, birthDate, allergyInfo, medicationInfo } = req.body;

  try {
    // 학생이 이미 존재하는지 확인
    const [existingStudent] = await pool.execute('SELECT * FROM students WHERE name = ? AND class_id = ?', [name, classId]);

    if (existingStudent.length > 0) {
      return res.status(400).json({ msg: '이미 등록된 학생입니다.' });
    }

    // 학생 등록
    await pool.execute('INSERT INTO students (name, class_id, birth_date, allergy_info, medication_info) VALUES (?, ?, ?, ?, ?)', 
      [name, classId, birthDate, allergyInfo, medicationInfo]);

    res.status(201).json({ msg: '학생 등록 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 학생 목록 조회
const getStudentsByClass = async (req, res) => {
  const { classId } = req.params;

  try {
    const [students] = await pool.execute('SELECT * FROM students WHERE class_id = ?', [classId]);

    if (students.length === 0) {
      return res.status(404).json({ msg: '학생이 없습니다.' });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 특정 학생 조회
const getStudentById = async (req, res) => {
  const { studentId } = req.params;

  try {
    const [student] = await pool.execute('SELECT * FROM students WHERE student_id = ?', [studentId]);

    if (student.length === 0) {
      return res.status(404).json({ msg: '학생을 찾을 수 없습니다.' });
    }

    res.status(200).json(student[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 학생 정보 수정
const updateStudent = async (req, res) => {
  const { studentId } = req.params;
  const { name, classId, birthDate, allergyInfo, medicationInfo } = req.body;

  try {
    const [existingStudent] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);

    if (existingStudent.length === 0) {
      return res.status(404).json({ msg: '학생을 찾을 수 없습니다.' });
    }

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
    const [existingStudent] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);

    if (existingStudent.length === 0) {
      return res.status(404).json({ msg: '학생을 찾을 수 없습니다.' });
    }

    await pool.execute('DELETE FROM students WHERE id = ?', [studentId]);
    res.status(200).json({ msg: '학생 삭제 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 학생 목록 조회 (전체)
const getAllStudents = async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT * FROM students');
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 이메일로 학생 정보 조회
const getStudentByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const [student] = await pool.execute('SELECT s.* FROM students s JOIN users u ON s.user_id = u.user_id WHERE u.email = ?', [email]);

    if (student.length === 0) {
      return res.status(404).json({ msg: '학생을 찾을 수 없습니다.' });
    }

    res.status(200).json(student[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

module.exports = { registerStudent, getStudentsByClass, getStudentById, updateStudent, deleteStudent, getAllStudents, getStudentByEmail };
