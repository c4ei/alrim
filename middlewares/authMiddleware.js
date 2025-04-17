const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const { fn_logVisitor, getUserByEmail } = require('../util/co_util');

async function authMiddleware(req, res, next) {
    const token = req.cookies.token;

    // Initialize locals with defaults
    res.locals.usersTbl = null;
    res.locals.isAdmin = false;

    if (!token) {
        await fn_logVisitor(req, 'NotLogIn');
        // 토큰이 없으면 로그인 페이지로 리다이렉트
        // HTML 요청인지 확인하여 리다이렉트 또는 401 응답
        if (req.accepts('html')) {
            return res.redirect('/users/login?error=' + encodeURIComponent('로그인이 필요합니다.'));
        } else {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        res.locals.isAdmin = req.user && req.user.userType === 'A';

        // --- Fetch user-specific data ---
        // Check if essential user info exists in token before proceeding
        if (req.user && req.user.email) {
            try {
                // Fetch DB data first
                const usersTbl = await getUserByEmail(req.user.email);
                res.locals.usersTbl = usersTbl; // Set DB data
            } catch (fetchError) {
                // Catch errors from getUserByEmail
                console.error('Error fetching user data in authMiddleware:', fetchError);
                // Keep defaults for res.locals.aah_balance and res.locals.usesTokens
                // usersTbl might be null if getUserByEmail failed
            }
        } else {
            console.error("User email missing in JWT token.");
            // Keep defaults for res.locals
            // 토큰은 유효하지만 필수 정보가 없는 경우, 재로그인 유도
             throw new Error("Incomplete user data in token.");
        }
        // --- End Fetch user-specific data ---

        // 모든 데이터 로딩 후 다음 미들웨어 호출
        next();

    } catch (err) { // Catch JWT verification errors or thrown error
        console.error('JWT verification failed:', err.message);
        res.clearCookie('token');

        let message = '유효하지 않은 토큰입니다. 다시 로그인하세요.';
        let logMemo = 'InvalidToken';

        if (err.name === 'TokenExpiredError') {
            message = '로그인 시간이 만료되었습니다. 다시 로그인하세요.';
            logMemo = 'TokenExpired';
        } else if (err.message === "Incomplete user data in token.") {
            message = '사용자 정보가 불완전합니다. 다시 로그인하세요.';
            logMemo = 'IncompleteTokenData';
        } // ... other JWT error checks

        await fn_logVisitor(req, logMemo);

        // 유효하지 않은 토큰의 경우 로그인 페이지로 리다이렉트
        if (req.accepts('html')) {
            return res.redirect('/users/login?error=' + encodeURIComponent(message));
        } else {
            return res.status(401).json({ success: false, message: message });
        }
    }
}

module.exports = authMiddleware;
