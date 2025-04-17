// controllers/organizationController.js
const pool = require('../config/db');

// 기관 등록
const registerOrganization = async (req, res) => {
  const { organization_name, business_license_number } = req.body;

  try {
    const [existingOrganization] = await pool.execute('SELECT * FROM organizations WHERE business_license_number = ?', [business_license_number]);

    if (existingOrganization.length > 0) {
      return res.status(400).json({ msg: '이미 등록된 사업자등록증번호입니다.' });
    }

    await pool.execute('INSERT INTO organizations (organization_name, business_license_number) VALUES (?, ?)', [organization_name, business_license_number]);
    res.status(201).json({ msg: '기관 등록 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

// 기관 정보 조회 (기관 이름으로)
const getOrganizationByName = async (req, res) => {
  const { organization_name } = req.params;

  try {
    const [organization] = await pool.execute('SELECT * FROM organizations WHERE organization_name = ?', [organization_name]);

    if (organization.length === 0) {
      return res.status(404).json({ msg: '기관을 찾을 수 없습니다.' });
    }

    res.status(200).json(organization[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: '서버 오류' });
  }
};

module.exports = { registerOrganization, getOrganizationByName };
