// npm install passport passport-google-oauth20 passport-kakao express-session
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const Users = require('../models/Users'); // Users 모델 경로

passport.serializeUser((user, done) => {
  done(null, user.id); // 세션에 사용자 ID 저장
});

passport.deserializeUser((id, done) => {
  Users.findById(id, (err, user) => {
    done(err, user);
  });
});

// 구글 로그인 전략
passport.use(new GoogleStrategy({
  clientID: 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
  callbackURL: 'YOUR_GOOGLE_CALLBACK_URL'
}, (accessToken, refreshToken, profile, done) => {
  Users.findOrCreate({
    where: { googleId: profile.id },
    defaults: { name: profile.displayName, email: profile.emails[0].value }
  }).then(user => done(null, user));
}));

// 카카오 로그인 전략
passport.use(new KakaoStrategy({
  clientID: 'YOUR_KAKAO_CLIENT_ID',
  clientSecret: 'YOUR_KAKAO_CLIENT_SECRET',
  callbackURL: 'YOUR_KAKAO_CALLBACK_URL'
}, (accessToken, refreshToken, profile, done) => {
  Users.findOrCreate({
    where: { kakaoId: profile.id },
    defaults: { name: profile.displayName, email: profile._json.kakao_account.email }
  }).then(user => done(null, user));
}));
