/* global require, module */
const express = require('express');
const router = express.Router();

const { protect, teacherOnly } = require('../middleware');
const {
  createProxyRequest,
  getIncomingProxyRequests,
  getProxyNotifications,
  markProxyNotificationsRead,
  respondToProxyRequest,
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

// Direct-to-faculty proxy flow. Requests no longer pass through an HOD.
router.get('/incoming-requests', teacherOnly, getIncomingProxyRequests);
router.get('/notifications', teacherOnly, getProxyNotifications);
router.put('/notifications/read', teacherOnly, markProxyNotificationsRead);
router.put('/incoming-requests/:requestId/respond', teacherOnly, respondToProxyRequest);

module.exports = router;
