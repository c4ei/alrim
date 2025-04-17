﻿// /kidsnote_3838/app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// 미들웨어 (Middleware)
const i18next = require('./config/i18n');

app.use(cors());
app.use((req, res, next) => {
  i18next.changeLanguage(req.query.lng || 'ko');
  res.locals.i18next = i18next;
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser()); // 쿠키사용
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// const expressLayouts = require('express-ejs-layouts');
// app.use(expressLayouts);
// app.set('layout', 'layout');

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
const inOutLogRoutes = require('./routes/inOutLogRoutes');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');  // 학생 관련 라우터
const albumRoutes = require('./routes/albumRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const postRoutes = require('./routes/postRoutes');
const methodOverride = require('method-override');
const organizationRoutes = require('./routes/organizationRoutes');

app.use('/', authRoutes);
app.use('/', organizationRoutes);
app.use('/api', classRoutes);
app.use('/', inOutLogRoutes);
app.use('/', medicationRoutes);
app.use(methodOverride('_method'));
app.use('/', postRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/albums', albumRoutes);
app.use('/grades', gradeRoutes);

app.get('/teacher', (req, res) => {
  res.render('teacher_dashboard', { title: '선생님 대시보드', i18next: i18next});
});

const studentController = require('./controllers/studentController');

app.get('/teacher_dashboard', async (req, res) => {
  try {
    const students = await studentController.getAllStudents(req, res);
    res.render('teacher_dashboard', { title: '선생님 대시보드', i18next: i18next, students: students});
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

app.set('view engine', 'ejs');

// 기본 페이지
app.get('/', (req, res) => {
  res.render('index', { title: 'KidsNote', i18next: i18next, user: req.user});
});

app.get('/private', (req, res) => {
  res.render('private', { title: '개인키 보기', i18next: i18next, user: req.user});
});

// 서버 시작
app.listen(process.env.PORT, () => {
  console.log(`✅ 서버 실행: http://localhost:${process.env.PORT}`);
});
