/**
 * SAL Education - Batch Routes
 * 
 * Admin-only routes for batch management.
 */

const express = require('express');
const router = express.Router();
const {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchesByClass,
  getStudentsByBatch
} = require('../controllers/batchController');
const { protect, adminOrElevated } = require('../middleware');

// All routes require authentication and admin (or elevated teacher) role
router.use(protect);
router.use(adminOrElevated);

router.route('/')
  .get(getAllBatches)
  .post(createBatch);

router.get('/class/:classId', getBatchesByClass);

router.route('/:id')
  .get(getBatchById)
  .put(updateBatch)
  .delete(deleteBatch);

router.get('/:id/students', getStudentsByBatch);

module.exports = router;
