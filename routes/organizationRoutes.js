const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

// 기관 등록
router.post('/register_organization', organizationController.registerOrganization);

// 기관 정보 조회 (기관 이름으로)
router.get('/organizations/:organization_name', (req, res) => {
  const organization_name = decodeURIComponent(req.params.organization_name);
  organizationController.getOrganizationByName(req, res);
});

module.exports = router;
