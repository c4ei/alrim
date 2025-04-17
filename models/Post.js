// models/Post.js
module.exports = (db) => {
  return {
    getPosts: (userId) => {
      return db.query('SELECT * FROM posts WHERE author = ?', [userId]);
    },
    getPost: (id) => {
      return db.query('SELECT * FROM posts WHERE id = ?', [id]);
    },
    createPost: (title, content, isSecret, author) => {
      return db.query('INSERT INTO posts (title, content, isSecret, author) VALUES (?, ?, ?, ?)', [title, content, isSecret, author]);
    },
    updatePost: (id, title, content, isSecret) => {
      return db.query('UPDATE posts SET title = ?, content = ?, isSecret = ? WHERE id = ?', [title, content, isSecret, id]);
    },
    deletePost: (id) => {
      return db.query('DELETE FROM posts WHERE id = ?', [id]);
    },
    likePost: (id) => {
      return db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [id]);
    },
    repostPost: (id) => {
      return db.query('UPDATE posts SET reposts = reposts + 1 WHERE id = ?', [id]);
    }
  };
};
