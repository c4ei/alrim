const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');  // 앨범 컨트롤러

// 학생 앨범 사진 업로드
router.post('/students/:studentId/albums', albumController.upload.single('image'), albumController.uploadStudentAlbum);

// 학급 앨범 사진 업로드
router.post('/classes/:classId/albums', albumController.upload.single('image'), albumController.uploadClassAlbum);

// 학생 앨범 사진 조회
router.get('/students/:studentId/albums', albumController.getStudentAlbum);

// 학급 앨범 사진 조회
router.get('/classes/:classId/albums', albumController.getClassAlbum);

// 학생 앨범 사진 삭제
router.delete('/students/albums/:photoId', albumController.deleteStudentAlbumPhoto);

// 학급 앨범 사진 삭제
router.delete('/classes/albums/:photoId', albumController.deleteClassAlbumPhoto);

module.exports = router;
