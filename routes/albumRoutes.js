const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');  // 앨범 컨트롤러

// 앨범 목록 조회
router.get('/albums', albumController.getAlbums);

// 앨범 생성
router.post('/albums', albumController.createAlbum);

// 앨범 수정
router.put('/albums/:albumId', albumController.updateAlbum);

// 앨범 삭제
router.delete('/albums/:albumId', albumController.deleteAlbum);

module.exports = router;