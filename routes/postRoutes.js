const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

// 게시글 목록 조회
router.get('/posts', postController.index);

// 게시글 작성 페이지
router.get('/posts/new', postController.new);

// 게시글 작성
router.post('/posts', authMiddleware, postController.create);

// 특정 게시글 조회
router.get('/posts/:id', postController.show);

// 게시글 수정 페이지
router.get('/posts/:id/edit', postController.edit);

// 게시글 수정
router.put('/posts/:id', postController.update);

// 게시글 삭제
router.delete('/posts/:id', postController.delete);

// 좋아요
router.get('/posts/:id/like', postController.like);

// 리포스트
router.get('/posts/:id/repost', postController.repost);

module.exports = router;
