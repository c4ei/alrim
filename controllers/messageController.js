// controllers/messageController.js
const pool = require('../config/db');
const axios = require('axios');

// 등하원 문자 발송
const sendAttendanceMessage = async (req, res) => {
  const { studentId, messageType } = req.body; // messageType: '등원' or '하원'
  
  // 학생 정보 가져오기
  const [student] = await pool.execute('SELECT * FROM students WHERE id = ?', [studentId]);
  
  if (student.length === 0) {
    return res.status(404).json({ msg: '학생을 찾을 수 없습니다.' });
  }

  const studentName = student[0].name;
  const phoneNumber = student[0].phone_number;

  // 문자 메시지 내용 설정
  const message = `${studentName} 학생이 ${messageType}했습니다.`;

  try {
    // 문자 API 발송 요청 (예시로 카카오톡 메시지 API 사용)
    const response = await axios.post('https://api.kakao.com/send', {
      to: phoneNumber,
      message: message,
    });

    if (response.status === 200) {
      res.status(200).json({ msg: `${messageType} 문자 발송 성공` });
    } else {
      res.status(500).json({ msg: '문자 발송 실패' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 알림 발송 (푸시 메시지)
const sendPushNotification = async (req, res) => {
  const { userId, message } = req.body; // userId는 알림을 받을 사용자 ID
  
  try {
    // 사용자 정보 가져오기 (예시: FCM 토큰 가져오기)
    const [user] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (user.length === 0) {
      return res.status(404).json({ msg: '사용자를 찾을 수 없습니다.' });
    }

    const userToken = user[0].fcm_token;

    // FCM 푸시 알림 발송
    const response = await axios.post('https://fcm.googleapis.com/fcm/send', {
      to: userToken,
      notification: {
        title: '알림',
        body: message,
      },
    }, {
      headers: {
        'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      res.status(200).json({ msg: '푸시 알림 발송 성공' });
    } else {
      res.status(500).json({ msg: '푸시 알림 발송 실패' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

module.exports = { sendAttendanceMessage, sendPushNotification };
