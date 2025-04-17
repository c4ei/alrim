const db = require('../config/db');
const Post = require('../models/Post')(db);

// 게시글 목록 조회
exports.index = async (req, res) => {
  try {
    const [posts, fields] = await Post.getPosts(req.user.user_id);
    res.render('posts/index', { posts });
  } catch (err) {
    res.status(500).send(err);
  }
};

// 게시글 작성 페이지
exports.new = (req, res) => {
  res.render('posts/new');
};

// 게시글 작성
exports.create = async (req, res) => {
  try {
    const { title, content, isSecret } = req.body;

    // 사용자 권한 확인 (선생님, 관리자 또는 부모님만 게시글 작성 가능)
    if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'parent') {
      return res.status(403).send("게시글 작성 권한이 없습니다.");
    }

    await Post.createPost(title, content, isSecret, req.user.user_id);
    res.redirect('/posts');
  } catch (err) {
    console.error("게시글 작성 오류:", err);
    res.status(500).send("게시글 작성 중 오류가 발생했습니다.");
  }
};

// 특정 게시글 조회
exports.show = async (req, res) => {
  try {
    const [posts, fields] = await Post.getPost(req.params.id);
    if (posts.length === 0) {
      return res.status(404).send('게시글을 찾을 수 없습니다.');
    }
    res.render('posts/show', { post: posts[0] });
  } catch (err) {
    res.status(500).send(err);
  }
};

// 게시글 수정 페이지
exports.edit = async (req, res) => {
  try {
    const [posts, fields] = await Post.getPost(req.params.id);
    if (posts.length === 0) {
      return res.status(404).send('게시글을 찾을 수 없습니다.');
    }
    res.render('posts/edit', { post: posts[0] });
  } catch (err) {
    res.status(500).send(err);
  }
};

// 게시글 수정
exports.update = async (req, res) => {
  try {
    const { title, content, isSecret } = req.body;
    await Post.updatePost(req.params.id, title, content, isSecret);
    res.redirect('/posts');
  } catch (err) {
    console.error("게시글 수정 오류:", err);
    res.status(500).send("게시글 수정 중 오류가 발생했습니다.");
  }
};

// 게시글 삭제
exports.delete = async (req, res) => {
  try {
    await Post.deletePost(req.params.id);
    res.redirect('/posts');
  } catch (err) {
    res.status(500).send(err);
  }
};

// 좋아요 기능
exports.like = async (req, res) => {
  try {
    await Post.likePost(req.params.id);
    res.redirect('/posts/' + req.params.id);
  } catch (err) {
    res.status(500).send(err);
  }
};

// 리포스트 기능
exports.repost = async (req, res) => {
  try {
    await Post.repostPost(req.params.id);
    res.redirect('/posts/' + req.params.id);
  } catch (err) {
    res.status(500).send(err);
  }
};
