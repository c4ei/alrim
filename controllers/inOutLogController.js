// controllers/inOutLogController.js
const db = require('../config/db');

const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

exports.createInOutLog = async (req, res) => {
  try {
    const { student_id, check_in_time, check_out_time, memo } = req.body;

    if (!Number.isInteger(Number(student_id))) {
      return res.status(400).json({ message: 'Invalid student_id' });
    }

    if (isNaN(new Date(check_in_time).getTime())) {
      return res.status(400).json({ message: 'Invalid check_in_time' });
    }

    if (isNaN(new Date(check_out_time).getTime())) {
      return res.status(400).json({ message: 'Invalid check_out_time' });
    }

    const sql = 'INSERT INTO in_out_log (student_id, check_in_time, check_out_time, memo) VALUES (?, ?, ?, ?)';
    const values = [student_id, check_in_time, check_out_time, memo];

    db.query(sql, values, async (err, result) => {
      if (err) {
        console.error('Error creating in/out log:', err);
        return res.status(500).json({ message: 'Failed to create in/out log' });
      }
      console.log('In/out log created successfully');
      res.status(201).json({ message: 'In/out log created successfully', logId: result.insertId });

      // 카카오톡 메시지 보내기
      try {
        const kakaoAdminKey = process.env.KAKAO_ADMIN_KEY;
        const kakaoMessage = `[등하원 알림] 학생 ID: ${student_id}, 등원 시간: ${check_in_time}, 하원 시간: ${check_out_time}, 메모: ${memo || '내용 없음'}`;

        const kakaoApiUrl = 'https://kapi.kakao.com/v2/api/talk/memo/default/send';
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `KakaoAK ${kakaoAdminKey}`
        };
        const params = new URLSearchParams();
        params.append('template_object', JSON.stringify({
          object_type: 'text',
          text: kakaoMessage,
          link: {
            mobile_web_url: 'https://developers.kakao.com',
            web_url: 'https://developers.kakao.com'
          }
        }));

        const response = await axios.post(kakaoApiUrl, params, { headers });
        console.log('Kakao message sent successfully:', response.data);
      } catch (error) {
        console.error('Error sending Kakao message:', error);
      }
    });
  } catch (error) {
    console.error('Error creating in/out log:', error);
    res.status(500).json({ message: 'Failed to create in/out log' });
  }
};

exports.getInOutLogsByStudent = async (req, res) => {
  try {
    const { student_id } = req.params;

    if (!Number.isInteger(Number(student_id))) {
      return res.status(400).json({ message: 'Invalid student_id' });
    }

    const sql = 'SELECT * FROM in_out_log WHERE student_id = ?';
    const values = [student_id];

    db.query(sql, values, (err, results) => {
      if (err) {
        console.error('Error fetching in/out logs:', err);
        return res.status(500).json({ message: 'Failed to fetch in/out logs' });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error('Error fetching in/out logs:', error);
    res.status(500).json({ message: 'Failed to fetch in/out logs' });
  }
};
