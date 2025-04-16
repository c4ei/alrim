// /kidsnote_3838/app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3838;

// 미들웨어
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 세션 & 패스포트 초기화
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// DB 연결
const db = require('./config/db');

// 라우터 연결
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');  // 학생 관련 라우터
const albumRoutes = require('./routes/albumRoutes');

app.use('/', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/albums', albumRoutes);

app.get('/teacher', (req, res) => {
  res.render('teacher_dashboard', { title: '선생님 대시보드' });
});

app.set('view engine', 'ejs');

// 기본 페이지
app.get('/', (req, res) => {
  res.render('index', { title: 'KidsNote' }, (err, html) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    res.render('layout', { title: 'KidsNote', body: html });
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 서버 실행: http://localhost:${PORT}`);
});
