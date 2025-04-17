//controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const passport = require('passport');

// 회원 가입
const registerUser = async (req, res) => {
  const { username, password, email, role, organization, organization_id } = req.body;

  try {
    const [userExists] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (userExists.length > 0) {
      return res.status(400).json({ msg: '이미 등록된 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute('INSERT INTO users (username, email, password, role, organization, shop_code) VALUES (?, ?, ?, ?, ?, ?)', [username, email, hashedPassword, role, organization, organization_id]);

    res.status(201).json({ msg: '회원가입 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류', error: error.toString() });
  }
};

// 로그인
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    console.log("user:", user);

    if (user.length === 0) {
      return res.status(400).json({ msg: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const validPassword = await bcrypt.compare(password, user[0].password);
    console.log("validPassword:", validPassword);

    if (!validPassword) {
      return res.status(400).json({ msg: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const userRole = user[0].role;

    if (!userRole) {
      return res.status(400).json({ msg: '사용자 역할이 설정되지 않았습니다.' });
    }

    const token = jwt.sign({ user: { user_id: user[0].user_id, username: user[0].username, role: userRole } }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1시간

    // res.json({ msg: '로그인 성공' });
    console.log("userRole:", userRole);
    if (userRole === 'teacher') {
      res.json({ msg: '로그인 성공', redirect: '/teacher_dashboard' });
    } else if (userRole === 'admin') {
      res.json({ msg: '로그인 성공', redirect: '/admin' });
    }
    else if (userRole === 'parent') {
      res.json({ msg: '로그인 성공', redirect: '/index' });
    }
     else {
      res.json({ msg: '로그인 성공', redirect: '/student_album' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류', error: error.toString() });
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
