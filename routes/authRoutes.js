﻿const express = require('express');
const passport = require('passport');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// 회원가입 라우트
router.post('/register', async (req, res) => {
  try {
    await registerUser(req, res);
    res.json({ msg: "회원가입 성공" });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// 회원가입 폼 가져오기
router.get('/register', (req, res) => {
  const title = '회원가입';
  res.render('register', { title: title }, (err, html) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    res.render('register', { title: title, body: html });
  });
});

// 로그인 라우트
router.post('/login', loginUser);

// 로그인 폼 가져오기
router.get('/login', (req, res) => {
  const title = '로그인';
  res.render('login', { title: title }, (err, html) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    res.render('login', { title: title, body: html });
  });
});

// 구글 로그인
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// 카카오 로그인
router.get('/kakao', passport.authenticate('kakao'));

// 구글 로그인 콜백
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/teacher');
  });

// 카카오 로그인 콜백
router.get('/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/teacher');
  });

router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
