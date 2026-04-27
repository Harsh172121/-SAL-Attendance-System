/* global require, module */
const express = require('express');
const router = express.Router();

const { protect, teacherOnly, hodOnly } = require('../middleware');
const {
  createProxyRequest,
  getHodRequests,
  updateProxyStatus,
  getMyProxyLectures,
  getProxyFacultyOptions,
  getMyProxyRequests,
  getProxySuggestions
} = require('../controllers/proxyController');

router.use(protect);

router.post('/request', teacherOnly, createProxyRequest);
router.get('/faculty-options', teacherOnly, getProxyFacultyOptions);
router.get('/my-lectures', teacherOnly, getMyProxyLectures);
router.get('/my-requests', teacherOnly, getMyProxyRequests);
router.get('/suggestions', teacherOnly, getProxySuggestions);
router.get('/hod-requests', hodOnly, getHodRequests);
router.put('/update-status/:requestId', hodOnly, updateProxyStatus);

module.exports = router;

