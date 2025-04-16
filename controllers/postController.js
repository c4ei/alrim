const db = require('../config/db');

// 게시글 목록 조회
exports.index = async (req, res) => {
  try {
    const [posts, fields] = await db.query('SELECT * FROM posts');
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
    const [result, fields] = await db.query('INSERT INTO posts (title, content, isSecret, author) VALUES (?, ?, ?, ?)', [title, content, isSecret, req.user.user_id]);
    res.redirect('/posts');
  } catch (err) {
    res.status(500).send(err);
  }
};

// 특정 게시글 조회
exports.show = async (req, res) => {
  try {
    const [posts, fields] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
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
    const [posts, fields] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
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
    const [result, fields] = await db.query('UPDATE posts SET title = ?, content = ?, isSecret = ? WHERE id = ?', [title, content, isSecret, req.params.id]);
    res.redirect('/posts');
  } catch (err) {
    res.status(500).send(err);
  }
};

// 게시글 삭제
exports.delete = async (req, res) => {
  try {
    const [result, fields] = await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.redirect('/posts');
  } catch (err) {
    res.status(500).send(err);
  }
};
