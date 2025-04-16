﻿﻿﻿﻿
const express = require('express');
const passport = require('passport');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Register route
router.post('/register', registerUser);

// Get register form
router.get('/register', (req, res) => {
  res.render('register', { title: '회원가입' });
});

// Login route
router.post('/login', loginUser);

// Get login form
router.get('/login', (req, res) => {
  res.render('login', { title: '로그인' });
});

// Google login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// 카카오 로그인
router.get('/kakao', passport.authenticate('kakao'));

// 구글 로그인 콜백
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  });

// 카카오 로그인 콜백
router.get('/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  });

module.exports = router;
