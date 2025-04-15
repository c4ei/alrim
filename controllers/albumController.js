//controllers/albumController.js
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');

// 앨범 이미지 저장 경로 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/album'); // 업로드된 파일 저장 폴더
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    cb(null, Date.now() + fileExtension); // 고유한 이름으로 저장
  },
});

const upload = multer({ storage: storage });

// 학생 앨범 사진 업로드
const uploadStudentAlbum = async (req, res) => {
  const { studentId } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ msg: '파일을 첨부해주세요.' });
  }

  try {
    // 학생 앨범에 이미지 정보 저장
    const filePath = `/uploads/album/${req.file.filename}`;
    await pool.execute('INSERT INTO student_album (student_id, image_url) VALUES (?, ?)', [studentId, filePath]);

    res.status(200).json({ msg: '학생 앨범에 사진이 업로드되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 학급 앨범 사진 업로드
const uploadClassAlbum = async (req, res) => {
  const { classId } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ msg: '파일을 첨부해주세요.' });
  }

  try {
    // 학급 앨범에 이미지 정보 저장
    const filePath = `/uploads/album/${req.file.filename}`;
    await pool.execute('INSERT INTO class_album (class_id, image_url) VALUES (?, ?)', [classId, filePath]);

    res.status(200).json({ msg: '학급 앨범에 사진이 업로드되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 학생 앨범 사진 조회
const getStudentAlbum = async (req, res) => {
  const { studentId } = req.params;

  try {
    const [photos] = await pool.execute('SELECT * FROM student_album WHERE student_id = ?', [studentId]);

    if (photos.length === 0) {
      return res.status(404).json({ msg: '학생 앨범에 사진이 없습니다.' });
    }

    res.status(200).json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 학급 앨범 사진 조회
const getClassAlbum = async (req, res) => {
  const { classId } = req.params;

  try {
    const [photos] = await pool.execute('SELECT * FROM class_album WHERE class_id = ?', [classId]);

    if (photos.length === 0) {
      return res.status(404).json({ msg: '학급 앨범에 사진이 없습니다.' });
    }

    res.status(200).json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 앨범 사진 삭제 (학생 앨범)
const deleteStudentAlbumPhoto = async (req, res) => {
  const { photoId } = req.params;

  try {
    const [photo] = await pool.execute('SELECT * FROM student_album WHERE id = ?', [photoId]);

    if (photo.length === 0) {
      return res.status(404).json({ msg: '사진을 찾을 수 없습니다.' });
    }

    // 사진 삭제
    await pool.execute('DELETE FROM student_album WHERE id = ?', [photoId]);

    res.status(200).json({ msg: '학생 앨범 사진이 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 앨범 사진 삭제 (학급 앨범)
const deleteClassAlbumPhoto = async (req, res) => {
  const { photoId } = req.params;

  try {
    const [photo] = await pool.execute('SELECT * FROM class_album WHERE id = ?', [photoId]);

    if (photo.length === 0) {
      return res.status(404).json({ msg: '사진을 찾을 수 없습니다.' });
    }

    // 사진 삭제
    await pool.execute('DELETE FROM class_album WHERE id = ?', [photoId]);

    res.status(200).json({ msg: '학급 앨범 사진이 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

module.exports = {
  uploadStudentAlbum,
  uploadClassAlbum,
  getStudentAlbum,
  getClassAlbum,
  deleteStudentAlbumPhoto,
  deleteClassAlbumPhoto,
  upload,
};
