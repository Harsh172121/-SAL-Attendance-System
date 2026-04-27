/**
 * SAL Education - Import Routes
 *
 * Admin-only route for CSV/XML bulk import.
 */

const express = require('express');
const router = express.Router();
const { importEntityData } = require('../controllers/importController');
const { protect, adminOrElevated } = require('../middleware');

router.use(protect);
router.use(adminOrElevated);

router.post('/:entity', importEntityData);

module.exports = router;
