//controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const passport = require('passport');

// 회원 가입
const registerUser = async (req, res) => {
  const { username, password, email, role, organization } = req.body;

  try {
    const [userExists] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (userExists.length > 0) {
      return res.status(400).json({ msg: '이미 등록된 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute('INSERT INTO users (username, email, password, role, organization) VALUES (?, ?, ?, ?, ?)', [username, email, hashedPassword, role, organization]);
    res.status(201).json({ msg: '회원가입 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 로그인
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (user.length === 0) {
      return res.status(400).json({ msg: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const validPassword = await bcrypt.compare(password, user[0].password);

    if (!validPassword) {
      return res.status(400).json({ msg: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const token = jwt.sign({ user: { id: user[0].id, username: user[0].username, role: user[0].role } }, process.env.JWT_SECRET, { expiresIn: '1h' });

    if (user[0].role === 'teacher') {
      res.redirect('/teacher');
    } else {
      res.redirect('/student_album');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 구글 로그인
const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// 카카오 로그인
const kakaoLogin = passport.authenticate('kakao', {
  scope: ['profile', 'email']
});

module.exports = { registerUser, loginUser, googleLogin, kakaoLogin };
