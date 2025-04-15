
const express = require('express');
const passport = require('passport');
const router = express.Router();

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
    res.redirect('/');
  });

// 카카오 로그인 콜백
router.get('/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  });

module.exports = router;
