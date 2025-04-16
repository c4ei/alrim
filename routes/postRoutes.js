const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// 게시글 목록 조회
router.get('/posts', postController.index);

// 게시글 작성 페이지
router.get('/posts/new', postController.new);

// 게시글 작성
router.post('/posts', postController.create);

// 특정 게시글 조회
router.get('/posts/:id', postController.show);

// 게시글 수정 페이지
router.get('/posts/:id/edit', postController.edit);

// 게시글 수정
router.put('/posts/:id', postController.update);

// 게시글 삭제
router.delete('/posts/:id', postController.delete);

module.exports = router;
